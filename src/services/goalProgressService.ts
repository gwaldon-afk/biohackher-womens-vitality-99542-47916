import { supabase } from "@/integrations/supabase/client";
import { differenceInDays, subDays } from "date-fns";

interface HealthGoal {
  id: string;
  user_id: string;
  created_at: string;
  check_in_frequency?: string;
  [key: string]: any;
}

/**
 * Calculate goal progress using hybrid formula:
 * - 40% time-based (days elapsed / 90)
 * - 40% action-based (completions / expected)
 * - 20% outcome-based (metric improvement)
 */
export const calculateGoalProgress = async (
  goalId: string,
  userId: string
): Promise<number> => {
  try {
    const { data: goal, error: goalError } = await supabase
      .from('user_health_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (goalError || !goal) return 0;

    // Calculate individual components
    const timeProgress = calculateTimeProgress(goal);
    const actionProgress = await calculateActionProgress(goal, userId);
    const outcomeProgress = await calculateOutcomeProgress(goal, userId);

    // Hybrid formula
    const totalProgress = 
      (timeProgress * 0.4) + 
      (actionProgress * 0.4) + 
      (outcomeProgress * 0.2);

    return Math.round(Math.min(100, Math.max(0, totalProgress)));
  } catch (error) {
    console.error('Error calculating goal progress:', error);
    return 0;
  }
};

function calculateTimeProgress(goal: HealthGoal): number {
  if (!goal.created_at) return 0;

  const startDate = new Date(goal.created_at);
  const today = new Date();
  const daysElapsed = differenceInDays(today, startDate);

  // Assume 90-day cycle for most goals
  const targetDays = 90;
  return Math.min((daysElapsed / targetDays) * 100, 100);
}

async function calculateActionProgress(
  goal: HealthGoal,
  userId: string
): Promise<number> {
  try {
    // Fetch protocol items linked to this goal
    const { data: items, error: itemsError } = await supabase
      .from('protocol_items')
      .select('id')
      .contains('goal_ids', [goal.id])
      .eq('is_active', true);

    if (itemsError || !items || items.length === 0) return 0;

    // Fetch completions for these items in the last 30 days
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split('T')[0];

    const { data: completions, error: completionsError } = await supabase
      .from('protocol_item_completions')
      .select('protocol_item_id, completed_date')
      .in('protocol_item_id', items.map(i => i.id))
      .eq('user_id', userId)
      .gte('completed_date', thirtyDaysAgo);

    if (completionsError) return 0;

    // Expected completions: items.length * 30 days
    const expectedCompletions = items.length * 30;
    const actualCompletions = completions?.length || 0;

    return Math.min((actualCompletions / expectedCompletions) * 100, 100);
  } catch (error) {
    console.error('Error calculating action progress:', error);
    return 0;
  }
}

async function calculateOutcomeProgress(
  goal: HealthGoal,
  userId: string
): Promise<number> {
  try {
    // Fetch metric tracking data
    const { data: metrics, error: metricsError } = await supabase
      .from('goal_metric_tracking')
      .select('*')
      .eq('goal_id', goal.id)
      .eq('user_id', userId)
      .order('tracked_date', { ascending: true });

    if (metricsError || !metrics || metrics.length < 2) return 0;

    // Compare first and latest metric values
    const firstMetric = metrics[0];
    const latestMetric = metrics[metrics.length - 1];

    // Calculate improvement percentage (generic formula)
    if (firstMetric.metric_value && latestMetric.metric_value) {
      const improvement = 
        ((latestMetric.metric_value - firstMetric.metric_value) / 
        Math.abs(firstMetric.metric_value)) * 100;

      return Math.max(0, Math.min(improvement, 100));
    }

    return 0;
  } catch (error) {
    console.error('Error calculating outcome progress:', error);
    return 0;
  }
}

/**
 * Track a new metric value for a goal
 */
export const trackGoalMetric = async (
  userId: string,
  goalId: string,
  metricName: string,
  metricValue: number,
  metricUnit?: string,
  notes?: string
) => {
  try {
    const { error } = await supabase
      .from('goal_metric_tracking')
      .insert({
        user_id: userId,
        goal_id: goalId,
        metric_name: metricName,
        metric_value: metricValue,
        metric_unit: metricUnit,
        notes: notes,
        tracked_date: new Date().toISOString().split('T')[0]
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking goal metric:', error);
    return false;
  }
};
