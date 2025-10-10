-- Seed all assessments with their questions and options
-- This migration includes all existing assessments plus the 3 missing Performance Journey assessments

-- Helper function to insert assessment with questions
DO $$
DECLARE
  v_assessment_id TEXT;
  v_question_id UUID;
BEGIN

-- 1. COGNITIVE FUNCTION
INSERT INTO public.assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('cognitive-function', 'Cognitive Function Assessment', 'Comprehensive cognitive performance evaluation based on validated neuropsychological measures', 'brain', NULL, 
 '{"excellent": {"min": 85, "max": 100, "description": "Superior cognitive function across all domains"}, "good": {"min": 70, "max": 84, "description": "Good cognitive function with minor areas for improvement"}, "fair": {"min": 50, "max": 69, "description": "Moderate cognitive challenges requiring attention"}, "poor": {"min": 0, "max": 49, "description": "Significant cognitive difficulties needing comprehensive support"}}'::jsonb);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How would you rate your ability to remember recent conversations or events?', 1, 'Memory') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - I rarely forget details', 1, 100),
(v_question_id, 'Good - I remember most things', 2, 75),
(v_question_id, 'Fair - I sometimes forget details', 3, 50),
(v_question_id, 'Poor - I frequently forget conversations', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How easily can you hold and manipulate information in your mind (e.g., mental math, following complex instructions)?', 2, 'Memory') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Very easily - No difficulty', 1, 100),
(v_question_id, 'Fairly easily - Minor challenges', 2, 75),
(v_question_id, 'With difficulty - Noticeable challenges', 3, 50),
(v_question_id, 'Very difficult - Significant struggles', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How long can you maintain focus on a single task without distraction?', 3, 'Focus') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Over 2 hours easily', 1, 100),
(v_question_id, '1-2 hours', 2, 75),
(v_question_id, '30 minutes to 1 hour', 3, 50),
(v_question_id, 'Less than 30 minutes', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How quickly do you understand and respond to new information?', 4, 'Processing') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Very quickly - I''m usually the first to grasp concepts', 1, 100),
(v_question_id, 'Quickly - I understand at a normal pace', 2, 75),
(v_question_id, 'Slowly - I need extra time', 3, 50),
(v_question_id, 'Very slowly - I struggle to keep up', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How well can you plan, organize, and complete complex multi-step tasks?', 5, 'Executive Function') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - I handle complex tasks effortlessly', 1, 100),
(v_question_id, 'Good - I manage well with some effort', 2, 75),
(v_question_id, 'Fair - I struggle with complex tasks', 3, 50),
(v_question_id, 'Poor - Complex tasks overwhelm me', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('cognitive-function', 'How easily can you find the right words when speaking or writing?', 6, 'Language') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Very easily - Words come naturally', 1, 100),
(v_question_id, 'Fairly easily - Occasional word-finding issues', 2, 75),
(v_question_id, 'With difficulty - Frequent word-finding problems', 3, 50),
(v_question_id, 'Very difficult - Constant word-finding struggles', 4, 25);

-- NEW: ATHLETIC PERFORMANCE (Performance Journey)
INSERT INTO public.assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('athletic-performance', 'Athletic Performance Assessment', 'Comprehensive evaluation of athletic capacity, strength, power, and endurance based on sports science research', 'body', 'performance', 
 '{"excellent": {"min": 85, "max": 100, "description": "Elite athletic performance - competition ready"}, "good": {"min": 70, "max": 84, "description": "Strong athletic performance with room for optimization"}, "fair": {"min": 50, "max": 69, "description": "Moderate athletic capacity - training needed"}, "poor": {"min": 0, "max": 49, "description": "Limited athletic performance - comprehensive program required"}}'::jsonb);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('athletic-performance', 'How would you rate your maximum strength levels?', 1, 'Strength') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Lift heavy weights with proper form', 1, 100),
(v_question_id, 'Good - Strong but room for improvement', 2, 75),
(v_question_id, 'Fair - Moderate strength levels', 3, 50),
(v_question_id, 'Poor - Struggling with basic strength exercises', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('athletic-performance', 'How is your explosive power (sprinting, jumping, rapid movements)?', 2, 'Power') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Fast and explosive', 1, 100),
(v_question_id, 'Good - Decent power output', 2, 75),
(v_question_id, 'Fair - Limited explosiveness', 3, 50),
(v_question_id, 'Poor - Very slow movements', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('athletic-performance', 'What is your cardiovascular endurance level?', 3, 'Endurance') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Can sustain high intensity for extended periods', 1, 100),
(v_question_id, 'Good - Solid endurance base', 2, 75),
(v_question_id, 'Fair - Limited cardiovascular fitness', 3, 50),
(v_question_id, 'Poor - Get winded quickly', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('athletic-performance', 'How is your athletic agility and coordination?', 4, 'Agility') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Quick direction changes, precise movements', 1, 100),
(v_question_id, 'Good - Generally agile', 2, 75),
(v_question_id, 'Fair - Some coordination issues', 3, 50),
(v_question_id, 'Poor - Clumsy or uncoordinated', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('athletic-performance', 'How quickly do you reach peak performance during workouts?', 5, 'Readiness') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Ready immediately, strong from start', 1, 100),
(v_question_id, 'Good - Quick warm-up needed', 2, 75),
(v_question_id, 'Fair - Need extended warm-up', 3, 50),
(v_question_id, 'Poor - Never feel fully ready', 4, 25);

-- NEW: RECOVERY OPTIMIZATION (Performance Journey)
INSERT INTO public.assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('recovery-optimization', 'Recovery Optimization Assessment', 'Evidence-based evaluation of recovery capacity, HRV, muscle soreness, and training readiness', 'body', 'performance', 
 '{"excellent": {"min": 85, "max": 100, "description": "Optimal recovery - ready for peak performance"}, "good": {"min": 70, "max": 84, "description": "Good recovery with minor areas to optimize"}, "fair": {"min": 50, "max": 69, "description": "Suboptimal recovery - intervention needed"}, "poor": {"min": 0, "max": 49, "description": "Poor recovery - comprehensive protocol required"}}'::jsonb);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('recovery-optimization', 'How well do you recover between training sessions?', 1, 'Recovery Rate') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Feel fully recovered within 24 hours', 1, 100),
(v_question_id, 'Good - Recover within 24-48 hours', 2, 75),
(v_question_id, 'Fair - Need 3-4 days to recover', 3, 50),
(v_question_id, 'Poor - Always feel fatigued, never fully recovered', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('recovery-optimization', 'How is your morning heart rate variability (HRV) or resting heart rate?', 2, 'HRV') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - High HRV, low resting HR', 1, 100),
(v_question_id, 'Good - Moderate HRV, normal resting HR', 2, 75),
(v_question_id, 'Fair - Low HRV, elevated resting HR', 3, 50),
(v_question_id, 'Poor - Very low HRV, high resting HR', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('recovery-optimization', 'How severe is your muscle soreness after training?', 3, 'Muscle Soreness') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Minimal - Little to no soreness', 1, 100),
(v_question_id, 'Mild - Some soreness but manageable', 2, 75),
(v_question_id, 'Moderate - Significant soreness affecting movement', 3, 50),
(v_question_id, 'Severe - Debilitating soreness, can''t train', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('recovery-optimization', 'How is your sleep quality after intense training?', 4, 'Sleep Recovery') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Deep, restorative sleep', 1, 100),
(v_question_id, 'Good - Generally sleep well', 2, 75),
(v_question_id, 'Fair - Disrupted or light sleep', 3, 50),
(v_question_id, 'Poor - Can''t sleep or very restless', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('recovery-optimization', 'How ready do you feel for the next training session?', 5, 'Training Readiness') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Eager and energized', 1, 100),
(v_question_id, 'Good - Ready with minor fatigue', 2, 75),
(v_question_id, 'Fair - Reluctant, still tired', 3, 50),
(v_question_id, 'Poor - Dreading it, completely exhausted', 4, 25);

-- NEW: BODY COMPOSITION (Performance Journey)
INSERT INTO public.assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('body-composition', 'Body Composition Assessment', 'Comprehensive body composition analysis including muscle mass, body fat percentage, and metabolic health markers', 'body', 'performance', 
 '{"excellent": {"min": 85, "max": 100, "description": "Optimal body composition - peak metabolic health"}, "good": {"min": 70, "max": 84, "description": "Good body composition with room for refinement"}, "fair": {"min": 50, "max": 69, "description": "Suboptimal composition - targeted interventions needed"}, "poor": {"min": 0, "max": 49, "description": "Poor body composition - comprehensive program required"}}'::jsonb);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('body-composition', 'How would you rate your current muscle mass relative to your goals?', 1, 'Muscle Mass') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - At or above target muscle mass', 1, 100),
(v_question_id, 'Good - Close to target with minor gains needed', 2, 75),
(v_question_id, 'Fair - Below target, noticeable deficiency', 3, 50),
(v_question_id, 'Poor - Significantly lacking muscle mass', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('body-composition', 'How is your body fat percentage relative to your sport/goals?', 2, 'Body Fat') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Lean and defined', 1, 100),
(v_question_id, 'Good - Healthy body fat levels', 2, 75),
(v_question_id, 'Fair - Slightly above ideal', 3, 50),
(v_question_id, 'Poor - Significantly above ideal', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('body-composition', 'How is your muscle definition and vascularity?', 3, 'Definition') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Clearly defined muscles, visible vascularity', 1, 100),
(v_question_id, 'Good - Some definition visible', 2, 75),
(v_question_id, 'Fair - Limited definition', 3, 50),
(v_question_id, 'Poor - No visible muscle definition', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('body-composition', 'How is your metabolic health (energy levels, blood sugar stability)?', 4, 'Metabolic Health') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Stable energy, no crashes', 1, 100),
(v_question_id, 'Good - Generally stable', 2, 75),
(v_question_id, 'Fair - Some energy fluctuations', 3, 50),
(v_question_id, 'Poor - Frequent crashes, poor energy', 4, 25);

INSERT INTO public.assessment_questions (assessment_id, question_text, question_order, category) VALUES
('body-composition', 'How satisfied are you with your body composition progress?', 5, 'Progress') RETURNING id INTO v_question_id;
INSERT INTO public.assessment_question_options (question_id, option_text, option_order, score_value) VALUES
(v_question_id, 'Excellent - Making great progress toward goals', 1, 100),
(v_question_id, 'Good - Steady progress', 2, 75),
(v_question_id, 'Fair - Slow or inconsistent progress', 3, 50),
(v_question_id, 'Poor - No progress or regressing', 4, 25);

END $$;