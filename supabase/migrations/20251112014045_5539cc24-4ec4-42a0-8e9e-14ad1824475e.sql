-- Create protocol_recommendations table to store assessment-generated protocols
CREATE TABLE protocol_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_assessment_id UUID NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('hormone_compass', 'lis', 'symptom', 'goal')),
  protocol_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed', 'partially_accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(user_id, source_assessment_id, source_type)
);

-- Enable RLS on protocol_recommendations
ALTER TABLE protocol_recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own recommendations
CREATE POLICY "Users can view own recommendations"
  ON protocol_recommendations FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own recommendations
CREATE POLICY "Users can update own recommendations"
  ON protocol_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own recommendations
CREATE POLICY "Users can insert own recommendations"
  ON protocol_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add source tracking columns to protocols table
ALTER TABLE protocols 
  ADD COLUMN IF NOT EXISTS source_recommendation_id UUID REFERENCES protocol_recommendations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_type TEXT CHECK (source_type IN ('hormone_compass', 'lis', 'symptom', 'goal', 'custom'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_protocols_source_recommendation ON protocols(source_recommendation_id);
CREATE INDEX IF NOT EXISTS idx_protocol_recommendations_user_status ON protocol_recommendations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_protocol_recommendations_source ON protocol_recommendations(source_assessment_id, source_type);