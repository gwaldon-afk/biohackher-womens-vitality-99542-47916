-- Create user_symptoms table for personalized symptom tracking
CREATE TABLE public.user_symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptom_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  severity TEXT NOT NULL DEFAULT 'Mild',
  frequency TEXT NOT NULL DEFAULT 'Occasional',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symptom_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own symptoms" 
ON public.user_symptoms 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptoms" 
ON public.user_symptoms 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms" 
ON public.user_symptoms 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms" 
ON public.user_symptoms 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_symptoms_updated_at
BEFORE UPDATE ON public.user_symptoms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();