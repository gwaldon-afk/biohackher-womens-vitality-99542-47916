-- MenoMap Feature: Complete Database Schema
-- Creates all tables needed for MenoMap functionality

-- Create menopause stages table
CREATE TABLE public.menopause_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('pre', 'early-peri', 'mid-peri', 'late-peri', 'post')),
  confidence_score NUMERIC(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assessment_id UUID,
  hormone_indicators JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menopause symptom tracking table
CREATE TABLE public.menopause_symptom_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_category TEXT NOT NULL CHECK (symptom_category IN ('cycle', 'thermoregulation', 'mood', 'energy', 'libido', 'skin')),
  symptom_name TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
  tracked_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menopause insights table
CREATE TABLE public.menopause_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('stage_change', 'symptom_pattern', 'protocol_suggestion', 'lab_recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]'::jsonb,
  ai_generated BOOLEAN DEFAULT false,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create menopause progress milestones table
CREATE TABLE public.menopause_progress_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add MenoMap columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS menomap_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS current_menopause_stage TEXT,
ADD COLUMN IF NOT EXISTS menomap_onboarding_completed BOOLEAN DEFAULT false;

-- Enable Row Level Security on all new tables
ALTER TABLE public.menopause_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menopause_symptom_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menopause_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menopause_progress_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menopause_stages
CREATE POLICY "Users can view their own menopause stages"
  ON public.menopause_stages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menopause stages"
  ON public.menopause_stages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menopause stages"
  ON public.menopause_stages FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for menopause_symptom_tracking
CREATE POLICY "Users can view their own menopause symptom tracking"
  ON public.menopause_symptom_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menopause symptom tracking"
  ON public.menopause_symptom_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menopause symptom tracking"
  ON public.menopause_symptom_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menopause symptom tracking"
  ON public.menopause_symptom_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for menopause_insights
CREATE POLICY "Users can view their own menopause insights"
  ON public.menopause_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menopause insights"
  ON public.menopause_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menopause insights"
  ON public.menopause_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for menopause_progress_milestones
CREATE POLICY "Users can view their own menopause milestones"
  ON public.menopause_progress_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menopause milestones"
  ON public.menopause_progress_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_menopause_stages_user_id ON public.menopause_stages(user_id);
CREATE INDEX idx_menopause_stages_calculated_at ON public.menopause_stages(calculated_at DESC);
CREATE INDEX idx_menopause_symptom_tracking_user_date ON public.menopause_symptom_tracking(user_id, tracked_date DESC);
CREATE INDEX idx_menopause_insights_user_id ON public.menopause_insights(user_id);
CREATE INDEX idx_menopause_insights_acknowledged ON public.menopause_insights(user_id, acknowledged);
CREATE INDEX idx_menopause_milestones_user_id ON public.menopause_progress_milestones(user_id);

-- Create trigger for updated_at timestamps
CREATE TRIGGER update_menopause_stages_updated_at
  BEFORE UPDATE ON public.menopause_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menopause_symptom_tracking_updated_at
  BEFORE UPDATE ON public.menopause_symptom_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();