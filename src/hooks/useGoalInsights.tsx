import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface GoalInsight {
  id: string;
  user_id: string;
  goal_id: string | null;
  insight_type: 'progress' | 'motivation' | 'barrier' | 'optimization' | 'celebration';
  title: string;
  description: string;
  action_suggestions: string[];
  severity: 'info' | 'warning' | 'celebration';
  acknowledged: boolean;
  dismissed_at: string | null;
  trigger_data: any;
  created_at: string;
  updated_at: string;
}

export const useGoalInsights = (goalId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch insights
  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['goal-insights', user?.id, goalId],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('goal_insights')
        .select('*')
        .eq('user_id', user.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false });

      if (goalId) {
        query = query.eq('goal_id', goalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as GoalInsight[];
    },
    enabled: !!user,
  });

  // Count unacknowledged insights
  const { data: unacknowledgedCount = 0 } = useQuery({
    queryKey: ['goal-insights-unacknowledged', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('goal_insights')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .is('dismissed_at', null);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Generate insights
  const generateInsights = useMutation({
    mutationFn: async ({ goalId, triggerType = 'manual' }: { goalId: string; triggerType?: string }) => {
      const { data, error } = await supabase.functions.invoke('generate-goal-insights', {
        body: { goalId, triggerType },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('New insights generated!');
      queryClient.invalidateQueries({ queryKey: ['goal-insights'] });
    },
    onError: (error: Error) => {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    },
  });

  // Mark as acknowledged
  const markAsAcknowledged = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('goal_insights')
        .update({ acknowledged: true })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goal-insights'] });
    },
  });

  // Dismiss insight
  const dismissInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('goal_insights')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Insight dismissed');
      queryClient.invalidateQueries({ queryKey: ['goal-insights'] });
    },
  });

  return {
    insights,
    isLoading,
    unacknowledgedCount,
    generateInsights: generateInsights.mutate,
    isGenerating: generateInsights.isPending,
    markAsAcknowledged: markAsAcknowledged.mutate,
    dismissInsight: dismissInsight.mutate,
  };
};
