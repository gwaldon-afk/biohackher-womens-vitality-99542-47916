-- Clean up any partial data and create body-composition assessment

-- Delete existing assessment data to start fresh
DELETE FROM public.assessment_question_options
WHERE question_id IN (
  SELECT id FROM public.assessment_questions
  WHERE assessment_id = 'body-composition'
);

DELETE FROM public.assessment_questions
WHERE assessment_id = 'body-composition';

DELETE FROM public.assessments
WHERE id = 'body-composition';

-- Insert assessment
INSERT INTO public.assessments (id, name, description, pillar, scoring_guidance)
VALUES (
  'body-composition',
  'Body Composition & Metabolism Assessment',
  'Evaluate muscle mass, metabolic health, and body composition for longevity optimization',
  'body',
  '{
    "excellent": {"min": 30, "max": 36, "description": "Optimal body composition and metabolic health - excellent foundation for longevity"},
    "good": {"min": 22, "max": 29, "description": "Solid body composition with room for targeted optimization"},
    "fair": {"min": 14, "max": 21, "description": "Moderate body composition concerns requiring focused intervention"},
    "poor": {"min": 0, "max": 13, "description": "Significant body composition challenges - professional guidance recommended"}
  }'::jsonb
);

-- Insert questions
INSERT INTO public.assessment_questions (assessment_id, question_order, question_text, category) VALUES
('body-composition', 1, 'How would you describe your current muscle mass and strength?', 'Muscle & Strength'),
('body-composition', 2, 'How often do you engage in resistance/strength training?', 'Muscle & Strength'),
('body-composition', 3, 'How much cardiovascular/aerobic activity do you do weekly?', 'Metabolic Health'),
('body-composition', 4, 'How easily can you perform daily functional movements (stairs, lifting, squatting)?', 'Muscle & Strength'),
('body-composition', 5, 'How stable is your energy throughout the day?', 'Metabolic Health'),
('body-composition', 6, 'Do you experience signs of poor metabolic health (blood sugar spikes, insulin resistance, constant hunger)?', 'Metabolic Health'),
('body-composition', 7, 'How adequate is your daily protein intake (aim: 1.6-2.2g per kg bodyweight)?', 'Nutrition'),
('body-composition', 8, 'What percentage of your diet consists of whole, unprocessed foods?', 'Nutrition'),
('body-composition', 9, 'How would you rate your sleep quality and recovery?', 'Recovery'),
('body-composition', 10, 'Do you actively track and work toward body composition goals?', 'Goals & Tracking');

-- Insert options for each question
-- Q1
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'Strong and well-developed muscle mass', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 1
UNION ALL SELECT id, 2, 'Moderate muscle mass with room to improve', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 1
UNION ALL SELECT id, 3, 'Below average muscle mass', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 1
UNION ALL SELECT id, 4, 'Very low muscle mass, feeling weak', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 1
UNION ALL SELECT id, 5, 'Unsure or not applicable', 0 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 1;

-- Q2
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, '4+ times per week with progressive overload', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 2
UNION ALL SELECT id, 2, '2-3 times per week consistently', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 2
UNION ALL SELECT id, 3, 'Once per week or occasionally', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 2
UNION ALL SELECT id, 4, 'Rarely or never', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 2;

-- Q3
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, '150+ minutes of moderate or 75+ vigorous', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 3
UNION ALL SELECT id, 2, '100-150 minutes moderate activity', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 3
UNION ALL SELECT id, 3, '30-100 minutes of activity', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 3
UNION ALL SELECT id, 4, 'Less than 30 minutes per week', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 3;

-- Q4
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'Very easily without fatigue', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 4
UNION ALL SELECT id, 2, 'Comfortably with minor effort', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 4
UNION ALL SELECT id, 3, 'With some difficulty or discomfort', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 4
UNION ALL SELECT id, 4, 'Very difficult or painful', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 4;

-- Q5
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'Consistently high and stable', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 5
UNION ALL SELECT id, 2, 'Generally good with minor dips', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 5
UNION ALL SELECT id, 3, 'Frequent energy crashes or low energy', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 5
UNION ALL SELECT id, 4, 'Constantly tired and low energy', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 5;

-- Q6
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'No metabolic concerns', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 6
UNION ALL SELECT id, 2, 'Occasional mild symptoms', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 6
UNION ALL SELECT id, 3, 'Frequent metabolic symptoms', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 6
UNION ALL SELECT id, 4, 'Diagnosed metabolic issues or severe symptoms', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 6;

-- Q7
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'I consistently meet or exceed protein targets', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 7
UNION ALL SELECT id, 2, 'I usually get adequate protein most days', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 7
UNION ALL SELECT id, 3, 'My protein intake is often insufficient', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 7
UNION ALL SELECT id, 4, 'I rarely prioritize protein', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 7;

-- Q8
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, '80%+ whole foods', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 8
UNION ALL SELECT id, 2, '60-80% whole foods', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 8
UNION ALL SELECT id, 3, '40-60% whole foods', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 8
UNION ALL SELECT id, 4, 'Less than 40% whole foods', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 8;

-- Q9
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'Excellent - 7-9 hours, wake refreshed', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 9
UNION ALL SELECT id, 2, 'Good - Usually adequate sleep', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 9
UNION ALL SELECT id, 3, 'Fair - Inconsistent or poor quality', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 9
UNION ALL SELECT id, 4, 'Poor - Chronic sleep issues', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 9;

-- Q10
INSERT INTO public.assessment_question_options (question_id, option_order, option_text, score_value)
SELECT id, 1, 'Yes, I track metrics and adjust regularly', 4 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 10
UNION ALL SELECT id, 2, 'I have goals but track inconsistently', 3 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 10
UNION ALL SELECT id, 3, E'I have goals but don''t track', 2 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 10
UNION ALL SELECT id, 4, 'No specific goals or tracking', 1 FROM public.assessment_questions WHERE assessment_id = 'body-composition' AND question_order = 10;

-- Add columns to user_health_profile
ALTER TABLE public.user_health_profile 
ADD COLUMN IF NOT EXISTS last_body_comp_assessment timestamp with time zone,
ADD COLUMN IF NOT EXISTS body_comp_score numeric;