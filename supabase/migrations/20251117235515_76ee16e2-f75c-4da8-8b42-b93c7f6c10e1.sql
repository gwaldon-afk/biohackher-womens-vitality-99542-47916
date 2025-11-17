-- Create assessment_progress table to track user completion of LIS, Nutrition, and Hormone Compass assessments
CREATE TABLE IF NOT EXISTS public.assessment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lis_completed BOOLEAN DEFAULT FALSE,
  nutrition_completed BOOLEAN DEFAULT FALSE,
  hormone_completed BOOLEAN DEFAULT FALSE,
  lis_completed_at TIMESTAMP WITH TIME ZONE,
  nutrition_completed_at TIMESTAMP WITH TIME ZONE,
  hormone_completed_at TIMESTAMP WITH TIME ZONE,
  master_dashboard_unlocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.assessment_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessment progress"
  ON public.assessment_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessment progress"
  ON public.assessment_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessment progress"
  ON public.assessment_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_assessment_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessment_progress_updated_at
  BEFORE UPDATE ON public.assessment_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_assessment_progress_updated_at();