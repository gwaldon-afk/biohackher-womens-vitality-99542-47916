
-- 7. BRAIN FOG / Memory Changes (5 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('brain-fog', 'Do you have difficulty finding the right words when speaking?', 1, 'Word Finding'),
('brain-fog', 'How is your short-term memory (remembering recent conversations, where you put things)?', 2, 'Short-term Memory'),
('brain-fog', 'Do you struggle to complete tasks or maintain focus?', 3, 'Task Completion'),
('brain-fog', 'How would you describe your overall mental clarity?', 4, 'Mental Clarity'),
('brain-fog', 'How often do you forget to do things you planned (appointments, tasks, taking medications)?', 5, 'Prospective Memory');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'brain-fog';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'Rarely - Words come easily', 1, 100),
  (q_ids[1], 'Occasionally - Minor word-finding issues', 2, 65),
  (q_ids[1], 'Frequently - Noticeable difficulty', 3, 35),
  (q_ids[1], 'Constantly - Struggle to express thoughts', 4, 10),
  (q_ids[2], 'Excellent - Remember everything', 1, 100),
  (q_ids[2], 'Good - Occasional forgetfulness', 2, 65),
  (q_ids[2], 'Fair - Frequent memory lapses', 3, 35),
  (q_ids[2], 'Poor - Significant memory problems', 4, 10),
  (q_ids[3], 'No - Focus is good', 1, 100),
  (q_ids[3], 'Occasionally - Minor difficulty', 2, 65),
  (q_ids[3], 'Frequently - Hard to stay on task', 3, 35),
  (q_ids[3], 'Constantly - Very difficult to focus', 4, 10),
  (q_ids[4], 'Clear - Sharp and focused', 1, 100),
  (q_ids[4], 'Good - Generally clear', 2, 65),
  (q_ids[4], 'Foggy - Often unclear', 3, 35),
  (q_ids[4], 'Very foggy - Constant brain fog', 4, 10),
  (q_ids[5], 'Rarely - Remember everything', 1, 100),
  (q_ids[5], 'Sometimes - Occasional forgetfulness', 2, 65),
  (q_ids[5], 'Often - Frequently forget', 3, 35),
  (q_ids[5], 'Very often - Rely heavily on reminders', 4, 10);
END $$;

-- 8. ENERGY LEVELS / Energy Fluctuations (5 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('energy-levels', 'How variable are your energy levels throughout the day?', 1, 'Daily Variability'),
('energy-levels', 'Do you experience afternoon energy crashes?', 2, 'Afternoon Crashes'),
('energy-levels', 'Do you notice your energy fluctuates with your menstrual cycle or hormonal changes?', 3, 'Hormonal Correlation'),
('energy-levels', 'Can you sustain energy for activities you want to do?', 4, 'Sustained Activity'),
('energy-levels', 'How do you feel when you first wake up in the morning?', 5, 'Morning Energy');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'energy-levels';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'Stable - Consistent all day', 1, 100),
  (q_ids[1], 'Somewhat variable - Minor fluctuations', 2, 65),
  (q_ids[1], 'Very variable - Unpredictable', 3, 35),
  (q_ids[1], 'Extremely variable - Roller coaster', 4, 10),
  (q_ids[2], 'No - Maintain energy', 1, 100),
  (q_ids[2], 'Occasionally - Mild afternoon dip', 2, 65),
  (q_ids[2], 'Frequently - Regular crashes', 3, 35),
  (q_ids[2], 'Daily - Severe afternoon exhaustion', 4, 10),
  (q_ids[3], 'No correlation', 1, 100),
  (q_ids[3], 'Slight correlation', 2, 65),
  (q_ids[3], 'Noticeable correlation', 3, 35),
  (q_ids[3], 'Strong correlation - Dramatic changes', 4, 10),
  (q_ids[4], 'Yes - Good endurance', 1, 100),
  (q_ids[4], 'Mostly - Some limitations', 2, 65),
  (q_ids[4], 'Struggling - Limited capacity', 3, 35),
  (q_ids[4], 'No - Very limited energy', 4, 10),
  (q_ids[5], 'Energized and refreshed', 1, 100),
  (q_ids[5], 'Reasonably rested - Takes time to wake', 2, 65),
  (q_ids[5], 'Tired and groggy', 3, 35),
  (q_ids[5], 'Exhausted - Feel like I haven''t slept', 4, 10);
END $$;

