-- 1. Add Energy Metrics to User Health Profile
ALTER TABLE user_health_profile 
  ADD COLUMN IF NOT EXISTS latest_energy_score numeric,
  ADD COLUMN IF NOT EXISTS latest_energy_category text,
  ADD COLUMN IF NOT EXISTS energy_assessment_date date,
  ADD COLUMN IF NOT EXISTS chronic_fatigue_risk boolean DEFAULT false;

-- 2. Add Energy to Daily Scores
ALTER TABLE daily_scores 
  ADD COLUMN IF NOT EXISTS fatigue_score numeric;

-- 3. Create Unified Assessment View
CREATE OR REPLACE VIEW unified_assessments AS
  SELECT 
    user_id, 
    pillar, 
    assessment_id, 
    score, 
    completed_at,
    'pillar' as source
  FROM user_assessment_completions
  UNION ALL
  SELECT 
    user_id,
    'body' as pillar,
    symptom_type as assessment_id,
    overall_score as score,
    completed_at,
    'symptom' as source
  FROM symptom_assessments
  WHERE symptom_type = 'energy-levels';

-- 4. Function to Auto-Update Profile on Energy Assessment
CREATE OR REPLACE FUNCTION update_energy_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.symptom_type = 'energy-levels' THEN
    UPDATE user_health_profile
    SET 
      latest_energy_score = NEW.overall_score,
      latest_energy_category = NEW.score_category,
      energy_assessment_date = CURRENT_DATE,
      chronic_fatigue_risk = (NEW.overall_score < 40),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Auto-enable Energy Loop Module if score is poor
    IF NEW.overall_score < 60 THEN
      UPDATE profiles
      SET energy_loop_enabled = true
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Create Trigger for Auto-Update
DROP TRIGGER IF EXISTS update_profile_on_energy_assessment ON symptom_assessments;
CREATE TRIGGER update_profile_on_energy_assessment
  AFTER INSERT OR UPDATE ON symptom_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_energy_profile();