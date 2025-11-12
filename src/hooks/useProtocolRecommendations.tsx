import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ProtocolRecommendation {
  id: string;
  user_id: string;
  source_assessment_id: string;
  source_type: 'hormone_compass' | 'lis' | 'symptom' | 'goal';
  protocol_data: any;
  status: 'pending' | 'accepted' | 'dismissed' | 'partially_accepted';
  created_at: string;
  dismissed_at: string | null;
  accepted_at: string | null;
  notes: string | null;
}

interface UseProtocolRecommendationsOptions {
  status?: 'pending' | 'accepted' | 'dismissed' | 'partially_accepted' | ('dismissed' | 'partially_accepted')[];
  sourceType?: 'hormone_compass' | 'lis' | 'symptom' | 'goal';
}

export const useProtocolRecommendations = (options?: UseProtocolRecommendationsOptions) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch protocol recommendations
  const { data: recommendations, isLoading, error, refetch } = useQuery({
    queryKey: ['protocol-recommendations', user?.id, options?.status, options?.sourceType],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('protocol_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (options?.status) {
        if (Array.isArray(options.status)) {
          query = query.in('status', options.status);
        } else {
          query = query.eq('status', options.status);
        }
      }

      if (options?.sourceType) {
        query = query.eq('source_type', options.sourceType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching protocol recommendations:', error);
        throw error;
      }

      return data as ProtocolRecommendation[];
    },
    enabled: !!user?.id
  });

  // Accept a recommendation
  const acceptRecommendationMutation = useMutation({
    mutationFn: async (recommendationId: string) => {
      const { error } = await supabase
        .from('protocol_recommendations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocol-recommendations'] });
      toast.success('Protocol recommendation accepted');
    },
    onError: (error) => {
      console.error('Error accepting recommendation:', error);
      toast.error('Failed to accept recommendation');
    }
  });

  // Dismiss a recommendation
  const dismissRecommendationMutation = useMutation({
    mutationFn: async ({ recommendationId, reason }: { recommendationId: string; reason?: string }) => {
      const { error } = await supabase
        .from('protocol_recommendations')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
          notes: reason || null
        })
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocol-recommendations'] });
      toast.success('Protocol recommendation dismissed');
    },
    onError: (error) => {
      console.error('Error dismissing recommendation:', error);
      toast.error('Failed to dismiss recommendation');
    }
  });

  // Update recommendation status
  const updateRecommendationMutation = useMutation({
    mutationFn: async ({ 
      recommendationId, 
      status, 
      notes 
    }: { 
      recommendationId: string; 
      status: 'pending' | 'accepted' | 'dismissed' | 'partially_accepted'; 
      notes?: string;
    }) => {
      const updates: any = { status };
      
      if (status === 'accepted' || status === 'partially_accepted') {
        updates.accepted_at = new Date().toISOString();
      }
      
      if (status === 'dismissed') {
        updates.dismissed_at = new Date().toISOString();
      }
      
      if (notes) {
        updates.notes = notes;
      }

      const { error } = await supabase
        .from('protocol_recommendations')
        .update(updates)
        .eq('id', recommendationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocol-recommendations'] });
      toast.success('Recommendation updated');
    },
    onError: (error) => {
      console.error('Error updating recommendation:', error);
      toast.error('Failed to update recommendation');
    }
  });

  // Get recommendation by ID
  const getRecommendationById = (id: string) => {
    return recommendations?.find(rec => rec.id === id);
  };

  // Get recommendations by source type
  const getRecommendationsBySource = (sourceType: 'hormone_compass' | 'lis' | 'symptom' | 'goal') => {
    return recommendations?.filter(rec => rec.source_type === sourceType) || [];
  };

  // Get pending recommendations count
  const pendingCount = recommendations?.filter(rec => rec.status === 'pending').length || 0;

  return {
    recommendations: recommendations || [],
    isLoading,
    error,
    refetch,
    acceptRecommendation: acceptRecommendationMutation.mutate,
    dismissRecommendation: dismissRecommendationMutation.mutate,
    updateRecommendation: updateRecommendationMutation.mutate,
    isAccepting: acceptRecommendationMutation.isPending,
    isDismissing: dismissRecommendationMutation.isPending,
    isUpdating: updateRecommendationMutation.isPending,
    getRecommendationById,
    getRecommendationsBySource,
    pendingCount
  };
};