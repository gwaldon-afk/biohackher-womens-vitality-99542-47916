
-- 4. SLEEP DISRUPTION (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('sleep', 'How often do you wake up during the night?', 1, 'Night Waking'),
('sleep', 'Do hot flushes or night sweats disrupt your sleep?', 2, 'Vasomotor Disruption'),
('sleep', 'How would you rate your overall sleep quality?', 3, 'Sleep Quality'),
('sleep', 'How does poor sleep affect your daytime functioning?', 4, 'Daytime Impact'),
('sleep', 'How long does it take you to fall asleep at night?', 5, 'Sleep Onset'),
('sleep', 'Do you wake at a consistent time naturally, or is your sleep schedule erratic?', 6, 'Circadian Rhythm');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'sleep';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'Rarely - Sleep through the night', 1, 100),
  (q_ids[1], 'Occasionally - 1-2 times per week', 2, 65),
  (q_ids[1], 'Frequently - 3-5 times per week', 3, 35),
  (q_ids[1], 'Nightly - Multiple times per night', 4, 10),
  (q_ids[2], 'Never', 1, 100),
  (q_ids[2], 'Occasionally - Mild disruption', 2, 65),
  (q_ids[2], 'Frequently - Moderate disruption', 3, 35),
  (q_ids[2], 'Nightly - Severe disruption', 4, 10),
  (q_ids[3], 'Excellent - Deep and restorative', 1, 100),
  (q_ids[3], 'Good - Generally rested', 2, 65),
  (q_ids[3], 'Fair - Often unrefreshed', 3, 35),
  (q_ids[3], 'Poor - Never feel rested', 4, 10),
  (q_ids[4], 'No impact - Feel energized', 1, 100),
  (q_ids[4], 'Mild - Slightly tired', 2, 65),
  (q_ids[4], 'Moderate - Affects productivity', 3, 35),
  (q_ids[4], 'Severe - Significantly impaired', 4, 10),
  (q_ids[5], 'Quickly - Within 15 minutes', 1, 100),
  (q_ids[5], 'Moderately - 15-30 minutes', 2, 65),
  (q_ids[5], 'Slowly - 30-60 minutes', 3, 35),
  (q_ids[5], 'Very slowly - Over an hour or insomnia', 4, 10),
  (q_ids[6], 'Very consistent - Natural wake-up', 1, 100),
  (q_ids[6], 'Mostly consistent - Occasional variation', 2, 65),
  (q_ids[6], 'Inconsistent - Wake times vary significantly', 3, 35),
  (q_ids[6], 'Very erratic - No pattern at all', 4, 10);
END $$;

-- 5. MOOD CHANGES (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('mood', 'Have you experienced increased mood swings during menopause?', 1, 'Mood Swings'),
('mood', 'Do you feel more irritable or short-tempered than before?', 2, 'Irritability'),
('mood', 'How emotionally sensitive do you feel (crying easily, feeling overwhelmed)?', 3, 'Emotional Sensitivity'),
('mood', 'Have you experienced periods of low mood or feeling down?', 4, 'Low Mood'),
('mood', 'How often do you experience feelings of anxiety or worry related to menopause?', 5, 'Anxiety'),
('mood', 'How well can you manage and recover from emotional challenges?', 6, 'Coping');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'mood';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'No - Mood is stable', 1, 100),
  (q_ids[1], 'Occasionally - Minor fluctuations', 2, 65),
  (q_ids[1], 'Frequently - Noticeable swings', 3, 35),
  (q_ids[1], 'Constantly - Unpredictable emotions', 4, 10),
  (q_ids[2], 'No - Same as before', 1, 100),
  (q_ids[2], 'Slightly - Occasional irritability', 2, 65),
  (q_ids[2], 'Noticeably - Frequently irritable', 3, 35),
  (q_ids[2], 'Very - Constantly on edge', 4, 10),
  (q_ids[3], 'Not at all', 1, 100),
  (q_ids[3], 'Somewhat - Occasionally emotional', 2, 65),
  (q_ids[3], 'Very - Cry or feel overwhelmed easily', 3, 35),
  (q_ids[3], 'Extremely - Emotions feel out of control', 4, 10),
  (q_ids[4], 'No - Feel positive', 1, 100),
  (q_ids[4], 'Occasionally - Brief low periods', 2, 65),
  (q_ids[4], 'Frequently - Regular low mood', 3, 35),
  (q_ids[4], 'Persistently - Most days feel down', 4, 10),
  (q_ids[5], 'Rarely - Feel calm', 1, 100),
  (q_ids[5], 'Sometimes - Manageable anxiety', 2, 65),
  (q_ids[5], 'Often - Frequent anxiety', 3, 35),
  (q_ids[5], 'Constantly - Overwhelming anxiety', 4, 10),
  (q_ids[6], 'Very well - Bounce back quickly', 1, 100),
  (q_ids[6], 'Well - Recover within a day', 2, 65),
  (q_ids[6], 'Poorly - Takes days to recover', 3, 35),
  (q_ids[6], 'Very poorly - Struggle to recover', 4, 10);
END $$;

-- 6. SKIN HEALTH (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('skin-health', 'Have you noticed increased skin dryness during menopause?', 1, 'Dryness'),
('skin-health', 'Do you feel your skin has become thinner or more fragile?', 2, 'Thinning'),
('skin-health', 'Have wrinkles or fine lines appeared or worsened more rapidly?', 3, 'Wrinkle Acceleration'),
('skin-health', 'Is your skin more sensitive or reactive than before?', 4, 'Sensitivity'),
('skin-health', 'How has the texture and smoothness of your skin changed?', 5, 'Texture'),
('skin-health', 'How quickly do minor skin injuries or blemishes heal?', 6, 'Healing');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'skin-health';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'No - Skin remains hydrated', 1, 100),
  (q_ids[1], 'Slightly - Need more moisturizer', 2, 70),
  (q_ids[1], 'Noticeably - Persistently dry', 3, 40),
  (q_ids[1], 'Severely - Very dehydrated', 4, 10),
  (q_ids[2], 'No - Same thickness', 1, 100),
  (q_ids[2], 'Slightly - A bit more delicate', 2, 70),
  (q_ids[2], 'Noticeably - Significantly thinner', 3, 40),
  (q_ids[2], 'Very - Paper-thin or bruises easily', 4, 10),
  (q_ids[3], 'No - Same as before', 1, 100),
  (q_ids[3], 'Slightly - Minor new lines', 2, 70),
  (q_ids[3], 'Noticeably - Clear acceleration', 3, 40),
  (q_ids[3], 'Dramatically - Rapid aging visible', 4, 10),
  (q_ids[4], 'No - Not sensitive', 1, 100),
  (q_ids[4], 'Slightly - Occasional reactions', 2, 70),
  (q_ids[4], 'Noticeably - Frequent sensitivity', 3, 40),
  (q_ids[4], 'Very - Reacts to most products', 4, 10),
  (q_ids[5], 'No change - Still smooth', 1, 100),
  (q_ids[5], 'Slightly rougher or uneven', 2, 70),
  (q_ids[5], 'Noticeably rough or crepey', 3, 40),
  (q_ids[5], 'Very rough - Significant textural changes', 4, 10),
  (q_ids[6], 'Quickly - Within days', 1, 100),
  (q_ids[6], 'Normally - About a week', 2, 70),
  (q_ids[6], 'Slowly - 1-2 weeks', 3, 40),
  (q_ids[6], 'Very slowly - Weeks or scarring', 4, 10);
END $$;
