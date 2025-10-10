import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Insight {
  id: string;
  user_id: string;
  insight_type: 'weekly_summary' | 'anomaly_detected' | 'protocol_suggestion' | 'trend_analysis';
  category: 'sleep' | 'stress' | 'activity' | 'nutrition' | 'overall';
  title: string;
  description: string;
  recommendations: string[];
  data_points: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_viewed: boolean;
  is_dismissed: boolean;
  generated_at: string;
  viewed_at: string | null;
  created_at: string;
}

export const useInsights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading } = useQuery({
    queryKey: ['user-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('is_dismissed', false)
        .order('generated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Insight[];
    },
  });

  const { data: unviewedCount } = useQuery({
    queryKey: ['unviewed-insights-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_insights')
        .select('*', { count: 'exact', head: true })
        .eq('is_viewed', false)
        .eq('is_dismissed', false);

      if (error) throw error;
      return count || 0;
    },
  });

  const generateInsights = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('generate-insights');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-insights'] });
      queryClient.invalidateQueries({ queryKey: ['unviewed-insights-count'] });
      toast({
        title: "Insights Generated",
        description: data.message || "Your personalized insights are ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  const markAsViewed = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('user_insights')
        .update({ is_viewed: true, viewed_at: new Date().toISOString() })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-insights'] });
      queryClient.invalidateQueries({ queryKey: ['unviewed-insights-count'] });
    },
  });

  const dismissInsight = useMutation({
    mutationFn: async (insightId: string) => {
      const { error } = await supabase
        .from('user_insights')
        .update({ is_dismissed: true })
        .eq('id', insightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-insights'] });
      queryClient.invalidateQueries({ queryKey: ['unviewed-insights-count'] });
      toast({
        title: "Insight Dismissed",
        description: "You can generate new insights anytime",
      });
    },
  });

  return {
    insights: insights || [],
    unviewedCount: unviewedCount || 0,
    isLoading,
    generateInsights: generateInsights.mutate,
    isGenerating: generateInsights.isPending,
    markAsViewed: markAsViewed.mutate,
    dismissInsight: dismissInsight.mutate,
  };
};
