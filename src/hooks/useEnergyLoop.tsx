import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { calculateEnergyLoop, calculateEnergyVariability, EnergyInputs } from '@/utils/energyLoopCalculation';
import { useToast } from '@/hooks/use-toast';

export interface EnergyCheckIn {
  id: string;
  user_id: string;
  check_in_date: string;
  energy_rating: number;
  sleep_quality: number;
  stress_level: number;
  movement_completed: boolean;
  notes?: string;
  created_at: string;
}

export interface EnergyLoopScore {
  id: string;
  user_id: string;
  date: string;
  composite_score: number;
  sleep_recovery_score: number;
  stress_load_score: number;
  nutrition_score: number;
  movement_quality_score: number;
  hormonal_rhythm_score: number;
  loop_completion_percent: number;
  energy_variability_index?: number;
  data_sources: any;
  created_at: string;
  updated_at: string;
}

export interface EnergyInsight {
  id: string;
  user_id: string;
  insight_type: 'pattern' | 'correlation' | 'recommendation' | 'alert';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  trigger_data: any;
  action_suggestions: any[];
  ai_generated: boolean;
  acknowledged: boolean;
  created_at: string;
  dismissed_at?: string;
}

export interface EnergyAction {
  id: string;
  user_id: string;
  action_type: 'balance' | 'fuel' | 'calm' | 'recharge';
  action_name: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  added_to_protocol: boolean;
  protocol_id?: string;
  created_at: string;
}

