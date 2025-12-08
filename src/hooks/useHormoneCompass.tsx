// Renamed from useMenoMap to useHormoneCompass
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface HormoneCompassStage {
  id: string;
  user_id: string;
  stage: string;
  confidence_score: number;
  assessment_id: string;
  calculated_at: string;
  hormone_indicators: any;
  created_at: string;
  updated_at: string;
}

interface HormoneCompassSymptom {
  id: string;
  user_id: string;
  symptom_category: string;
  symptom_name: string;
  severity: number;
  tracked_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface HormoneCompassInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string;
  action_items: any;
  acknowledged: boolean;
  ai_generated: boolean;
  created_at: string;
  dismissed_at?: string;
}

export const useHormoneCompass = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Check if hormone compass is enabled (fallback to energy_loop_enabled for now)
  const isEnabled = (profile as any)?.hormone_compass_enabled || false;

  // Fetch current stage
  const { data: currentStage, isLoading: stageLoading } = useQuery({
    queryKey: ['hormone-compass-stage', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('hormone_compass_stages')
        .select('*')
        .eq('user_id', user.id)
        .order('calculated_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch recent symptoms
  const { data: symptoms, isLoading: symptomsLoading } = useQuery({
    queryKey: ['hormone-compass-symptoms', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('hormone_compass_symptom_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('tracked_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Fetch active insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['hormone-compass-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('hormone_compass_insights')
        .select('*')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  // Track new symptom
  const trackSymptom = useMutation({
    mutationFn: async (symptom: Partial<HormoneCompassSymptom>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('hormone_compass_symptom_tracking')
        .insert({
          symptom_category: (symptom as any).symptom_category || 'general',
          symptom_name: (symptom as any).symptom_name || '',
          severity: symptom.severity || 0,
          notes: symptom.notes,
          user_id: user.id,
          tracked_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hormone-compass-symptoms'] });
    }
  });

  // Dismiss insight
  const dismissInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('hormone_compass_insights')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hormone-compass-insights'] });
    }
  });

  return {
    isEnabled,
    currentStage,
    symptoms: symptoms || [],
    insights: insights || [],
    isLoading: stageLoading || symptomsLoading || insightsLoading,
    trackSymptom: trackSymptom.mutateAsync,
    dismissInsight: dismissInsight.mutateAsync
  };
};
