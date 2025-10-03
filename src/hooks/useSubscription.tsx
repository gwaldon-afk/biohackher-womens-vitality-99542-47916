import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

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

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
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
      setSubscription(data);
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
    canSubmitDaily,
    getDaysRemainingInTrial,
    refetch: fetchSubscription
  };
};
