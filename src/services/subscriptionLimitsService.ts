import { supabase } from "@/integrations/supabase/client";

export interface TierLimits {
  tier_name: 'guest' | 'registered' | 'subscribed' | 'premium';
  max_active_goals: number | null;
  max_total_goals: number | null;
  can_use_ai_optimization: boolean;
  can_use_adaptive_recommendations: boolean;
  can_track_biological_age_impact: boolean;
  can_access_advanced_analytics: boolean;
  available_check_in_frequencies: string[];
  max_check_ins_per_month: number | null;
  restricted_template_keys: string[];
  display_name: string;
  marketing_description: string | null;
}

/**
 * Fetch limits for a specific tier
 * NO HARDCODING - all limits from database
 */
export const getTierLimits = async (tierName: string): Promise<TierLimits | null> => {
  const { data, error } = await supabase
    .from('subscription_tier_limits')
    .select('*')
    .eq('tier_name', tierName)
    .maybeSingle();

  if (error) {
    console.error('Error fetching tier limits:', error);
    return null;
  }

  return data as TierLimits | null;
};

/**
 * Check if user can create a new goal based on their tier
 */
export const canCreateGoal = async (
  userId: string,
  tierName: string,
  requestedCount: number = 1
): Promise<{ allowed: boolean; reason?: string; message?: string }> => {
  // Fetch tier limits
  const limits = await getTierLimits(tierName);
  if (!limits) {
    return { allowed: false, reason: 'tier_not_found', message: 'Could not determine tier limits' };
  }

  // Guests cannot create goals
  if (tierName === 'guest') {
    return { 
      allowed: false, 
      reason: 'guest_restricted', 
      message: 'Sign up to start setting health goals' 
    };
  }

  // If unlimited, allow
  if (limits.max_active_goals === null) {
    return { allowed: true };
  }

  // Check current active goal count
  const { count, error } = await supabase
    .from('user_health_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('Error counting active goals:', error);
    return { allowed: false, reason: 'database_error' };
  }

  const activeCount = count || 0;
  const totalAfterCreation = activeCount + requestedCount;

  if (totalAfterCreation > limits.max_active_goals) {
    const available = limits.max_active_goals - activeCount;
    return {
      allowed: false,
      reason: 'limit_reached',
      message: available > 0 
        ? `You can only create ${available} more goal${available !== 1 ? 's' : ''}. You have ${activeCount} of ${limits.max_active_goals} active goals.`
        : `You've reached your limit of ${limits.max_active_goals} active goals. Upgrade for unlimited goals and AI optimization.`
    };
  }

  return { allowed: true };
};

/**
 * Check if user can access a specific template
 */
export const canAccessTemplate = async (
  tierName: string,
  templateKey: string
): Promise<boolean> => {
  const limits = await getTierLimits(tierName);
  if (!limits) return false;

  // If restricted_template_keys is empty, user has access to all
  if (limits.restricted_template_keys.length === 0) return true;

  // Otherwise, check if template is NOT in restricted list
  return !limits.restricted_template_keys.includes(templateKey);
};

/**
 * Get all feature flags for a tier
 */
export const getTierFeatures = async (tierName: string) => {
  const limits = await getTierLimits(tierName);
  if (!limits) return null;

  return {
    canUseAI: limits.can_use_ai_optimization,
    canUseAdaptive: limits.can_use_adaptive_recommendations,
    canTrackBA: limits.can_track_biological_age_impact,
    canAccessAnalytics: limits.can_access_advanced_analytics,
    availableFrequencies: limits.available_check_in_frequencies,
    maxActiveGoals: limits.max_active_goals,
    isUnlimited: limits.max_active_goals === null,
  };
};
