-- Fix Security Issue: Recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS unified_assessments;

CREATE VIEW unified_assessments 
WITH (security_invoker = true)
AS
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

-- Grant appropriate access to the view
GRANT SELECT ON unified_assessments TO authenticated;