-- Add activity_level column to user_health_profile table
ALTER TABLE user_health_profile
ADD COLUMN IF NOT EXISTS activity_level TEXT
CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'));