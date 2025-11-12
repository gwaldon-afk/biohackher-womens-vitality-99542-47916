-- First drop the old constraint so we can update the data
ALTER TABLE hormone_compass_stages 
DROP CONSTRAINT IF EXISTS menopause_stages_stage_check;

-- Now update existing data to use new scoring labels
UPDATE hormone_compass_stages
SET stage = CASE 
  WHEN stage = 'pre' THEN 'feeling-great'
  WHEN stage = 'early-peri' THEN 'doing-well'
  WHEN stage = 'mid-peri' THEN 'having-challenges'
  WHEN stage = 'late-peri' THEN 'really-struggling'
  WHEN stage = 'post' THEN 'doing-well'
  ELSE stage
END
WHERE stage IN ('pre', 'early-peri', 'mid-peri', 'late-peri', 'post');

-- Add updated constraint with new scoring labels
ALTER TABLE hormone_compass_stages 
ADD CONSTRAINT hormone_compass_stages_stage_check 
CHECK (stage IN ('feeling-great', 'doing-well', 'having-challenges', 'really-struggling', 'need-support'));