-- Add columns to daily_scores table for baseline tracking
ALTER TABLE daily_scores 
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual_entry',
ADD COLUMN IF NOT EXISTS assessment_type TEXT DEFAULT 'daily_tracking',
ADD COLUMN IF NOT EXISTS is_baseline BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS questionnaire_data JSONB NULL;

-- Add constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_source_type'
  ) THEN
    ALTER TABLE daily_scores 
    ADD CONSTRAINT valid_source_type 
    CHECK (source_type IN ('lifestyle_baseline', 'wearable_auto', 'manual_entry'));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_assessment_type'
  ) THEN
    ALTER TABLE daily_scores 
    ADD CONSTRAINT valid_assessment_type 
    CHECK (assessment_type IN ('lifestyle_baseline', 'daily_tracking', 'quarterly_review'));
  END IF;
END $$;

-- Create index for quick baseline lookups
CREATE INDEX IF NOT EXISTS idx_daily_scores_baseline 
ON daily_scores(user_id, is_baseline, created_at DESC);

-- Create table for baseline re-assessment prompts
CREATE TABLE IF NOT EXISTS baseline_assessment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  last_baseline_date DATE NOT NULL,
  next_prompt_date DATE NOT NULL,
  prompt_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on baseline_assessment_schedule
ALTER TABLE baseline_assessment_schedule ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own schedule" ON baseline_assessment_schedule;
DROP POLICY IF EXISTS "Users can insert own schedule" ON baseline_assessment_schedule;
DROP POLICY IF EXISTS "Users can update own schedule" ON baseline_assessment_schedule;

-- RLS policies for baseline_assessment_schedule
CREATE POLICY "Users can view own schedule" 
ON baseline_assessment_schedule 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own schedule" 
ON baseline_assessment_schedule 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own schedule" 
ON baseline_assessment_schedule 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at on baseline_assessment_schedule
DROP TRIGGER IF EXISTS update_baseline_assessment_schedule_updated_at ON baseline_assessment_schedule;
CREATE TRIGGER update_baseline_assessment_schedule_updated_at
BEFORE UPDATE ON baseline_assessment_schedule
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();