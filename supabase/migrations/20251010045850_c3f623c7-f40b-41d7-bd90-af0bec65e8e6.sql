
-- Create missing assessments that are currently marked as symptoms

-- Brain Fog Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('brain-fog', 'Brain Fog Assessment', 'Evaluate mental clarity, concentration, and cognitive fatigue', 'brain', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Clear mental function with sharp focus and minimal brain fog"},
  "good": {"min": 60, "max": 79, "description": "Occasional mental fatigue but generally good cognitive clarity"},
  "fair": {"min": 40, "max": 59, "description": "Regular brain fog episodes affecting daily function"},
  "poor": {"min": 0, "max": 39, "description": "Significant cognitive difficulties with persistent brain fog"}
}'::jsonb);

-- Sleep Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('sleep', 'Sleep Quality Assessment', 'Evaluate sleep patterns, quality, and restoration', 'balance', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Consistently restful sleep with high energy upon waking"},
  "good": {"min": 60, "max": 79, "description": "Generally good sleep with occasional disturbances"},
  "fair": {"min": 40, "max": 59, "description": "Frequent sleep issues affecting daytime function"},
  "poor": {"min": 0, "max": 39, "description": "Severe sleep problems with significant impact on health"}
}'::jsonb);

-- Anxiety Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('anxiety', 'Anxiety & Stress Assessment', 'Assess stress levels, anxiety symptoms, and emotional regulation', 'balance', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Calm and balanced with effective stress management"},
  "good": {"min": 60, "max": 79, "description": "Manageable stress with occasional anxiety"},
  "fair": {"min": 40, "max": 59, "description": "Regular anxiety affecting daily activities"},
  "poor": {"min": 0, "max": 39, "description": "Severe anxiety significantly impacting quality of life"}
}'::jsonb);

-- Energy Levels Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('energy-levels', 'Energy & Vitality Assessment', 'Track energy patterns, fatigue, and sustained vitality', 'balance', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Consistent high energy throughout the day"},
  "good": {"min": 60, "max": 79, "description": "Good energy with occasional afternoon slumps"},
  "fair": {"min": 40, "max": 59, "description": "Frequent fatigue affecting productivity"},
  "poor": {"min": 0, "max": 39, "description": "Chronic exhaustion and low energy"}
}'::jsonb);

-- Mood Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('mood', 'Mood & Emotional Wellbeing Assessment', 'Evaluate emotional balance, mood stability, and mental health', 'balance', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Stable positive mood with emotional resilience"},
  "good": {"min": 60, "max": 79, "description": "Generally positive with occasional mood fluctuations"},
  "fair": {"min": 40, "max": 59, "description": "Frequent mood changes affecting relationships"},
  "poor": {"min": 0, "max": 39, "description": "Persistent low mood or emotional instability"}
}'::jsonb);

-- Skin Health Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('skin-health', 'Skin Health & Vitality Assessment', 'Assess skin quality, aging signs, and cellular health', 'beauty', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Vibrant, healthy skin with minimal aging signs"},
  "good": {"min": 60, "max": 79, "description": "Good skin health with some visible aging"},
  "fair": {"min": 40, "max": 59, "description": "Noticeable skin issues requiring attention"},
  "poor": {"min": 0, "max": 39, "description": "Significant skin concerns affecting appearance"}
}'::jsonb);

-- Hair Thinning Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('hair-thinning', 'Hair Health Assessment', 'Evaluate hair quality, thickness, and growth patterns', 'beauty', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Thick, healthy hair with strong growth"},
  "good": {"min": 60, "max": 79, "description": "Good hair health with minor concerns"},
  "fair": {"min": 40, "max": 59, "description": "Noticeable hair thinning or loss"},
  "poor": {"min": 0, "max": 39, "description": "Significant hair loss affecting confidence"}
}'::jsonb);

-- Weight Changes Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('weight-changes', 'Weight Management Assessment', 'Track weight patterns, metabolic health, and body composition goals', 'body', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Healthy weight with stable metabolism"},
  "good": {"min": 60, "max": 79, "description": "Minor weight fluctuations, mostly controlled"},
  "fair": {"min": 40, "max": 59, "description": "Significant weight challenges affecting health"},
  "poor": {"min": 0, "max": 39, "description": "Severe weight issues requiring intervention"}
}'::jsonb);

-- Joint Pain Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('joint-pain', 'Joint & Muscle Health Assessment', 'Assess joint pain, mobility, and musculoskeletal health', 'body', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "Pain-free movement with excellent mobility"},
  "good": {"min": 60, "max": 79, "description": "Occasional discomfort, generally mobile"},
  "fair": {"min": 40, "max": 59, "description": "Regular pain affecting daily activities"},
  "poor": {"min": 0, "max": 39, "description": "Severe pain limiting movement and function"}
}'::jsonb);

-- Hot Flashes Assessment
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('hot-flashes', 'Hot Flashes & Temperature Regulation Assessment', 'Track hot flashes, night sweats, and temperature dysregulation', 'balance', NULL, 
'{
  "excellent": {"min": 80, "max": 100, "description": "No or minimal hot flashes"},
  "good": {"min": 60, "max": 79, "description": "Occasional hot flashes, manageable"},
  "fair": {"min": 40, "max": 59, "description": "Frequent hot flashes disrupting daily life"},
  "poor": {"min": 0, "max": 39, "description": "Severe hot flashes significantly impacting quality of life"}
}'::jsonb);

-- Now add questions for each assessment

