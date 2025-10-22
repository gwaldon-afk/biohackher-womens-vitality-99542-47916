-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en-US',
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS measurement_system TEXT DEFAULT 'metric',
ADD COLUMN IF NOT EXISTS timezone TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS user_stream TEXT CHECK (user_stream IN ('performance', 'menopause')),
ADD COLUMN IF NOT EXISTS device_permissions JSONB DEFAULT '{"camera": false, "microphone": false, "light_sensor": false, "motion": false}'::jsonb;