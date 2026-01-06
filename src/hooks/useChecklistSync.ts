import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedChecklistState, BugItem } from '@/types/checklist';
import { useToast } from '@/hooks/use-toast';

export interface QaChecklist {
  id: string;
  name: string;
  checklist_data: EnhancedChecklistState;
  stats: Record<string, number>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QaFixPrompt {
  id: string;
  checklist_id: string;
  prompt_text: string;
  issues_included: BugItem[];
  generated_at: string;
  resolution_status: string;
  resolution_notes: string | null;
  resolved_at: string | null;
}

export interface QaResolutionHistory {
  id: string;
  fix_prompt_id: string;
  issue_key: string;
  issue_category: string;
  original_status: string;
  original_notes: string | null;
  new_status: string;
  resolution_notes: string | null;
  verified_at: string;
}

const defaultState: EnhancedChecklistState = {
  routes: {},
  tables: {},
  functions: {},
  flows: {},
  features: {},
};

export const useChecklistSync = (localState: EnhancedChecklistState) => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [activeChecklistId, setActiveChecklistId] = useState<string | null>(null);
  const [checklistName, setChecklistName] = useState('Untitled Checklist');
  const [savedChecklists, setSavedChecklists] = useState<QaChecklist[]>([]);
  const [fixPrompts, setFixPrompts] = useState<QaFixPrompt[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user's checklists when authenticated
  useEffect(() => {
    if (userId) {
      loadSavedChecklists();
    } else {
      setSavedChecklists([]);
      setActiveChecklistId(null);
      setInitialLoadComplete(true);
    }
  }, [userId]);

  // Track changes
  useEffect(() => {
    if (initialLoadComplete && lastSavedState) {
      const currentState = JSON.stringify(localState) + checklistName;
      setHasUnsavedChanges(currentState !== lastSavedState);
    }
  }, [localState, checklistName, initialLoadComplete, lastSavedState]);

  // Load saved checklists
  const loadSavedChecklists = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('qa_checklists')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const typedData: QaChecklist[] = (data || []).map(item => ({
        ...item,
        checklist_data: item.checklist_data as unknown as EnhancedChecklistState,
        stats: item.stats as unknown as Record<string, number>,
      }));
      
      setSavedChecklists(typedData);
      setInitialLoadComplete(true);
    } catch (err) {
      console.error('Failed to load checklists:', err);
      setInitialLoadComplete(true);
    }
  };

  // Load fix prompts for active checklist
  const loadFixPrompts = async (checklistId: string) => {
    try {
      const { data, error } = await supabase
        .from('qa_fix_prompts')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      
      const typedData: QaFixPrompt[] = (data || []).map(item => ({
        ...item,
        issues_included: item.issues_included as unknown as BugItem[],
      }));
      
      setFixPrompts(typedData);
    } catch (err) {
      console.error('Failed to load fix prompts:', err);
    }
  };

  // Save to cloud
  const saveToCloud = useCallback(async (state: EnhancedChecklistState, stats: Record<string, number>) => {
    if (!userId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save to cloud',
        variant: 'destructive',
      });
      return null;
    }

    setSyncing(true);
    try {
      let result;
      if (activeChecklistId) {
        // Update existing
        const { data, error } = await supabase
          .from('qa_checklists')
          .update({
            name: checklistName,
            checklist_data: JSON.parse(JSON.stringify(state)),
            stats: JSON.parse(JSON.stringify(stats)),
            status: 'active',
          })
          .eq('id', activeChecklistId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from('qa_checklists')
          .insert({
            user_id: userId,
            name: checklistName,
            checklist_data: JSON.parse(JSON.stringify(state)),
            stats: JSON.parse(JSON.stringify(stats)),
            status: 'active',
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
        setActiveChecklistId(result.id);
      }

      setLastSyncedAt(new Date());
      setLastSavedState(JSON.stringify(state) + checklistName);
      setHasUnsavedChanges(false);
      await loadSavedChecklists();
      
      toast({
        title: 'Saved to cloud',
        description: `Checklist "${checklistName}" saved successfully`,
      });

      return result.id;
    } catch (err) {
      console.error('Failed to save:', err);
      toast({
        title: 'Save failed',
        description: 'Could not save checklist to cloud',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSyncing(false);
    }
  }, [userId, activeChecklistId, checklistName, toast]);

  // Load from cloud
  const loadFromCloud = useCallback(async (id: string): Promise<EnhancedChecklistState | null> => {
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('qa_checklists')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setActiveChecklistId(data.id);
      setChecklistName(data.name);
      setLastSyncedAt(new Date(data.updated_at));
      
      const loadedState = data.checklist_data as unknown as EnhancedChecklistState;
      setLastSavedState(JSON.stringify(loadedState) + data.name);
      setHasUnsavedChanges(false);

      await loadFixPrompts(id);

      toast({
        title: 'Checklist loaded',
        description: `Loaded "${data.name}"`,
      });

      return loadedState;
    } catch (err) {
      console.error('Failed to load:', err);
      toast({
        title: 'Load failed',
        description: 'Could not load checklist from cloud',
        variant: 'destructive',
      });
      return null;
    } finally {
      setSyncing(false);
    }
  }, [toast]);

  // Delete checklist
  const deleteChecklist = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('qa_checklists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (activeChecklistId === id) {
        setActiveChecklistId(null);
        setChecklistName('Untitled Checklist');
        setFixPrompts([]);
      }

      await loadSavedChecklists();

      toast({
        title: 'Checklist deleted',
        description: 'The checklist has been removed',
      });
    } catch (err) {
      console.error('Failed to delete:', err);
      toast({
        title: 'Delete failed',
        description: 'Could not delete checklist',
        variant: 'destructive',
      });
    }
  }, [activeChecklistId, toast]);

  // Start new checklist
  const startNewChecklist = useCallback(() => {
    setActiveChecklistId(null);
    setChecklistName('Untitled Checklist');
    setFixPrompts([]);
    setLastSyncedAt(null);
    setHasUnsavedChanges(true);
    setLastSavedState('');
    return defaultState;
  }, []);

  // Save fix prompt
  const saveFixPrompt = useCallback(async (
    promptText: string, 
    issues: BugItem[],
    checklistId?: string
  ): Promise<string | null> => {
    const targetChecklistId = checklistId || activeChecklistId;
    if (!targetChecklistId) {
      console.warn('No active checklist to save prompt to');
      return null;
    }

    try {
      const insertData = {
        checklist_id: targetChecklistId,
        prompt_text: promptText,
        issues_included: JSON.parse(JSON.stringify(issues)),
        resolution_status: 'pending',
      };
      
      const { data, error } = await supabase
        .from('qa_fix_prompts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await loadFixPrompts(targetChecklistId);
      return data.id;
    } catch (err) {
      console.error('Failed to save fix prompt:', err);
      return null;
    }
  }, [activeChecklistId]);

  // Update prompt resolution
  const updatePromptResolution = useCallback(async (
    promptId: string,
    status: string,
    notes: string
  ) => {
    try {
      const { error } = await supabase
        .from('qa_fix_prompts')
        .update({
          resolution_status: status,
          resolution_notes: notes,
          resolved_at: status !== 'pending' ? new Date().toISOString() : null,
        })
        .eq('id', promptId);

      if (error) throw error;

      if (activeChecklistId) {
        await loadFixPrompts(activeChecklistId);
      }
    } catch (err) {
      console.error('Failed to update resolution:', err);
    }
  }, [activeChecklistId]);

  // Load resolution history
  const loadResolutionHistory = useCallback(async (promptId: string): Promise<QaResolutionHistory[]> => {
    try {
      const { data, error } = await supabase
        .from('qa_resolution_history')
        .select('*')
        .eq('fix_prompt_id', promptId)
        .order('verified_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Failed to load resolution history:', err);
      return [];
    }
  }, []);

  // Update issue resolution
  const updateIssueResolution = useCallback(async (
    promptId: string,
    issueKey: string,
    category: string,
    originalStatus: string,
    originalNotes: string,
    newStatus: string,
    notes: string
  ) => {
    try {
      const { error } = await supabase
        .from('qa_resolution_history')
        .insert({
          fix_prompt_id: promptId,
          issue_key: issueKey,
          issue_category: category,
          original_status: originalStatus,
          original_notes: originalNotes,
          new_status: newStatus,
          resolution_notes: notes,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to update issue resolution:', err);
    }
  }, []);

  return {
    userId,
    activeChecklistId,
    checklistName,
    setChecklistName,
    savedChecklists,
    fixPrompts,
    syncing,
    lastSyncedAt,
    hasUnsavedChanges,
    saveToCloud,
    loadFromCloud,
    deleteChecklist,
    startNewChecklist,
    saveFixPrompt,
    updatePromptResolution,
    loadResolutionHistory,
    updateIssueResolution,
    loadFixPrompts,
  };
};
