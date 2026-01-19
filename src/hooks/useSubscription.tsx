import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TEST_MODE_ENABLED } from '@/config/testMode';

export interface SubscriptionData {
  id: string;
  subscription_tier: 'guest' | 'registered' | 'subscribed' | 'premium';
  subscription_status: 'active' | 'trialing' | 'canceled' | 'expired';
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
  daily_submissions_count: number;
  last_submission_date?: string;
}

// Mock subscription for test mode - reads from localStorage tier selection
const getMockSubscription = (): SubscriptionData | null => {
  const selectedTier = localStorage.getItem('testModeTier') || 'premium';
  
  if (selectedTier === 'guest') {
    return null;
  }
  
  return {
    id: '00000000-0000-0000-0000-000000000003',
    subscription_tier: selectedTier as SubscriptionData['subscription_tier'],
    subscription_status: 'active',
    daily_submissions_count: 0,
    subscription_start_date: new Date().toISOString(),
  };
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    TEST_MODE_ENABLED ? getMockSubscription() : null
  );
  const [loading, setLoading] = useState(!TEST_MODE_ENABLED);

  const normalize = (row: any): SubscriptionData => {
    return {
      ...(row as SubscriptionData),
      daily_submissions_count: (row?.daily_submissions_count ?? 0) as number,
    };
  };

  const ensureSubscriptionExists = async (userId: string): Promise<SubscriptionData> => {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        subscription_tier: 'registered',
        subscription_status: 'active',
        daily_submissions_count: 0,
      })
      .select('*')
      .single();

    if (error) {
      // Likely a race (unique constraint) — refetch and return.
      const { data: existing, error: refetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (refetchError) throw refetchError;
      if (existing) return existing as SubscriptionData;
      throw error;
    }

    return normalize(data);
  };

  const fetchSubscription = async () => {
    // Skip fetching in test mode - use mock subscription based on selected tier
    if (TEST_MODE_ENABLED) {
      setSubscription(getMockSubscription());
      setLoading(false);
      return;
    }

    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        const created = await ensureSubscriptionExists(user.id);
        setSubscription(created);
        return;
      }

      setSubscription(normalize(data));
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const isTrialing = () => {
    if (!subscription) return false;
    if (subscription.subscription_status !== 'trialing') return false;
    if (!subscription.trial_end_date) return false;
    return new Date(subscription.trial_end_date) > new Date();
  };

  const isSubscribed = () => {
    if (!subscription) return false;
    return subscription.subscription_tier === 'subscribed' || subscription.subscription_tier === 'premium';
  };

  const hasTrialAccess = () => {
    return isTrialing() || isSubscribed();
  };

  const canSubmitDaily = () => {
    if (!subscription) return false;
    return isTrialing() || isSubscribed();
  };

  const getDaysRemainingInTrial = () => {
    if (!subscription?.trial_end_date) return 0;
    const endDate = new Date(subscription.trial_end_date);
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    subscription,
    loading,
    isTrialing,
    isSubscribed,
    hasTrialAccess,
    canSubmitDaily,
    getDaysRemainingInTrial,
    refetch: fetchSubscription
  };
};
