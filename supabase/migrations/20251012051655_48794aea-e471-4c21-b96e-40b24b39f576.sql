-- Create health_questions table for AI health assistant feature
CREATE TABLE IF NOT EXISTS public.health_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NULL,
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  ai_answer TEXT NOT NULL,
  extracted_concerns JSONB DEFAULT '[]'::jsonb,
  recommended_tools JSONB DEFAULT '[]'::jsonb,
  recommended_assessments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.health_questions ENABLE ROW LEVEL SECURITY;

-- Users can view their own questions
CREATE POLICY "Users can view own questions"
  ON public.health_questions FOR SELECT
  USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- Anyone can insert questions (for guest support)
CREATE POLICY "Anyone can insert questions"
  ON public.health_questions FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_questions_user_id ON public.health_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_health_questions_session_id ON public.health_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_health_questions_created_at ON public.health_questions(created_at DESC);