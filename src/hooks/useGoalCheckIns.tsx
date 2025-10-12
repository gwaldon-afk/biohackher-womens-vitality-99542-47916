import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface GoalCheckIn {
  id: string;
  goal_id: string;
  user_id: string;
  check_in_date: string;
  external_biomarkers: any;
  lis_impact: any;
  self_reported_metrics: any;
  metrics_achieved: number;
  total_metrics: number;
  progress_percentage: number;
  whats_working: string | null;
  whats_not_working: string | null;
  barriers_encountered: string[];
  adjustments_needed: string | null;
  motivation_level: number | null;
  confidence_level: number | null;
  ai_coaching_suggestions: string | null;
  created_at: string;
  updated_at: string;
}

export const useGoalCheckIns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkIns, setCheckIns] = useState<GoalCheckIn[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch check-ins for a goal
   */
  const fetchCheckIns = async (goalId: string) => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('goal_check_ins')
        .select('*')
        .eq('goal_id', goalId)
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (error) throw error;

      setCheckIns(data as GoalCheckIn[]);
      return data as GoalCheckIn[];
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create check-in
   */
  const createCheckIn = async (checkInData: Partial<GoalCheckIn>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goal_check_ins')
        .insert([{
          user_id: user.id,
          ...checkInData,
        } as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Check-in saved!',
        description: 'Your progress has been recorded',
      });

      return data as GoalCheckIn;
    } catch (error) {
      console.error('Error creating check-in:', error);
      toast({
        title: 'Error',
        description: 'Could not save check-in',
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Get latest check-in
   */
  const getLatestCheckIn = async (goalId: string): Promise<GoalCheckIn | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('goal_check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', user.id)
      .order('check_in_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest check-in:', error);
      return null;
    }

    return data as GoalCheckIn | null;
  };

  return {
    checkIns,
    loading,
    fetchCheckIns,
    createCheckIn,
    getLatestCheckIn,
  };
};
