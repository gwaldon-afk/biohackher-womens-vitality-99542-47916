-- Create table for storing completed symptom assessments
CREATE TABLE public.symptom_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptom_type TEXT NOT NULL,
  answers JSONB NOT NULL,
  overall_score NUMERIC NOT NULL,
  score_category TEXT NOT NULL,
  primary_issues TEXT[],
  detail_scores JSONB,
  recommendations JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.symptom_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own symptom assessments" 
ON public.symptom_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptom assessments" 
ON public.symptom_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom assessments" 
ON public.symptom_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_symptom_assessments_updated_at
BEFORE UPDATE ON public.symptom_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_symptom_assessments_user_id ON public.symptom_assessments(user_id);
CREATE INDEX idx_symptom_assessments_symptom_type ON public.symptom_assessments(symptom_type);
CREATE INDEX idx_symptom_assessments_completed_at ON public.symptom_assessments(completed_at);
CREATE INDEX idx_symptom_assessments_user_symptom_date ON public.symptom_assessments(user_id, symptom_type, completed_at);