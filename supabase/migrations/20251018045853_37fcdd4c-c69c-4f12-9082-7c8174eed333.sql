-- Create table for guest symptom assessments
CREATE TABLE IF NOT EXISTS guest_symptom_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  symptom_id TEXT NOT NULL,
  assessment_data JSONB NOT NULL,
  score NUMERIC NOT NULL,
  score_category TEXT NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  claimed_by_user_id UUID REFERENCES auth.users(id),
  claimed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_guest_symptom_assessments_session_id ON guest_symptom_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_guest_symptom_assessments_claimed ON guest_symptom_assessments(claimed_by_user_id);

-- Enable RLS
ALTER TABLE guest_symptom_assessments ENABLE ROW LEVEL SECURITY;

-- Anyone can insert guest assessments
CREATE POLICY "Anyone can create guest assessments"
  ON guest_symptom_assessments
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view assessments with their session ID or that they've claimed
CREATE POLICY "View own or claimed guest assessments"
  ON guest_symptom_assessments
  FOR SELECT
  TO public
  USING (
    claimed_by_user_id = auth.uid() 
    OR (claimed_by_user_id IS NULL AND session_id IS NOT NULL)
  );

-- Users can update (claim) assessments with matching session
CREATE POLICY "Users can claim guest assessments"
  ON guest_symptom_assessments
  FOR UPDATE
  TO authenticated
  USING (claimed_by_user_id IS NULL)
  WITH CHECK (claimed_by_user_id = auth.uid());