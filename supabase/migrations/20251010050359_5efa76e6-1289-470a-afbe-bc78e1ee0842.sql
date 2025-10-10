
-- 2. WEIGHT CHANGES ASSESSMENT (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('weight-changes', 'Have you experienced unexplained weight gain during menopause?', 1, 'Weight Gain'),
('weight-changes', 'How has your body composition changed (muscle vs. fat distribution)?', 2, 'Body Composition'),
('weight-changes', 'How would you rate your metabolism now compared to before menopause?', 3, 'Metabolism'),
('weight-changes', 'How difficult is it to maintain or lose weight now?', 4, 'Weight Management'),
('weight-changes', 'How have your hunger and appetite patterns changed during menopause?', 5, 'Appetite'),
('weight-changes', 'How does your body respond to exercise for weight management now?', 6, 'Exercise Impact');

DO $$
DECLARE
  q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids 
  FROM assessment_questions WHERE assessment_id = 'weight-changes';

  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'No weight gain', 1, 100),
  (q_ids[1], 'Slight gain (2-5 lbs)', 2, 70),
  (q_ids[1], 'Moderate gain (5-15 lbs)', 3, 40),
  (q_ids[1], 'Significant gain (15+ lbs)', 4, 10),
  (q_ids[2], 'No change', 1, 100),
  (q_ids[2], 'Slight redistribution to midsection', 2, 70),
  (q_ids[2], 'Noticeable muscle loss and fat gain', 3, 40),
  (q_ids[2], 'Significant changes affecting body shape', 4, 10),
  (q_ids[3], 'Same or better', 1, 100),
  (q_ids[3], 'Slightly slower', 2, 70),
  (q_ids[3], 'Noticeably slower', 3, 40),
  (q_ids[3], 'Much slower - Feels broken', 4, 10),
  (q_ids[4], 'No more difficult than before', 1, 100),
  (q_ids[4], 'Slightly more challenging', 2, 70),
  (q_ids[4], 'Much more difficult', 3, 40),
  (q_ids[4], 'Nearly impossible despite efforts', 4, 10),
  (q_ids[5], 'No change - Same as before', 1, 100),
  (q_ids[5], 'Slightly increased or more cravings', 2, 70),
  (q_ids[5], 'Significantly increased - Constant hunger', 3, 40),
  (q_ids[5], 'Uncontrollable cravings or binge patterns', 4, 10),
  (q_ids[6], 'Responds well - Same as before', 1, 100),
  (q_ids[6], 'Slightly less responsive', 2, 70),
  (q_ids[6], 'Much less responsive - Need more effort', 3, 40),
  (q_ids[6], 'Barely responds - Exercise doesn''t help', 4, 10);
END $$;

-- 3. JOINT PAIN / MUSCLE MAINTENANCE (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('joint-pain', 'Have you noticed a loss of muscle strength during menopause?', 1, 'Strength'),
('joint-pain', 'Have you experienced changes in muscle mass or tone?', 2, 'Muscle Mass'),
('joint-pain', 'How has your response to exercise and resistance training changed?', 3, 'Exercise Response'),
('joint-pain', 'How quickly do your muscles recover after physical activity?', 4, 'Recovery'),
('joint-pain', 'Can you perform everyday tasks requiring strength as easily as before?', 5, 'Functional Capacity'),
('joint-pain', 'How well do your muscles support your joints during movement?', 6, 'Joint Support');

DO $$
DECLARE
  q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids 
  FROM assessment_questions WHERE assessment_id = 'joint-pain';

  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'No loss - Same strength', 1, 100),
  (q_ids[1], 'Slight loss - Barely noticeable', 2, 70),
  (q_ids[1], 'Moderate loss - Noticeable weakness', 3, 40),
  (q_ids[1], 'Significant loss - Major weakness', 4, 10),
  (q_ids[2], 'No change', 1, 100),
  (q_ids[2], 'Slight loss of definition', 2, 70),
  (q_ids[2], 'Noticeable muscle loss', 3, 40),
  (q_ids[2], 'Significant muscle wasting', 4, 10),
  (q_ids[3], 'Same response as before', 1, 100),
  (q_ids[3], 'Slightly less responsive', 2, 70),
  (q_ids[3], 'Much harder to build or maintain', 3, 40),
  (q_ids[3], 'Barely responds to training', 4, 10),
  (q_ids[4], 'Quick recovery - 24-48 hours', 1, 100),
  (q_ids[4], 'Normal recovery - 2-3 days', 2, 70),
  (q_ids[4], 'Slow recovery - 3-5 days', 3, 40),
  (q_ids[4], 'Very slow - Week+ or constant soreness', 4, 10),
  (q_ids[5], 'Yes - All tasks remain easy', 1, 100),
  (q_ids[5], 'Most tasks - Slight difficulty with heavy lifting', 2, 70),
  (q_ids[5], 'Some difficulty - Noticeable impact on daily tasks', 3, 40),
  (q_ids[5], 'Significant difficulty - Struggle with routine tasks', 4, 10),
  (q_ids[6], 'Excellent support - Stable and strong', 1, 100),
  (q_ids[6], 'Good support - Generally stable', 2, 70),
  (q_ids[6], 'Reduced support - Some instability', 3, 40),
  (q_ids[6], 'Poor support - Frequent joint pain or instability', 4, 10);
END $$;
