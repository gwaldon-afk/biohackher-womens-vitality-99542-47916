-- Drop the incorrect guest_lis_assessments table
DROP TABLE IF EXISTS public.guest_lis_assessments CASCADE;

-- Recreate with the correct schema
CREATE TABLE public.guest_lis_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  brief_results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  claimed_by_user_id UUID,
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.guest_lis_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can insert guest assessments"
ON public.guest_lis_assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view guest assessments by session"
ON public.guest_lis_assessments
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update guest assessments"
ON public.guest_lis_assessments
FOR UPDATE
TO anon, authenticated
USING (true);

-- Add unique constraint on session_id
ALTER TABLE public.guest_lis_assessments
ADD CONSTRAINT guest_lis_assessments_session_id_key UNIQUE (session_id);

-- Add index on session_id for performance
CREATE INDEX idx_guest_lis_assessments_session_id ON public.guest_lis_assessments(session_id);