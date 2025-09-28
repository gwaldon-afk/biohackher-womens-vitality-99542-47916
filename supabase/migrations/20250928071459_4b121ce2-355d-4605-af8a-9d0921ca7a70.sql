-- Create assessment completion tracking table
CREATE TABLE public.user_assessment_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL, -- e.g., 'brain-brain-fog-assessment', 'sleep', etc.
  pillar TEXT, -- 'brain', 'body', 'balance', 'beauty', or null for individual symptoms
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one completion record per user per assessment (latest completion)
  UNIQUE(user_id, assessment_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_assessment_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessment completions"
ON public.user_assessment_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment completions"
ON public.user_assessment_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment completions"
ON public.user_assessment_completions
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_assessment_completions_updated_at
BEFORE UPDATE ON public.user_assessment_completions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_user_assessment_completions_user_id ON public.user_assessment_completions(user_id);
CREATE INDEX idx_user_assessment_completions_pillar ON public.user_assessment_completions(pillar);
CREATE INDEX idx_user_assessment_completions_assessment_id ON public.user_assessment_completions(assessment_id);