-- Add activity level category and fitness goal to user health profile
ALTER TABLE user_health_profile 
ADD COLUMN IF NOT EXISTS activity_level_category TEXT CHECK (activity_level_category IN ('sedentary', 'lightly_active', 'moderate', 'very_active', 'extremely_active')),
ADD COLUMN IF NOT EXISTS fitness_goal TEXT CHECK (fitness_goal IN ('lose_weight', 'build_muscle', 'maintain_weight', 'athletic_performance'));