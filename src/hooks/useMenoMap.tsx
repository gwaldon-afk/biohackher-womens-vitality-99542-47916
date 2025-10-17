import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface MenopauseStage {
  id: string;
  user_id: string;
  stage: 'pre' | 'early-peri' | 'mid-peri' | 'late-peri' | 'post';
  confidence_score: number;
  calculated_at: string;
  assessment_id?: string;
  hormone_indicators?: any;
  created_at: string;
  updated_at: string;
}

export interface MenopauseSymptom {
  id: string;
  user_id: string;
  symptom_category: 'cycle' | 'thermoregulation' | 'mood' | 'energy' | 'libido' | 'skin';
  symptom_name: string;
  severity: number;
  tracked_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MenopauseInsight {
  id: string;
  user_id: string;
  insight_type: 'stage_change' | 'symptom_pattern' | 'protocol_suggestion' | 'lab_recommendation';
  title: string;
  description: string;
  action_items: any[];
  ai_generated: boolean;
  acknowledged: boolean;
  created_at: string;
  dismissed_at?: string;
}

export const useMenoMap = () => {
  const { user } = useAuth();
  const [currentStage, setCurrentStage] = useState<MenopauseStage | null>(null);
  const [symptoms, setSymptoms] = useState<MenopauseSymptom[]>([]);
  const [insights, setInsights] = useState<MenopauseInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMenoMapStatus();
      fetchCurrentStage();
      fetchRecentSymptoms();
      fetchInsights();
    }
  }, [user]);

  const fetchMenoMapStatus = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('menomap_enabled, menomap_onboarding_completed')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsEnabled(data.menomap_enabled || false);
    }
  };

  const enableMenoMap = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ menomap_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setIsEnabled(true);
      toast({
        title: "MenoMap Enabled",
        description: "Start your assessment to map your menopause journey."
      });
    } catch (error) {
      console.error('Error enabling MenoMap:', error);
      toast({
        title: "Error",
        description: "Failed to enable MenoMap",
        variant: "destructive"
      });
    }
  };

  const fetchCurrentStage = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('menopause_stages')
      .select('*')
      .eq('user_id', user.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setCurrentStage(data as MenopauseStage);
    }
  };

  const saveStage = async (stage: string, confidenceScore: number, assessmentId?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menopause_stages')
        .insert({
          user_id: user.id,
          stage,
          confidence_score: confidenceScore,
          assessment_id: assessmentId
        })
        .select()
        .single();

      if (error) throw error;

      // Update profile with current stage
      await supabase
        .from('profiles')
        .update({ current_menopause_stage: stage })
        .eq('user_id', user.id);

      setCurrentStage(data as MenopauseStage);
      
      toast({
        title: "Stage Calculated",
        description: `Your menopause stage has been identified.`
      });

      return data;
    } catch (error) {
      console.error('Error saving stage:', error);
      toast({
        title: "Error",
        description: "Failed to save menopause stage",
        variant: "destructive"
      });
    }
  };

  const fetchRecentSymptoms = async (days: number = 30) => {
    if (!user) return;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('menopause_symptom_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('tracked_date', startDate.toISOString().split('T')[0])
      .order('tracked_date', { ascending: false });

    if (data) {
      setSymptoms(data as MenopauseSymptom[]);
    }
  };

  const trackSymptom = async (
    category: string,
    symptomName: string,
    severity: number,
    notes?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('menopause_symptom_tracking')
        .insert({
          user_id: user.id,
          symptom_category: category,
          symptom_name: symptomName,
          severity,
          notes
        })
        .select()
        .single();

      if (error) throw error;

      await fetchRecentSymptoms();
      
      toast({
        title: "Symptom Tracked",
        description: `${symptomName} recorded successfully.`
      });

      return data;
    } catch (error) {
      console.error('Error tracking symptom:', error);
      toast({
        title: "Error",
        description: "Failed to track symptom",
        variant: "destructive"
      });
    }
  };

  const fetchInsights = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('menopause_insights')
      .select('*')
      .eq('user_id', user.id)
      .is('dismissed_at', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setInsights(data as MenopauseInsight[]);
    }
  };

  const acknowledgeInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('menopause_insights')
        .update({ acknowledged: true })
        .eq('id', insightId);

      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      console.error('Error acknowledging insight:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('menopause_insights')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
      await fetchInsights();
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  return {
    isEnabled,
    currentStage,
    symptoms,
    insights,
    loading,
    enableMenoMap,
    saveStage,
    trackSymptom,
    fetchRecentSymptoms,
    acknowledgeInsight,
    dismissInsight,
    refetch: () => {
      fetchCurrentStage();
      fetchRecentSymptoms();
      fetchInsights();
    }
  };
};