export const useEnergyLoop = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<EnergyCheckIn | null>(null);
  const [currentScore, setCurrentScore] = useState<EnergyLoopScore | null>(null);
  const [recentScores, setRecentScores] = useState<EnergyLoopScore[]>([]);
  const [insights, setInsights] = useState<EnergyInsight[]>([]);
  const [actions, setActions] = useState<EnergyAction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEnergyLoopStatus();
      fetchEnergyData();
    }
  }, [user]);

  const fetchEnergyLoopStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('energy_loop_enabled, energy_loop_onboarding_completed')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setIsEnabled(profile.energy_loop_enabled || false);
        setOnboardingCompleted(profile.energy_loop_onboarding_completed || false);
      }
    } catch (error) {
      console.error('Error fetching energy loop status:', error);
    }
  };

  const fetchEnergyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's check-in
      const { data: checkIn } = await supabase
        .from('energy_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();

      setTodayCheckIn(checkIn);

      // Fetch today's score
      const { data: score } = await supabase
        .from('energy_loop_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      setCurrentScore(score);

      // Fetch recent scores (last 30 days)
      const { data: scores } = await supabase
        .from('energy_loop_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      setRecentScores(scores || []);

      // Fetch unacknowledged insights
      const { data: insightsData } = await supabase
        .from('energy_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('acknowledged', false)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })
        .limit(10);

      setInsights((insightsData || []) as EnergyInsight[]);

      // Fetch active actions
      const { data: actionsData } = await supabase
        .from('energy_actions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(10);

      setActions((actionsData || []) as EnergyAction[]);
    } catch (error) {
      console.error('Error fetching energy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitCheckIn = async (data: {
    energy_rating: number;
    sleep_quality: number;
    stress_level: number;
    movement_completed: boolean;
    notes?: string;
  }) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: checkIn, error } = await supabase
        .from('energy_check_ins')
        .upsert({
          user_id: user.id,
          check_in_date: today,
          ...data
        }, {
          onConflict: 'user_id,check_in_date'
        })
        .select()
        .single();

      if (error) throw error;

      setTodayCheckIn(checkIn);
      
      // Automatically calculate today's score after check-in
      await calculateTodayScore();

      toast({
        title: 'Check-in saved',
        description: 'Your energy loop is updating...'
      });

      return checkIn;
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: 'Error',
        description: 'Failed to save check-in',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const calculateTodayScore = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Gather all available data for today
      const { data: checkIn } = await supabase
        .from('energy_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .eq('check_in_date', today)
        .maybeSingle();

      const { data: dailyScore } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const { data: wearableData } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      const { data: profile } = await supabase
        .from('profiles')
        .select('current_menopause_stage')
        .eq('user_id', user.id)
        .single();

      // Build energy inputs
      const inputs: EnergyInputs = {
        energyRating: checkIn?.energy_rating,
        sleepQuality: checkIn?.sleep_quality,
        stressLevel: checkIn?.stress_level,
        movementCompleted: checkIn?.movement_completed,
        sleepHours: dailyScore?.total_sleep_hours || wearableData?.total_sleep_hours,
        remPercentage: dailyScore?.rem_hours ? (dailyScore.rem_hours / dailyScore.total_sleep_hours) * 100 : undefined,
        deepSleepHours: dailyScore?.deep_sleep_hours,
        hrv: dailyScore?.hrv || wearableData?.heart_rate_variability,
        restingHeartRate: wearableData?.resting_heart_rate,
        activeMinutes: dailyScore?.active_minutes || wearableData?.active_minutes,
        steps: dailyScore?.steps || wearableData?.steps,
        nutritionScore: dailyScore?.nutrition_score,
        menoStage: profile?.current_menopause_stage
      };

      // Calculate scores
      const loopScore = calculateEnergyLoop(inputs);

      // Calculate energy variability (if we have enough history)
      let energyVariability: number | undefined;
      const { data: recentScoresData } = await supabase
        .from('energy_loop_scores')
        .select('composite_score')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      if (recentScoresData && recentScoresData.length >= 2) {
        energyVariability = calculateEnergyVariability(
          recentScoresData.map(s => s.composite_score)
        );
      }

      // Save to database
      const { data: savedScore, error } = await supabase
        .from('energy_loop_scores')
        .upsert({
          user_id: user.id,
          date: today,
          composite_score: loopScore.composite,
          sleep_recovery_score: loopScore.segments.sleepRecovery.score,
          stress_load_score: loopScore.segments.stressLoad.score,
          nutrition_score: loopScore.segments.nutrition.score,
          movement_quality_score: loopScore.segments.movementQuality.score,
          hormonal_rhythm_score: loopScore.segments.hormonalRhythm.score,
          loop_completion_percent: loopScore.loopCompletion,
          energy_variability_index: energyVariability,
          data_sources: {
            sleepRecovery: loopScore.segments.sleepRecovery.dataSources,
            stressLoad: loopScore.segments.stressLoad.dataSources,
            nutrition: loopScore.segments.nutrition.dataSources,
            movementQuality: loopScore.segments.movementQuality.dataSources,
            hormonalRhythm: loopScore.segments.hormonalRhythm.dataSources,
            overallQuality: loopScore.overallDataQuality
          }
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentScore(savedScore);
      await fetchEnergyData(); // Refresh all data

      return savedScore;
    } catch (error) {
      console.error('Error calculating today\'s score:', error);
      throw error;
    }
  };

  const acknowledgeInsight = async (insightId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('energy_insights')
        .update({ acknowledged: true })
        .eq('id', insightId)
        .eq('user_id', user.id);

      if (error) throw error;

      setInsights(insights.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Error acknowledging insight:', error);
    }
  };

  const dismissInsight = async (insightId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('energy_insights')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', insightId)
        .eq('user_id', user.id);

      if (error) throw error;

      setInsights(insights.filter(i => i.id !== insightId));
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  const enableEnergyLoop = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ energy_loop_enabled: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEnabled(true);
      toast({
        title: 'Energy Loop enabled!',
        description: 'Start your first check-in to begin tracking.'
      });
    } catch (error) {
      console.error('Error enabling energy loop:', error);
      toast({
        title: 'Error',
        description: 'Failed to enable Energy Loop',
        variant: 'destructive'
      });
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          energy_loop_enabled: true,
          energy_loop_onboarding_completed: true 
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEnabled(true);
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const addAction = async (action: {
    action_type: 'balance' | 'fuel' | 'calm' | 'recharge';
    action_name: string;
    description?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('energy_actions')
        .insert({
          user_id: user.id,
          ...action
        })
        .select()
        .single();

      if (error) throw error;

      setActions([data as EnergyAction, ...actions]);
      return data;
    } catch (error) {
      console.error('Error adding action:', error);
      throw error;
    }
  };

  const completeAction = async (actionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('energy_actions')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', actionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setActions(actions.filter(a => a.id !== actionId));
      
      toast({
        title: 'Action completed!',
        description: 'Keep building your energy loop.'
      });
    } catch (error) {
      console.error('Error completing action:', error);
    }
  };

  return {
    isEnabled,
    onboardingCompleted,
    todayCheckIn,
    currentScore,
    recentScores,
    insights,
    actions,
    loading,
    submitCheckIn,
    calculateTodayScore,
    acknowledgeInsight,
    dismissInsight,
    enableEnergyLoop,
    completeOnboarding,
    addAction,
    completeAction,
    refetch: fetchEnergyData
  };
};