-- 9. ANXIETY / Hormone Symptoms (6 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('anxiety', 'How would you rate the overall burden of your menopause symptoms?', 1, 'Overall Burden'),
('anxiety', 'How much do your symptoms disrupt your sleep?', 2, 'Sleep Impact'),
('anxiety', 'Do you experience joint pain or muscle aches?', 3, 'Joint/Muscle Pain'),
('anxiety', 'Have you noticed vaginal dryness or discomfort?', 4, 'Vaginal Symptoms'),
('anxiety', 'Do cognitive symptoms (brain fog, memory issues) affect your daily life?', 5, 'Cognitive Impact'),
('anxiety', 'Do you experience heart palpitations or irregular heartbeat?', 6, 'Cardiovascular');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'anxiety';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'Minimal - Manageable', 1, 100),
  (q_ids[1], 'Mild - Some disruption', 2, 65),
  (q_ids[1], 'Moderate - Regular impact', 3, 35),
  (q_ids[1], 'Severe - Major life disruption', 4, 10),
  (q_ids[2], 'Not at all', 1, 100),
  (q_ids[2], 'Occasionally', 2, 65),
  (q_ids[2], 'Frequently', 3, 35),
  (q_ids[2], 'Nightly - Significant impact', 4, 10),
  (q_ids[3], 'No', 1, 100),
  (q_ids[3], 'Occasionally', 2, 65),
  (q_ids[3], 'Frequently', 3, 35),
  (q_ids[3], 'Daily - Significant pain', 4, 10),
  (q_ids[4], 'No', 1, 100),
  (q_ids[4], 'Mild - Manageable', 2, 65),
  (q_ids[4], 'Moderate - Affects intimacy', 3, 35),
  (q_ids[4], 'Severe - Significantly impacts life', 4, 10),
  (q_ids[5], 'Not at all', 1, 100),
  (q_ids[5], 'Mildly - Minor impact', 2, 65),
  (q_ids[5], 'Moderately - Noticeable problems', 3, 35),
  (q_ids[5], 'Significantly - Major impairment', 4, 10),
  (q_ids[6], 'Never', 1, 100),
  (q_ids[6], 'Rarely - Occasional flutter', 2, 70),
  (q_ids[6], 'Sometimes - Regular occurrence', 3, 40),
  (q_ids[6], 'Frequently - Daily episodes', 4, 10);
END $$;

-- 10. HAIR THINNING (5 questions)
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('hair-thinning', 'Have you noticed hair thinning or increased hair loss?', 1, 'Hair Loss'),
('hair-thinning', 'Has the texture of your hair changed (drier, more brittle)?', 2, 'Texture Changes'),
('hair-thinning', 'Have you noticed changes in hair growth rate or density?', 3, 'Growth Changes'),
('hair-thinning', 'Do you see more hair on your pillow or in the shower?', 4, 'Shedding'),
('hair-thinning', 'How has your hair affected your confidence or self-image?', 5, 'Emotional Impact');

DO $$
DECLARE q_ids uuid[];
BEGIN
  SELECT array_agg(id ORDER BY question_order) INTO q_ids FROM assessment_questions WHERE assessment_id = 'hair-thinning';
  INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value) VALUES
  (q_ids[1], 'No - Hair is same', 1, 100),
  (q_ids[1], 'Slight thinning - Minor loss', 2, 70),
  (q_ids[1], 'Noticeable thinning - Visible loss', 3, 40),
  (q_ids[1], 'Significant thinning - Major concern', 4, 10),
  (q_ids[2], 'No - Same texture', 1, 100),
  (q_ids[2], 'Slightly drier or coarser', 2, 70),
  (q_ids[2], 'Noticeably different - Brittle', 3, 40),
  (q_ids[2], 'Dramatically changed - Very fragile', 4, 10),
  (q_ids[3], 'No change - Grows normally', 1, 100),
  (q_ids[3], 'Slightly slower growth', 2, 70),
  (q_ids[3], 'Noticeably slower - Thinner', 3, 40),
  (q_ids[3], 'Minimal growth - Significant thinning', 4, 10),
  (q_ids[4], 'Normal shedding', 1, 100),
  (q_ids[4], 'Slightly more than before', 2, 70),
  (q_ids[4], 'Noticeably more - Concerning amount', 3, 40),
  (q_ids[4], 'Excessive shedding - Very concerning', 4, 10),
  (q_ids[5], 'Not at all - Feel confident', 1, 100),
  (q_ids[5], 'Slightly - Minor concern', 2, 70),
  (q_ids[5], 'Noticeably - Affects confidence', 3, 40),
  (q_ids[5], 'Significantly - Major emotional impact', 4, 10);
END $$;
