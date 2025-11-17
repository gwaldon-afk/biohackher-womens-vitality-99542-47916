-- Phase 1: Extend nutrition_preferences table
ALTER TABLE nutrition_preferences
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC,
  ADD COLUMN IF NOT EXISTS weight_kg NUMERIC,
  ADD COLUMN IF NOT EXISTS goal_primary TEXT,
  ADD COLUMN IF NOT EXISTS nutrition_identity_type TEXT,
  ADD COLUMN IF NOT EXISTS protein_score INTEGER,
  ADD COLUMN IF NOT EXISTS protein_sources TEXT[],
  ADD COLUMN IF NOT EXISTS plant_diversity_score INTEGER,
  ADD COLUMN IF NOT EXISTS fiber_score INTEGER,
  ADD COLUMN IF NOT EXISTS gut_symptom_score INTEGER,
  ADD COLUMN IF NOT EXISTS gut_symptoms TEXT[],
  ADD COLUMN IF NOT EXISTS inflammation_score INTEGER,
  ADD COLUMN IF NOT EXISTS inflammation_symptoms TEXT[],
  ADD COLUMN IF NOT EXISTS first_meal_hour INTEGER,
  ADD COLUMN IF NOT EXISTS last_meal_hour INTEGER,
  ADD COLUMN IF NOT EXISTS eats_after_8pm BOOLEAN,
  ADD COLUMN IF NOT EXISTS chrononutrition_type TEXT,
  ADD COLUMN IF NOT EXISTS meal_timing_window INTEGER,
  ADD COLUMN IF NOT EXISTS menopause_stage TEXT,
  ADD COLUMN IF NOT EXISTS craving_pattern NUMERIC,
  ADD COLUMN IF NOT EXISTS craving_details JSONB,
  ADD COLUMN IF NOT EXISTS hydration_score INTEGER,
  ADD COLUMN IF NOT EXISTS caffeine_score INTEGER,
  ADD COLUMN IF NOT EXISTS alcohol_intake INTEGER,
  ADD COLUMN IF NOT EXISTS values_dietary TEXT[],
  ADD COLUMN IF NOT EXISTS confidence_in_cooking INTEGER,
  ADD COLUMN IF NOT EXISTS food_preference_type TEXT,
  ADD COLUMN IF NOT EXISTS metabolic_symptom_flags TEXT[],
  ADD COLUMN IF NOT EXISTS longevity_nutrition_score NUMERIC,
  ADD COLUMN IF NOT EXISTS assessment_completed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_nutrition_preferences_assessment_date 
  ON nutrition_preferences(assessment_completed_at);

ALTER TABLE longevity_nutrition_assessments
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS claimed_by_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_longevity_nutrition_session_id 
  ON longevity_nutrition_assessments(session_id) WHERE session_id IS NOT NULL;

-- Phase 2: Create daily_nutrition_actions table
CREATE TABLE IF NOT EXISTS daily_nutrition_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id TEXT NOT NULL,
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  description TEXT,
  target_value TEXT,
  pillar TEXT CHECK (pillar IN ('BODY', 'BRAIN', 'BALANCE', 'BEAUTY')),
  time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_id, action_date)
);

ALTER TABLE daily_nutrition_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own nutrition actions"
  ON daily_nutrition_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition actions"
  ON daily_nutrition_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition actions"
  ON daily_nutrition_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nutrition actions"
  ON daily_nutrition_actions FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_nutrition_actions_user_date 
  ON daily_nutrition_actions(user_id, action_date);

CREATE INDEX idx_nutrition_actions_completed 
  ON daily_nutrition_actions(user_id, action_date, completed_at);