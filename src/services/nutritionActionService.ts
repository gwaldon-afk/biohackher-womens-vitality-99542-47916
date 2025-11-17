import { supabase } from '@/integrations/supabase/client';

export interface DailyNutritionAction {
  id?: string;
  user_id?: string;
  action_id: string;
  action_date?: string;
  title: string;
  description: string;
  target_value?: string;
  pillar: 'BODY' | 'BRAIN' | 'BALANCE' | 'BEAUTY';
  time_of_day: 'morning' | 'afternoon' | 'evening';
  completed_at?: string | null;
}

/**
 * Generate nutrition actions from assessment data (NOT preferences)
 * Called immediately after assessment completion
 */
export async function generateAndSaveNutritionActions(
  userId: string,
  assessmentData: any,
  cravingAverage: number
): Promise<void> {
  const actions: Omit<DailyNutritionAction, 'id' | 'user_id' | 'action_date' | 'completed_at'>[] = [];
  const today = new Date().toISOString().split('T')[0];

  // Hydration Goal
  if (assessmentData.hydration_score < 4) {
    const waterGoal = assessmentData.weight_kg 
      ? Math.round(assessmentData.weight_kg * 0.033 * 10) / 10 
      : 2;
    
    actions.push({
      action_id: 'hydration',
      title: `Drink ${waterGoal}L of water today`,
      description: 'Proper hydration supports energy, cognition, and skin health',
      target_value: `${waterGoal}L`,
      pillar: 'BEAUTY',
      time_of_day: 'morning',
    });
  }

  // Protein Target
  if (assessmentData.protein_score < 3) {
    const proteinGoal = assessmentData.weight_kg 
      ? Math.round(assessmentData.weight_kg * 1.6) 
      : 100;
    
    actions.push({
      action_id: 'protein_target',
      title: `Eat ${proteinGoal}g protein today`,
      description: 'Essential for muscle maintenance and longevity',
      target_value: `${proteinGoal}g`,
      pillar: 'BODY',
      time_of_day: 'morning',
    });
  }

  // Fiber Target
  if (assessmentData.fiber_score < 3) {
    actions.push({
      action_id: 'fiber_target',
      title: 'Eat 30g fiber from diverse plant sources',
      description: 'Gut health and longevity depend on plant diversity',
      target_value: '30g',
      pillar: 'BALANCE',
      time_of_day: 'afternoon',
    });
  }

  // Anti-Inflammatory Foods
  if (assessmentData.inflammation_score > 2) {
    actions.push({
      action_id: 'anti_inflammatory',
      title: 'Include anti-inflammatory foods in meals',
      description: 'Omega-3, berries, leafy greens, turmeric',
      pillar: 'BRAIN',
      time_of_day: 'afternoon',
    });
  }

  // Chrononutrition
  if (assessmentData.eats_after_8pm || assessmentData.meal_timing_window > 14) {
    actions.push({
      action_id: 'meal_timing',
      title: 'Finish eating by 7pm tonight',
      description: 'Early dinner supports metabolism and sleep quality',
      pillar: 'BALANCE',
      time_of_day: 'evening',
    });
  }

  // Gut Health
  if (assessmentData.gut_symptom_score > 2) {
    actions.push({
      action_id: 'gut_health',
      title: 'Eat fermented foods today',
      description: 'Probiotics support gut microbiome and digestion',
      pillar: 'BEAUTY',
      time_of_day: 'afternoon',
    });
  }

  // Insert actions into database
  if (actions.length > 0) {
    const { error } = await supabase
      .from('daily_nutrition_actions')
      .upsert(
        actions.map(action => ({
          ...action,
          user_id: userId,
          action_date: today,
        })),
        {
          onConflict: 'user_id,action_id,action_date',
          ignoreDuplicates: false,
        }
      );

    if (error) {
      console.error('Error saving nutrition actions:', error);
      throw error;
    }
  }
}

/**
 * Fetch today's nutrition actions for a user
 */
export async function getTodaysNutritionActions(userId: string): Promise<DailyNutritionAction[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_nutrition_actions')
    .select('*')
    .eq('user_id', userId)
    .eq('action_date', today)
    .order('time_of_day', { ascending: true });

  if (error) throw error;
  return (data || []) as DailyNutritionAction[];
}

/**
 * Mark a nutrition action as completed
 */
export async function completeNutritionAction(
  userId: string,
  actionId: string,
  actionDate: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_nutrition_actions')
    .update({ completed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('action_id', actionId)
    .eq('action_date', actionDate);

  if (error) throw error;
}

/**
 * Mark a nutrition action as incomplete
 */
export async function uncompleteNutritionAction(
  userId: string,
  actionId: string,
  actionDate: string
): Promise<void> {
  const { error } = await supabase
    .from('daily_nutrition_actions')
    .update({ completed_at: null })
    .eq('user_id', userId)
    .eq('action_id', actionId)
    .eq('action_date', actionDate);

  if (error) throw error;
}
