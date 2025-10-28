-- Remove user_stream column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_stream;

-- Ensure onboarding_completed column exists with proper defaults
ALTER TABLE public.profiles 
  ALTER COLUMN onboarding_completed SET DEFAULT false;

-- Add index for onboarding_completed for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
  ON public.profiles(onboarding_completed);