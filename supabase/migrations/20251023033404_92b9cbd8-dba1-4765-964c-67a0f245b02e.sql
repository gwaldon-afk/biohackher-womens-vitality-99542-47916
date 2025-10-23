-- Add device_permissions column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS device_permissions JSONB DEFAULT '{"camera": false, "microphone": false, "light_sensor": false, "motion": false}'::jsonb;