-- Add selected meal plan template to nutrition preferences
ALTER TABLE nutrition_preferences
ADD COLUMN IF NOT EXISTS selected_meal_plan_template TEXT;

-- Create meal completions table
CREATE TABLE IF NOT EXISTS meal_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_name TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, meal_type, completed_date)
);

-- Enable RLS on meal_completions
ALTER TABLE meal_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_completions
CREATE POLICY "Users can view own meal completions"
  ON meal_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal completions"
  ON meal_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal completions"
  ON meal_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Create daily nutrition scores table
CREATE TABLE IF NOT EXISTS daily_nutrition_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  hydration INTEGER,
  vegetables INTEGER,
  protein INTEGER,
  processed_foods INTEGER,
  sugar INTEGER,
  dairy_gluten INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- Enable RLS on daily_nutrition_scores
ALTER TABLE daily_nutrition_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_nutrition_scores
CREATE POLICY "Users can view own nutrition scores"
  ON daily_nutrition_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition scores"
  ON daily_nutrition_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition scores"
  ON daily_nutrition_scores FOR UPDATE
  USING (auth.uid() = user_id);