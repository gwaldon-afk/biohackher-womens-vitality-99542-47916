import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface UserExerciseProgram {
  id: string;
  user_id: string;
  program_key: string;
  start_date: string;
  current_week: number;
  current_day: number;
  is_active: boolean;
  setup_method: string;
  fitness_level: string | null;
  health_considerations: string[] | null;
  available_equipment: string[] | null;
  preferred_days_per_week: number | null;
  primary_goals: string[] | null;
  created_at: string;
  updated_at: string;
}

interface SaveProgramParams {
  programKey: string;
  setupMethod: 'smart_match' | 'build_your_own';
  fitnessLevel?: string;
  healthConsiderations?: string[];
  availableEquipment?: string[];
  preferredDaysPerWeek?: number;
  primaryGoals?: string[];
}

export function useExerciseProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [activeProgram, setActiveProgram] = useState<UserExerciseProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch the user's active program
  const fetchActiveProgram = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Use type assertion since types may not be regenerated yet
      const { data, error } = await (supabase
        .from('user_exercise_programs' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle() as any);

      if (error) throw error;
      setActiveProgram(data as UserExerciseProgram | null);
    } catch (error) {
      console.error('Error fetching active exercise program:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveProgram();
  }, [fetchActiveProgram]);

  // Save a new program (deactivates any existing active program)
  const saveProgram = useCallback(async (params: SaveProgramParams): Promise<boolean> => {
    if (!user) {
      toast({
        title: t('common.error'),
        description: t('exerciseWizard.loginRequired'),
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);

    try {
      // Deactivate any existing active programs
      const { error: deactivateError } = await (supabase
        .from('user_exercise_programs' as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', true) as any);

      if (deactivateError) throw deactivateError;

      // Insert the new program
      const { data, error: insertError } = await (supabase
        .from('user_exercise_programs' as any)
        .insert({
          user_id: user.id,
          program_key: params.programKey,
          setup_method: params.setupMethod,
          fitness_level: params.fitnessLevel || null,
          health_considerations: params.healthConsiderations || null,
          available_equipment: params.availableEquipment || null,
          preferred_days_per_week: params.preferredDaysPerWeek || null,
          primary_goals: params.primaryGoals || null,
          start_date: new Date().toISOString().split('T')[0],
          current_week: 1,
          current_day: 1,
          is_active: true,
        })
        .select()
        .single() as any);

      if (insertError) throw insertError;

      setActiveProgram(data as UserExerciseProgram);
      
      toast({
        title: t('exerciseWizard.programSaved'),
        description: t('exerciseWizard.programSavedDescription'),
      });

      return true;
    } catch (error) {
      console.error('Error saving exercise program:', error);
      toast({
        title: t('common.error'),
        description: t('exerciseWizard.saveFailed'),
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, toast, t]);

  // Update program progress (week/day)
  const updateProgress = useCallback(async (week: number, day: number): Promise<boolean> => {
    if (!user || !activeProgram) return false;

    try {
      const { error } = await (supabase
        .from('user_exercise_programs' as any)
        .update({ 
          current_week: week, 
          current_day: day,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeProgram.id) as any);

      if (error) throw error;

      setActiveProgram(prev => prev ? { ...prev, current_week: week, current_day: day } : null);
      return true;
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      return false;
    }
  }, [user, activeProgram]);

  // Check if user has an active program
  const hasActiveProgram = !!activeProgram;

  return {
    activeProgram,
    hasActiveProgram,
    loading,
    saving,
    saveProgram,
    updateProgress,
    refetch: fetchActiveProgram,
  };
}
