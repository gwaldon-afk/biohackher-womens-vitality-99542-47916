-- Create menomap_assessments table to store raw assessment data
CREATE TABLE IF NOT EXISTS public.menomap_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL DEFAULT 'quick',
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  bio_score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menomap_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assessments"
  ON public.menomap_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON public.menomap_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON public.menomap_assessments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for performance
CREATE INDEX idx_menomap_assessments_user_id ON public.menomap_assessments(user_id);
CREATE INDEX idx_menomap_assessments_completed_at ON public.menomap_assessments(completed_at DESC);