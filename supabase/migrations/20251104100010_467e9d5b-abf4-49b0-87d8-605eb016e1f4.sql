-- Ensure all existing users have a subscription record
-- This will prevent "authentication required" errors

INSERT INTO user_subscriptions (user_id, subscription_tier, subscription_status, trial_start_date, trial_end_date)
SELECT 
  p.id as user_id,
  'registered' as subscription_tier,
  'trialing' as subscription_status,
  NOW() as trial_start_date,
  NOW() + INTERVAL '30 days' as trial_end_date
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM user_subscriptions us 
  WHERE us.user_id = p.id
)
ON CONFLICT (user_id) DO NOTHING;