-- Drop the incorrect trigger
DROP TRIGGER IF EXISTS on_profile_created_initialize_subscription ON public.profiles;

-- Create correct trigger on user_health_profile table
CREATE OR REPLACE TRIGGER on_health_profile_created_initialize_subscription
  AFTER INSERT ON public.user_health_profile
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();

-- Also ensure subscription is created when user signs up (profiles table)
-- This handles the case where user signs up but hasn't done LIS setup yet
CREATE OR REPLACE TRIGGER on_profile_created_initialize_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();

-- Manually create subscription for your existing account
INSERT INTO public.user_subscriptions (
  user_id,
  subscription_tier,
  subscription_status,
  trial_start_date,
  trial_end_date
) VALUES (
  '523c279d-6bbd-4d60-ab35-869f5b8639b5',
  'registered',
  'trialing',
  NOW(),
  NOW() + INTERVAL '7 days'
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'trialing',
  trial_start_date = NOW(),
  trial_end_date = NOW() + INTERVAL '7 days';