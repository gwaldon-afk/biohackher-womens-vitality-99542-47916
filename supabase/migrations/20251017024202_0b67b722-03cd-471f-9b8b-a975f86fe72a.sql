-- Energy Loop Feature: Complete Database Schema
-- Creates all tables needed for Energy Loop functionality

-- Daily energy check-ins
CREATE TABLE public.energy_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE DEFAULT CURRENT_DATE,
  energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 10),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  movement_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, check_in_date)
);

-- Energy Loop composite scores
CREATE TABLE public.energy_loop_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  composite_score NUMERIC(5,2) CHECK (composite_score BETWEEN 0 AND 100),
  sleep_recovery_score NUMERIC(5,2),
  stress_load_score NUMERIC(5,2),
  nutrition_score NUMERIC(5,2),
  movement_quality_score NUMERIC(5,2),
  hormonal_rhythm_score NUMERIC(5,2),
  loop_completion_percent NUMERIC(5,2),
  energy_variability_index NUMERIC(5,2),
  data_sources JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- AI-generated energy insights
CREATE TABLE public.energy_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'correlation', 'recommendation', 'alert')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  action_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN DEFAULT true,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Quick biohack actions
CREATE TABLE public.energy_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('balance', 'fuel', 'calm', 'recharge')),
  action_name TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  added_to_protocol BOOLEAN DEFAULT false,
  protocol_id UUID REFERENCES public.user_protocols(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Energy milestones & gamification
CREATE TABLE public.energy_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Energy Loop flags to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS energy_loop_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS energy_loop_onboarding_completed BOOLEAN DEFAULT false;

-- Enable Row Level Security
ALTER TABLE public.energy_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_loop_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for energy_check_ins
CREATE POLICY "Users can view their own energy check-ins"
  ON public.energy_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy check-ins"
  ON public.energy_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy check-ins"
  ON public.energy_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy check-ins"
  ON public.energy_check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for energy_loop_scores
CREATE POLICY "Users can view their own energy loop scores"
  ON public.energy_loop_scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy loop scores"
  ON public.energy_loop_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy loop scores"
  ON public.energy_loop_scores FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for energy_insights
CREATE POLICY "Users can view their own energy insights"
  ON public.energy_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy insights"
  ON public.energy_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy insights"
  ON public.energy_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy insights"
  ON public.energy_insights FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for energy_actions
CREATE POLICY "Users can view their own energy actions"
  ON public.energy_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy actions"
  ON public.energy_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own energy actions"
  ON public.energy_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own energy actions"
  ON public.energy_actions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for energy_milestones
CREATE POLICY "Users can view their own energy milestones"
  ON public.energy_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own energy milestones"
  ON public.energy_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_energy_check_ins_user_date ON public.energy_check_ins(user_id, check_in_date DESC);
CREATE INDEX idx_energy_loop_scores_user_date ON public.energy_loop_scores(user_id, date DESC);
CREATE INDEX idx_energy_insights_user_acknowledged ON public.energy_insights(user_id, acknowledged, created_at DESC);
CREATE INDEX idx_energy_actions_user_completed ON public.energy_actions(user_id, completed);
CREATE INDEX idx_energy_milestones_user_id ON public.energy_milestones(user_id, achieved_at DESC);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_energy_loop_scores_updated_at
  BEFORE UPDATE ON public.energy_loop_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();