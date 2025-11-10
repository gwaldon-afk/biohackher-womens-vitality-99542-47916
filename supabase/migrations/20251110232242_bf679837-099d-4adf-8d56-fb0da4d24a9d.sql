-- Create nutrition_streaks table for tracking user streaks
CREATE TABLE IF NOT EXISTS public.nutrition_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_logged_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT nutrition_streaks_user_id_unique UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.nutrition_streaks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutrition_streaks
CREATE POLICY "Users can view own streaks"
  ON public.nutrition_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON public.nutrition_streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON public.nutrition_streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for performance on nutrition_streaks
CREATE INDEX IF NOT EXISTS idx_nutrition_streaks_user_id 
  ON public.nutrition_streaks(user_id);

-- Add index to existing daily_nutrition_scores table for better query performance
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_scores_user_date 
  ON public.daily_nutrition_scores(user_id, score_date DESC);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_nutrition_streaks_updated_at
  BEFORE UPDATE ON public.nutrition_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();