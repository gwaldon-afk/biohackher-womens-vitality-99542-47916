-- Create table for tracking daily essentials completions
CREATE TABLE IF NOT EXISTS public.daily_essentials_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  essential_id TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, essential_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_essentials_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own essentials completions"
  ON public.daily_essentials_completions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own essentials completions"
  ON public.daily_essentials_completions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own essentials completions"
  ON public.daily_essentials_completions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_daily_essentials_completions_user_date 
  ON public.daily_essentials_completions(user_id, date);