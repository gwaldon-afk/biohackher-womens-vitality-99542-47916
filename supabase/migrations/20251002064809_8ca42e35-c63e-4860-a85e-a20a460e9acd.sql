-- Create user_progress table to track onboarding completion and progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  pillars_visited JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streak_tracking table for gamification
CREATE TABLE IF NOT EXISTS public.streak_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for streak_tracking
CREATE POLICY "Users can view their own streaks"
  ON public.streak_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
  ON public.streak_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
  ON public.streak_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at on user_progress
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on streak_tracking
CREATE TRIGGER update_streak_tracking_updated_at
  BEFORE UPDATE ON public.streak_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();