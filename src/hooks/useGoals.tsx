import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSubscription } from './useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { canCreateGoal, getTierFeatures } from '@/services/subscriptionLimitsService';
import { useToast } from './use-toast';

export interface HealthGoal {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  pillar_category: 'brain' | 'body' | 'balance' | 'beauty';
  status: 'active' | 'completed' | 'paused' | 'archived';
  healthspan_target: any;
  aging_blueprint: any;
  barriers_plan: any;
  longevity_metrics: any;
  triggered_by_assessment_id: string | null;
  related_assessment_ids: string[];
  current_progress: number;
  last_check_in_date: string | null;
  next_check_in_due: string | null;
  check_in_frequency: string;
  ai_optimization_plan: string | null;
  ai_generated_at: string | null;
  adaptive_recommendations: any;
  biological_age_impact_predicted: number | null;
  biological_age_impact_actual: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  archived_at: string | null;
}

export const useGoals = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [tierFeatures, setTierFeatures] = useState<any>(null);

  // Fetch tier features on mount
  useEffect(() => {
    const loadTierFeatures = async () => {
      if (subscription?.subscription_tier) {
        const features = await getTierFeatures(subscription.subscription_tier);
        setTierFeatures(features);
      }
    };
    loadTierFeatures();
  }, [subscription]);

  /**
   * Fetch goals by status
   */
  const fetchGoals = async (status?: 'active' | 'completed' | 'paused' | 'archived') => {
    if (!user) return [];

    setLoading(true);
    try {
      let query = supabase
        .from('user_health_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      setGoals(data as HealthGoal[]);
      return data as HealthGoal[];
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Error',
        description: 'Could not load your goals',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new goal (checks tier limits first - NO HARDCODING)
   */
  const createGoal = async (goalData: Partial<HealthGoal>) => {
    if (!user || !subscription) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create goals',
        variant: 'destructive',
      });
      return null;
    }

    // Check if user can create goal (database-driven)
    const canCreate = await canCreateGoal(user.id, subscription.subscription_tier);
    if (!canCreate.allowed) {
      toast({
        title: 'Goal limit reached',
        description: canCreate.message,
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_health_goals')
        .insert([{
          user_id: user.id,
          ...goalData,
        } as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Goal created!',
        description: 'Your health goal has been created successfully',
      });

      await fetchGoals(); // Refresh list
      return data as HealthGoal;
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        title: 'Error',
        description: 'Could not create goal',
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Update goal
   */
  const updateGoal = async (goalId: string, updates: Partial<HealthGoal>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_health_goals')
        .update(updates)
        .eq('id', goalId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Goal updated',
        description: 'Your changes have been saved',
      });

      await fetchGoals();
      return data as HealthGoal;
    } catch (error) {
      console.error('Error updating goal:', error);
      toast({
        title: 'Error',
        description: 'Could not update goal',
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Delete goal
   */
  const deleteGoal = async (goalId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_health_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Goal deleted',
        description: 'Your goal has been removed',
      });

      await fetchGoals();
      return true;
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        title: 'Error',
        description: 'Could not delete goal',
        variant: 'destructive',
      });
      return false;
    }
  };

  /**
   * Complete goal
   */
  const completeGoal = async (goalId: string) => {
    return updateGoal(goalId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    } as Partial<HealthGoal>);
  };

  /**
   * Archive goal
   */
  const archiveGoal = async (goalId: string) => {
    return updateGoal(goalId, {
      status: 'archived',
      archived_at: new Date().toISOString(),
    } as Partial<HealthGoal>);
  };

  /**
   * Check if user has a goal for a specific pillar
   */
  const hasGoalForPillar = async (pillar: string): Promise<boolean> => {
    if (!user) return false;

    const { count } = await supabase
      .from('user_health_goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('pillar_category', pillar)
      .eq('status', 'active');

    return (count || 0) > 0;
  };

  /**
   * Check if user can create a goal (wrapper)
   */
  const canUserCreateGoal = async () => {
    if (!user || !subscription) {
      return { allowed: false, reason: 'not_authenticated' };
    }

    return canCreateGoal(user.id, subscription.subscription_tier);
  };

  // Auto-fetch goals on mount
  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  return {
    goals,
    loading,
    tierFeatures,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    archiveGoal,
    hasGoalForPillar,
    canUserCreateGoal,
  };
};
