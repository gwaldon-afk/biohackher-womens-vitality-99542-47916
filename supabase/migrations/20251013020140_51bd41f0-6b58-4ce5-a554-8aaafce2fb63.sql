-- Add food preferences columns to nutrition_preferences table
ALTER TABLE nutrition_preferences 
ADD COLUMN IF NOT EXISTS liked_foods text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS disliked_foods text[] DEFAULT '{}';