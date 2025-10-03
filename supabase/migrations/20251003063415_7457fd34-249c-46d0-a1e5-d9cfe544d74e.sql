-- LIS 2.0 Database Schema Migration

-- Create user_health_profile table for semi-static health data
CREATE TABLE user_health_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  current_bmi NUMERIC,
  is_current_smoker BOOLEAN DEFAULT false,
  is_former_smoker BOOLEAN DEFAULT false,
  date_quit_smoking DATE,
  initial_subjective_age_delta INTEGER,
  social_engagement_baseline INTEGER CHECK (social_engagement_baseline BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on user_health_profile
ALTER TABLE user_health_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health profile" 
  ON user_health_profile FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health profile" 
  ON user_health_profile FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health profile" 
  ON user_health_profile FOR UPDATE 
  USING (auth.uid() = user_id);

-- Trigger for updated_at on user_health_profile
CREATE TRIGGER update_user_health_profile_updated_at 
  BEFORE UPDATE ON user_health_profile 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add new LIS 2.0 columns to daily_scores
ALTER TABLE daily_scores
ADD COLUMN lis_version TEXT DEFAULT 'LIS 1.0' CHECK (lis_version IN ('LIS 1.0', 'LIS 2.0')),
ADD COLUMN self_perceived_age INTEGER,
ADD COLUMN subjective_calmness_rating INTEGER CHECK (subjective_calmness_rating BETWEEN 0 AND 10),
ADD COLUMN daily_delta_ba_lis NUMERIC,
ADD COLUMN user_chronological_age INTEGER;

-- Create calmness_baselines table for 30-day rolling baselines
CREATE TABLE calmness_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  baseline_calmness_30day NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable RLS on calmness_baselines
ALTER TABLE calmness_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own baselines" 
  ON calmness_baselines FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own baselines" 
  ON calmness_baselines FOR INSERT 
  WITH CHECK (auth.uid() = user_id);