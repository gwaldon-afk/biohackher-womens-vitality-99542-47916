-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('guest', 'registered', 'subscribed', 'premium');

-- Create subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('active', 'trialing', 'canceled', 'expired');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  subscription_tier public.subscription_tier NOT NULL DEFAULT 'registered',
  subscription_status public.subscription_status NOT NULL DEFAULT 'active',
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  daily_submissions_count INTEGER DEFAULT 0,
  last_submission_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.user_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to initialize subscription on user creation
CREATE OR REPLACE FUNCTION public.initialize_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    subscription_tier,
    subscription_status,
    trial_start_date,
    trial_end_date
  ) VALUES (
    NEW.id,
    'registered',
    'trialing',
    NOW(),
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create subscription record when profile is created
CREATE TRIGGER on_profile_created_initialize_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_subscription();

-- Create guest_lis_assessments table for non-authenticated users
CREATE TABLE public.guest_lis_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  brief_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_by_user_id UUID,
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for guest assessments
ALTER TABLE public.guest_lis_assessments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert guest assessments
CREATE POLICY "Anyone can create guest assessments"
  ON public.guest_lis_assessments
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view their own guest assessment by session_id
CREATE POLICY "Anyone can view own guest assessment"
  ON public.guest_lis_assessments
  FOR SELECT
  USING (true);