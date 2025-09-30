-- Create table for mindset quiz leads
CREATE TABLE public.mindset_quiz_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT,
  answers JSONB NOT NULL,
  mindset_type TEXT NOT NULL,
  habit_score NUMERIC,
  mindset_score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mindset_quiz_leads ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting leads (allow anonymous and authenticated)
CREATE POLICY "Anyone can submit mindset quiz"
ON public.mindset_quiz_leads
FOR INSERT
WITH CHECK (true);

-- Create policy for viewing own leads (authenticated users only)
CREATE POLICY "Users can view their own mindset quiz results"
ON public.mindset_quiz_leads
FOR SELECT
USING (auth.uid() = user_id OR (auth.uid() IS NULL AND user_id IS NULL));

-- Create index for faster lookups
CREATE INDEX idx_mindset_quiz_leads_email ON public.mindset_quiz_leads(email);
CREATE INDEX idx_mindset_quiz_leads_user_id ON public.mindset_quiz_leads(user_id);