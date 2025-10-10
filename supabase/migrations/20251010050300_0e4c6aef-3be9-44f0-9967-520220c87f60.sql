
-- Fix: First delete ALL the generic questions and options
DELETE FROM assessment_question_options 
WHERE question_id IN (
  SELECT id FROM assessment_questions 
  WHERE assessment_id IN ('brain-fog', 'sleep', 'anxiety', 'energy-levels', 'mood', 
                          'skin-health', 'hair-thinning', 'weight-changes', 'joint-pain', 'hot-flashes')
);

DELETE FROM assessment_questions 
WHERE assessment_id IN ('brain-fog', 'sleep', 'anxiety', 'energy-levels', 'mood', 
                        'skin-health', 'hair-thinning', 'weight-changes', 'joint-pain', 'hot-flashes');

-- 1. HOT FLASHES (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('hot-flashes', 'How frequently do you experience hot flashes?', 1, 'Frequency'),
('hot-flashes', 'How severe are your hot flashes when they occur?', 2, 'Severity'),
('hot-flashes', 'Do you experience night sweats that disrupt your sleep?', 3, 'Night Symptoms'),
('hot-flashes', 'How much do hot flashes interfere with your daily activities and quality of life?', 4, 'Daily Impact'),
('hot-flashes', 'How long does each hot flush episode typically last?', 5, 'Duration'),
('hot-flashes', 'Can you identify specific triggers for your hot flushes?', 6, 'Triggers');

-- Add HOT FLASHES options (Fixed option_order)
DO $$
DECLARE
  q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids 
  FROM assessment_questions WHERE assessment_id = 'hot-flashes';

  -- Q1: Frequency
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'Never or rarely', 1, 100),
  (q_ids[1], 'A few times per week', 2, 65),
  (q_ids[1], 'Daily', 3, 35),
  (q_ids[1], 'Multiple times per day', 4, 10);

  -- Q2: Severity (FIXED - was 2,2,3,4 now 1,2,3,4)
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[2], 'Mild warmth - Barely noticeable', 1, 100),
  (q_ids[2], 'Moderate - Noticeable but manageable', 2, 65),
  (q_ids[2], 'Severe - Very uncomfortable', 3, 35),
  (q_ids[2], 'Extreme - Debilitating', 4, 10);

  -- Q3-Q6
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[3], 'Never', 1, 100),
  (q_ids[3], 'Occasionally - Can get back to sleep', 2, 65),
  (q_ids[3], 'Frequently - Disrupts sleep', 3, 35),
  (q_ids[3], 'Nightly - Need to change sheets/clothes', 4, 10),
  (q_ids[4], 'No impact', 1, 100),
  (q_ids[4], 'Minor inconvenience', 2, 65),
  (q_ids[4], 'Moderate impact on activities', 3, 35),
  (q_ids[4], 'Major impact - Limits what I can do', 4, 10),
  (q_ids[5], 'Brief - Less than 1 minute', 1, 100),
  (q_ids[5], 'Short - 1-3 minutes', 2, 65),
  (q_ids[5], 'Moderate - 3-5 minutes', 3, 35),
  (q_ids[5], 'Prolonged - More than 5 minutes', 4, 10),
  (q_ids[6], 'No flushes or easily avoided triggers', 1, 100),
  (q_ids[6], 'Few predictable triggers', 2, 65),
  (q_ids[6], 'Multiple triggers - Some unavoidable', 3, 35),
  (q_ids[6], 'Unpredictable - No clear triggers', 4, 10);
END $$;

-- Continue with remaining assessments using the same pattern...
-- I'll create the rest of the questions and use the array approach for efficiency
