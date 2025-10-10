-- Questions for remaining 6 new assessments

-- IRREGULAR PERIODS ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('irregular-periods', 'How regular are your menstrual cycles?', 1, 'regularity'),
('irregular-periods', 'What is your average cycle length?', 2, 'cycle'),
('irregular-periods', 'How many days does your period typically last?', 3, 'duration'),
('irregular-periods', 'How would you describe your flow?', 4, 'flow'),
('irregular-periods', 'Do you experience spotting between periods?', 5, 'symptoms'),
('irregular-periods', 'How severe is your menstrual cramping?', 6, 'pain'),
('irregular-periods', 'Do you experience PMS symptoms?', 7, 'symptoms'),
('irregular-periods', 'How do menstrual symptoms impact your daily life?', 8, 'impact');

-- HEADACHES ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('headaches', 'How often do you experience headaches?', 1, 'frequency'),
('headaches', 'How would you describe the intensity of your headaches?', 2, 'severity'),
('headaches', 'How long do your headaches typically last?', 3, 'duration'),
('headaches', 'Do you experience migraine symptoms (aura, nausea, light sensitivity)?', 4, 'type'),
('headaches', 'Can you identify triggers for your headaches?', 5, 'triggers'),
('headaches', 'Where is the pain typically located?', 6, 'location'),
('headaches', 'How do headaches affect your ability to function?', 7, 'impact'),
('headaches', 'How well do pain relievers work for you?', 8, 'management');

-- NIGHT SWEATS ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('night-sweats', 'How often do you experience night sweats?', 1, 'frequency'),
('night-sweats', 'How severe are your night sweats?', 2, 'severity'),
('night-sweats', 'Do night sweats wake you from sleep?', 3, 'disruption'),
('night-sweats', 'Do you need to change clothing or bedding?', 4, 'impact'),
('night-sweats', 'At what time of night do they typically occur?', 5, 'timing'),
('night-sweats', 'How do night sweats affect your sleep quality?', 6, 'sleep-impact'),
('night-sweats', 'Are there triggers you can identify?', 7, 'triggers'),
('night-sweats', 'How do you feel the next day after night sweats?', 8, 'residual');

-- MEMORY ISSUES ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('memory-issues', 'How often do you experience memory lapses?', 1, 'frequency'),
('memory-issues', 'What type of information do you most often forget?', 2, 'type'),
('memory-issues', 'Do you have difficulty recalling recent conversations?', 3, 'recall'),
('memory-issues', 'How is your ability to remember names?', 4, 'names'),
('memory-issues', 'Do you frequently lose items?', 5, 'items'),
('memory-issues', 'How is your ability to learn new information?', 6, 'learning'),
('memory-issues', 'Do memory issues affect your work or daily tasks?', 7, 'function'),
('memory-issues', 'Have you noticed changes in your memory over time?', 8, 'progression');

-- APPEARANCE CONCERNS ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('appearance-concerns', 'How satisfied are you with your overall appearance?', 1, 'satisfaction'),
('appearance-concerns', 'How often do you think about your appearance?', 2, 'frequency'),
('appearance-concerns', 'Do appearance concerns affect your social activities?', 3, 'social'),
('appearance-concerns', 'How does your appearance affect your self-confidence?', 4, 'confidence'),
('appearance-concerns', 'Are there specific features you are concerned about?', 5, 'specifics'),
('appearance-concerns', 'How much time do you spend on appearance-related activities?', 6, 'time'),
('appearance-concerns', 'Do you avoid certain situations due to appearance concerns?', 7, 'avoidance'),
('appearance-concerns', 'How would you rate your body image?', 8, 'body-image');

-- SEXUAL FUNCTION ASSESSMENT
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('sexual-function', 'How satisfied are you with your sexual function?', 1, 'satisfaction'),
('sexual-function', 'How would you describe your libido or sexual desire?', 2, 'desire'),
('sexual-function', 'Do you experience arousal difficulties?', 3, 'arousal'),
('sexual-function', 'Do you experience pain or discomfort during intimacy?', 4, 'pain'),
('sexual-function', 'How is your ability to reach orgasm?', 5, 'orgasm'),
('sexual-function', 'Do you experience vaginal dryness?', 6, 'lubrication'),
('sexual-function', 'How do sexual concerns affect your relationship(s)?', 7, 'relationship'),
('sexual-function', 'How do you feel about intimacy overall?', 8, 'wellbeing');

