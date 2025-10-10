-- Create symptom_tracking table for daily symptom logs
CREATE TABLE IF NOT EXISTS public.symptom_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_id text NOT NULL, -- e.g., 'hot-flashes', 'sleep', 'joint-pain'
  severity integer NOT NULL CHECK (severity >= 0 AND severity <= 10),
  notes text,
  tracked_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, symptom_id, tracked_date)
);

-- Enable RLS
ALTER TABLE public.symptom_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own symptom tracking"
  ON public.symptom_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom tracking"
  ON public.symptom_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom tracking"
  ON public.symptom_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom tracking"
  ON public.symptom_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_symptom_tracking_user_date ON public.symptom_tracking(user_id, tracked_date DESC);
CREATE INDEX idx_symptom_tracking_symptom ON public.symptom_tracking(symptom_id);

-- Create trigger for updated_at
CREATE TRIGGER update_symptom_tracking_updated_at
  BEFORE UPDATE ON public.symptom_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();