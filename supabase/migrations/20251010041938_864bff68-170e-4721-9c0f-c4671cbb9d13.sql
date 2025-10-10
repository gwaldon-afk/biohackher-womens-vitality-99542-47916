-- Create table for storing AI-generated insights
CREATE TABLE public.user_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'weekly_summary', 'anomaly_detected', 'protocol_suggestion', 'trend_analysis'
  category TEXT NOT NULL, -- 'sleep', 'stress', 'activity', 'nutrition', 'overall'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations JSONB, -- Array of actionable recommendations
  data_points JSONB, -- Reference to the data that generated this insight
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  is_viewed BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own insights"
  ON public.user_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.user_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON public.user_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_insights_user_id ON public.user_insights(user_id);
CREATE INDEX idx_user_insights_generated_at ON public.user_insights(generated_at DESC);
CREATE INDEX idx_user_insights_priority ON public.user_insights(priority);
CREATE INDEX idx_user_insights_is_viewed ON public.user_insights(is_viewed) WHERE is_viewed = false;