-- Options for irregular-periods
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very regular (within 2-3 days)', 1, 10),
  ('Fairly regular (within 5-7 days)', 2, 7),
  ('Somewhat irregular (varies 7-14 days)', 3, 4),
  ('Very irregular or unpredictable', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('25-30 days (ideal range)', 1, 10),
  ('21-24 or 31-35 days', 2, 7),
  ('Less than 21 or more than 35 days', 3, 3),
  ('Highly variable or no pattern', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('3-5 days (typical)', 1, 10),
  ('2 days or 6-7 days', 2, 7),
  ('1 day or 8+ days', 3, 4),
  ('Highly variable', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Moderate and manageable', 1, 10),
  ('Light', 2, 7),
  ('Heavy but manageable', 3, 5),
  ('Very heavy or very light with concerns', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never', 1, 10),
  ('Rarely', 2, 7),
  ('Occasionally', 3, 4),
  ('Frequently', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('None to minimal', 1, 10),
  ('Mild, manageable with OTC pain relief', 2, 7),
  ('Moderate, sometimes affects activities', 3, 4),
  ('Severe, significantly impacts daily life', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Minimal or none', 1, 10),
  ('Mild symptoms easily managed', 2, 7),
  ('Moderate symptoms affecting mood/energy', 3, 4),
  ('Severe symptoms significantly impacting life', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No impact', 1, 10),
  ('Minor impact on 1-2 days', 2, 7),
  ('Moderate impact on several days', 3, 4),
  ('Significant impact affecting work/life', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'irregular-periods' AND q.question_order = 8;

-- Options for headaches (8 questions worth of options)
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely (less than once/month)', 1, 10),
  ('1-2 times per month', 2, 7),
  ('Weekly', 3, 4),
  ('Several times per week or daily', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Mild (barely noticeable)', 1, 10),
  ('Moderate (uncomfortable but functional)', 2, 6),
  ('Severe (significantly impairs function)', 3, 3),
  ('Extreme (debilitating)', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Less than 1 hour', 1, 10),
  ('1-4 hours', 2, 7),
  ('4-12 hours', 3, 4),
  ('More than 12 hours or days', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No migraine symptoms', 1, 10),
  ('Occasional mild symptoms', 2, 6),
  ('Regular migraine symptoms', 3, 3),
  ('Severe migraine symptoms', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Yes, clear triggers I can avoid', 1, 10),
  ('Some triggers I can sometimes avoid', 2, 7),
  ('Unclear triggers', 3, 4),
  ('No identifiable triggers', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Variable locations', 1, 7),
  ('One-sided (temple/behind eye)', 2, 5),
  ('Forehead or frontal', 3, 6),
  ('Entire head or base of skull', 4, 4)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Minimal impact, can continue activities', 1, 10),
  ('Some impact, slow down but functional', 2, 6),
  ('Significant impact, must rest', 3, 3),
  ('Unable to function, must lie down', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very effective, complete relief', 1, 10),
  ('Moderately effective, partial relief', 2, 6),
  ('Minimally effective', 3, 3),
  ('Ineffective, no relief', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'headaches' AND q.question_order = 8;

-- Night sweats options (shortened to save space)
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never or rarely', 1, 10),
  ('1-2 times per week', 2, 7),
  ('3-5 times per week', 3, 4),
  ('Nightly', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Mild dampness', 1, 10),
  ('Moderate sweating, uncomfortable', 2, 6),
  ('Heavy sweating, need to change', 3, 3),
  ('Drenching sweats', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely wake', 1, 10),
  ('Sometimes wake briefly', 2, 6),
  ('Often wake and have trouble returning to sleep', 3, 3),
  ('Always wake, major sleep disruption', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never need to change', 1, 10),
  ('Occasionally adjust covers', 2, 7),
  ('Often change clothing', 3, 3),
  ('Frequently change clothing and bedding', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No consistent pattern', 1, 7),
  ('Early night (first 2 hours)', 2, 6),
  ('Middle of night', 3, 5),
  ('Throughout the night', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Minimal impact', 1, 10),
  ('Somewhat disrupted sleep', 2, 6),
  ('Significantly disrupted sleep', 3, 3),
  ('Severe sleep deprivation', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Yes, clear triggers', 1, 10),
  ('Some possible triggers', 2, 7),
  ('Unclear triggers', 3, 4),
  ('No identifiable triggers', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Well-rested and energetic', 1, 10),
  ('Slightly tired but functional', 2, 7),
  ('Fatigued and low energy', 3, 4),
  ('Exhausted, significantly impaired', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'night-sweats' AND q.question_order = 8;