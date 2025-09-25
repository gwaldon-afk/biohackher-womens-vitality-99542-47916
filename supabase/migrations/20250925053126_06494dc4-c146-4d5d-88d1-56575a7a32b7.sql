-- Create tables for Longevity Impact Score (LIS) system

-- Main daily scores table
CREATE TABLE public.daily_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  longevity_impact_score NUMERIC(5,2) NOT NULL, -- Final calculated score
  biological_age_impact NUMERIC(5,2) NOT NULL, -- Days added/subtracted from bio age
  color_code TEXT NOT NULL, -- green/red based on impact
  
  -- Individual pillar scores (0-100)
  sleep_score NUMERIC(5,2),
  stress_score NUMERIC(5,2), 
  physical_activity_score NUMERIC(5,2),
  nutrition_score NUMERIC(5,2),
  social_connections_score NUMERIC(5,2),
  cognitive_engagement_score NUMERIC(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Wearable data table  
CREATE TABLE public.wearable_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  device_type TEXT NOT NULL, -- 'apple_watch', 'oura_ring', etc.
  
  -- Sleep metrics
  total_sleep_hours NUMERIC(4,2),
  rem_sleep_percentage NUMERIC(5,2),
  
  -- Heart metrics
  heart_rate_variability NUMERIC(6,2),
  resting_heart_rate INTEGER,
  
  -- Activity metrics
  active_minutes INTEGER,
  steps INTEGER,
  exercise_intensity_zones JSONB, -- Store heart rate zones data
  
  raw_data JSONB, -- Store complete API response
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date, device_type)
);

-- Self-reported metrics table
CREATE TABLE public.self_reported_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  
  loveable_score INTEGER CHECK (loveable_score >= 1 AND loveable_score <= 10), -- 1-10 daily mood
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10), -- 1-10 stress
  social_interaction_quality INTEGER CHECK (social_interaction_quality >= 1 AND social_interaction_quality <= 10), -- 1-10 social
  
  journal_entry TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date)
);

-- Habit tracking table
CREATE TABLE public.habit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  habit_type TEXT NOT NULL, -- 'meditation', 'social_gathering', 'cognitive_exercise'
  
  -- Activity details
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5), -- 1-5 intensity
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, date, habit_type)
);

-- Enable RLS on all tables
ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_reported_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_scores
CREATE POLICY "Users can view their own daily scores" 
ON public.daily_scores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily scores" 
ON public.daily_scores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily scores" 
ON public.daily_scores 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for wearable_data
CREATE POLICY "Users can view their own wearable data" 
ON public.wearable_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wearable data" 
ON public.wearable_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for self_reported_metrics
CREATE POLICY "Users can view their own self-reported metrics" 
ON public.self_reported_metrics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own self-reported metrics" 
ON public.self_reported_metrics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own self-reported metrics" 
ON public.self_reported_metrics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for habit_tracking
CREATE POLICY "Users can view their own habit tracking" 
ON public.habit_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit tracking" 
ON public.habit_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit tracking" 
ON public.habit_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_daily_scores_updated_at
BEFORE UPDATE ON public.daily_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_self_reported_metrics_updated_at
BEFORE UPDATE ON public.self_reported_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_daily_scores_user_date ON public.daily_scores(user_id, date DESC);
CREATE INDEX idx_wearable_data_user_date ON public.wearable_data(user_id, date DESC);
CREATE INDEX idx_self_reported_metrics_user_date ON public.self_reported_metrics(user_id, date DESC);
CREATE INDEX idx_habit_tracking_user_date ON public.habit_tracking(user_id, date DESC);