-- Brain Fog Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('brain-fog', 'How often do you experience difficulty concentrating or focusing?', 1, 'Cognitive Clarity'),
('brain-fog', 'How would you rate your mental clarity and sharpness?', 2, 'Mental Function'),
('brain-fog', 'How often do you forget things or have memory lapses?', 3, 'Memory'),
('brain-fog', 'Do you experience mental fatigue that affects your productivity?', 4, 'Mental Energy'),
('brain-fog', 'How clearly can you think and process information?', 5, 'Processing Speed');

-- Sleep Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('sleep', 'How would you rate your overall sleep quality?', 1, 'Sleep Quality'),
('sleep', 'How long does it typically take you to fall asleep?', 2, 'Sleep Onset'),
('sleep', 'How often do you wake up during the night?', 3, 'Sleep Continuity'),
('sleep', 'How rested do you feel when you wake up?', 4, 'Sleep Restoration'),
('sleep', 'How many hours of sleep do you typically get per night?', 5, 'Sleep Duration');

-- Anxiety Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('anxiety', 'How often do you feel anxious or worried?', 1, 'Anxiety Frequency'),
('anxiety', 'How well can you manage stress in your daily life?', 2, 'Stress Management'),
('anxiety', 'Do you experience physical symptoms of anxiety (racing heart, sweating)?', 3, 'Physical Symptoms'),
('anxiety', 'How much does anxiety interfere with your daily activities?', 4, 'Functional Impact'),
('anxiety', 'How relaxed and calm do you feel generally?', 5, 'Baseline Calm');

-- Energy Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('energy-levels', 'How would you rate your energy levels throughout the day?', 1, 'Energy Consistency'),
('energy-levels', 'How often do you experience afternoon energy crashes?', 2, 'Energy Stability'),
('energy-levels', 'How energized do you feel when you wake up?', 3, 'Morning Energy'),
('energy-levels', 'Can you maintain energy for physical and mental tasks?', 4, 'Energy Capacity'),
('energy-levels', 'How often do you feel exhausted or fatigued?', 5, 'Fatigue Frequency');

-- Mood Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('mood', 'How would you describe your overall mood?', 1, 'Mood Baseline'),
('mood', 'How often do you experience mood swings?', 2, 'Mood Stability'),
('mood', 'How optimistic and positive do you feel?', 3, 'Positive Outlook'),
('mood', 'Do you feel emotionally balanced and stable?', 4, 'Emotional Regulation'),
('mood', 'How satisfied are you with your emotional wellbeing?', 5, 'Overall Satisfaction');

-- Skin Health Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('skin-health', 'How would you rate your skin quality and appearance?', 1, 'Skin Quality'),
('skin-health', 'Do you experience dryness, irritation, or sensitivity?', 2, 'Skin Condition'),
('skin-health', 'How noticeable are aging signs (wrinkles, fine lines)?', 3, 'Aging Markers'),
('skin-health', 'How even is your skin tone and texture?', 4, 'Skin Uniformity'),
('skin-health', 'How hydrated and plump does your skin feel?', 5, 'Skin Hydration');

-- Hair Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('hair-thinning', 'How would you rate your hair thickness and volume?', 1, 'Hair Density'),
('hair-thinning', 'Have you noticed increased hair shedding or loss?', 2, 'Hair Loss'),
('hair-thinning', 'How healthy and strong does your hair feel?', 3, 'Hair Health'),
('hair-thinning', 'How satisfied are you with your hair growth rate?', 4, 'Hair Growth'),
('hair-thinning', 'Do you experience dry or brittle hair?', 5, 'Hair Condition');

-- Weight Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('weight-changes', 'How stable has your weight been recently?', 1, 'Weight Stability'),
('weight-changes', 'How satisfied are you with your current weight?', 2, 'Weight Satisfaction'),
('weight-changes', 'How well can you control your appetite and cravings?', 3, 'Appetite Control'),
('weight-changes', 'How has your body composition changed recently?', 4, 'Body Composition'),
('weight-changes', 'How effective is your metabolism?', 5, 'Metabolic Function');

-- Joint Pain Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('joint-pain', 'How would you rate your joint pain levels?', 1, 'Pain Severity'),
('joint-pain', 'How much does joint pain limit your activities?', 2, 'Functional Impact'),
('joint-pain', 'How stiff do your joints feel, especially in the morning?', 3, 'Joint Stiffness'),
('joint-pain', 'How would you rate your overall mobility?', 4, 'Mobility'),
('joint-pain', 'Do you experience muscle aches or soreness?', 5, 'Muscle Discomfort');

-- Hot Flashes Questions
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('hot-flashes', 'How often do you experience hot flashes?', 1, 'Frequency'),
('hot-flashes', 'How severe are your hot flashes when they occur?', 2, 'Severity'),
('hot-flashes', 'Do you experience night sweats?', 3, 'Night Symptoms'),
('hot-flashes', 'How much do hot flashes disrupt your daily activities?', 4, 'Daily Impact'),
('hot-flashes', 'How well can you manage temperature regulation?', 5, 'Temperature Control');

-- Now add options for all questions (using a standard 5-point scale for consistency)
-- We'll add options for each question using DO block to iterate

DO $$
DECLARE
  question_record RECORD;
BEGIN
  FOR question_record IN 
    SELECT id FROM assessment_questions 
    WHERE assessment_id IN ('brain-fog', 'sleep', 'anxiety', 'energy-levels', 'mood', 'skin-health', 'hair-thinning', 'weight-changes', 'joint-pain', 'hot-flashes')
  LOOP
    INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
    (question_record.id, 'Excellent / Never', 1, 100),
    (question_record.id, 'Good / Rarely', 2, 75),
    (question_record.id, 'Fair / Sometimes', 3, 50),
    (question_record.id, 'Poor / Often', 4, 25),
    (question_record.id, 'Very Poor / Always', 5, 0);
  END LOOP;
END $$;
