-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL,
  category text NOT NULL, -- 'assessment', 'protocol', 'streak', 'progress', 'social'
  tier text NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  points integer NOT NULL DEFAULT 10,
  requirements jsonb NOT NULL, -- {type: 'streak', value: 7} or {type: 'count', metric: 'assessments', value: 10}
  is_active boolean NOT NULL DEFAULT true,
  display_order integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL,
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  progress jsonb, -- For tracking partial progress towards achievement
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  points_to_next_level integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (public read)
CREATE POLICY "Anyone can view active achievements"
  ON public.achievements FOR SELECT
  USING (is_active = true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_points
CREATE POLICY "Users can view their own points"
  ON public.user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own points"
  ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert starter achievements
INSERT INTO public.achievements (achievement_id, name, description, icon_name, category, tier, points, requirements, display_order) VALUES
-- Assessment achievements
('first_assessment', 'Health Explorer', 'Complete your first health assessment', 'CheckCircle', 'assessment', 'bronze', 10, '{"type": "count", "metric": "assessments", "value": 1}', 1),
('five_assessments', 'Wellness Warrior', 'Complete 5 different assessments', 'Target', 'assessment', 'silver', 25, '{"type": "count", "metric": "assessments", "value": 5}', 2),
('all_pillars', 'Pillar Master', 'Complete assessments for all 4 pillars', 'Crown', 'assessment', 'gold', 50, '{"type": "pillars", "value": 4}', 3),

-- Streak achievements
('week_streak', 'Consistent Player', 'Maintain a 7-day streak', 'Flame', 'streak', 'bronze', 15, '{"type": "streak", "value": 7}', 10),
('month_streak', 'Dedication Champion', 'Maintain a 30-day streak', 'Zap', 'streak', 'silver', 50, '{"type": "streak", "value": 30}', 11),
('hundred_day_streak', 'Unstoppable Force', 'Maintain a 100-day streak', 'Award', 'streak', 'platinum', 200, '{"type": "streak", "value": 100}', 12),

-- Protocol achievements
('first_protocol', 'Protocol Pioneer', 'Create your first wellness protocol', 'Clipboard', 'protocol', 'bronze', 10, '{"type": "count", "metric": "protocols", "value": 1}', 20),
('adherence_week', 'Week of Excellence', 'Complete all protocol items for 7 days straight', 'CheckCircle2', 'protocol', 'silver', 30, '{"type": "adherence", "days": 7, "rate": 100}', 21),
('adherence_month', 'Protocol Perfectionist', '90% adherence rate for 30 days', 'Trophy', 'protocol', 'gold', 75, '{"type": "adherence", "days": 30, "rate": 90}', 22),

-- Progress achievements
('first_measurement', 'Progress Tracker', 'Record your first body measurement', 'Activity', 'progress', 'bronze', 10, '{"type": "count", "metric": "measurements", "value": 1}', 30),
('weight_milestone', 'Body Transformer', 'Track measurements for 4 weeks', 'TrendingUp', 'progress', 'silver', 25, '{"type": "measurement_weeks", "value": 4}', 31),
('lis_green', 'Green Day Champion', 'Achieve 10 green LIS days', 'Heart', 'progress', 'gold', 40, '{"type": "lis_green", "value": 10}', 32),

-- Data collection achievements
('data_novice', 'Data Novice', 'Log data for 3 consecutive days', 'Calendar', 'progress', 'bronze', 15, '{"type": "consecutive_logs", "value": 3}', 40),
('data_enthusiast', 'Data Enthusiast', 'Log data for 14 consecutive days', 'CalendarCheck', 'progress', 'silver', 35, '{"type": "consecutive_logs", "value": 14}', 41),
('data_master', 'Data Master', 'Log data for 60 consecutive days', 'Database', 'progress', 'gold', 100, '{"type": "consecutive_logs", "value": 60}', 42);

-- Create function to update user points
CREATE OR REPLACE FUNCTION public.update_user_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_points integer;
  new_total integer;
  new_level integer;
  points_for_next integer;
BEGIN
  -- Get points for the unlocked achievement
  SELECT points INTO achievement_points
  FROM public.achievements
  WHERE achievement_id = NEW.achievement_id;

  -- Update user's total points
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (NEW.user_id, achievement_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + achievement_points,
    updated_at = now();

  -- Calculate new level (every 100 points = 1 level)
  SELECT total_points INTO new_total
  FROM public.user_points
  WHERE user_id = NEW.user_id;
  
  new_level := FLOOR(new_total / 100.0) + 1;
  points_for_next := (new_level * 100) - new_total;

  -- Update level and points to next level
  UPDATE public.user_points
  SET 
    level = new_level,
    points_to_next_level = points_for_next,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

-- Create trigger to update points when achievement is unlocked
CREATE TRIGGER on_achievement_unlocked
  AFTER INSERT ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_points();