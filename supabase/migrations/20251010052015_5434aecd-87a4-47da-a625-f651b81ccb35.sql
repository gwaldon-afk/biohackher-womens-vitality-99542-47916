-- Add questions for the 8 new assessments

-- GUT HEALTH ASSESSMENT QUESTIONS
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('gut', 'How would you describe your bowel movement frequency?', 1, 'regularity'),
('gut', 'What is the typical consistency of your bowel movements?', 2, 'function'),
('gut', 'How often do you experience bloating or gas?', 3, 'symptoms'),
('gut', 'Do you experience stomach pain or cramping?', 4, 'discomfort'),
('gut', 'How would you rate your overall digestive comfort after meals?', 5, 'comfort'),
('gut', 'Do you have any food intolerances or sensitivities?', 6, 'sensitivities'),
('gut', 'How often do you experience heartburn or acid reflux?', 7, 'symptoms'),
('gut', 'Do you experience nausea regularly?', 8, 'symptoms'),
('gut', 'How diverse is your diet (variety of foods)?', 9, 'nutrition'),
('gut', 'Do you consume fermented foods or probiotics regularly?', 10, 'microbiome');

-- Gut health question options
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('1-2 times per day (ideal)', 1, 10),
  ('Once daily', 2, 8),
  ('Every other day', 3, 5),
  ('Less than 3 times per week', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Well-formed and easy to pass', 1, 10),
  ('Sometimes soft, sometimes firm', 2, 7),
  ('Often hard or difficult to pass', 3, 3),
  ('Frequently loose or watery', 4, 3)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely or never', 1, 10),
  ('1-2 times per week', 2, 7),
  ('3-4 times per week', 3, 4),
  ('Daily or multiple times daily', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never', 1, 10),
  ('Rarely (less than once a month)', 2, 8),
  ('Occasionally (1-2 times per week)', 3, 4),
  ('Frequently (3+ times per week)', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Excellent - no discomfort', 1, 10),
  ('Good - occasional mild discomfort', 2, 7),
  ('Fair - regular moderate discomfort', 3, 4),
  ('Poor - frequent significant discomfort', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No known sensitivities', 1, 10),
  ('1-2 mild sensitivities', 2, 7),
  ('Several sensitivities I manage', 3, 4),
  ('Many sensitivities affecting food choices', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never', 1, 10),
  ('Rarely (less than once a month)', 2, 7),
  ('Weekly', 3, 4),
  ('Several times per week or daily', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never', 1, 10),
  ('Rarely', 2, 7),
  ('Sometimes', 3, 4),
  ('Frequently', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 8;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very diverse - eat 30+ different foods weekly', 1, 10),
  ('Moderately diverse - 20-30 foods', 2, 7),
  ('Limited diversity - 10-20 foods', 3, 4),
  ('Very limited - same foods repeatedly', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 9;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Daily or most days', 1, 10),
  ('Several times per week', 2, 7),
  ('Occasionally', 3, 4),
  ('Rarely or never', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'gut' AND q.question_order = 10;

-- BLOATING ASSESSMENT QUESTIONS
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('bloating', 'How often do you experience bloating?', 1, 'frequency'),
('bloating', 'When does your bloating typically occur?', 2, 'timing'),
('bloating', 'How severe is your bloating when it occurs?', 3, 'severity'),
('bloating', 'Does bloating affect your clothing fit or comfort?', 4, 'impact'),
('bloating', 'Do certain foods consistently trigger your bloating?', 5, 'triggers'),
('bloating', 'How long does your bloating typically last?', 6, 'duration'),
('bloating', 'Do you experience visible abdominal distension?', 7, 'physical'),
('bloating', 'How does bloating affect your daily activities?', 8, 'functional');

-- Bloating question options
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely or never', 1, 10),
  ('1-2 times per week', 2, 7),
  ('3-5 times per week', 3, 4),
  ('Daily or multiple times daily', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No consistent pattern', 1, 10),
  ('After certain meals', 2, 7),
  ('In the evening', 3, 5),
  ('Throughout the day progressively worsening', 4, 2)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Mild - barely noticeable', 1, 10),
  ('Moderate - uncomfortable but manageable', 2, 6),
  ('Severe - very uncomfortable', 3, 3),
  ('Extreme - painful and distressing', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Not at all', 1, 10),
  ('Occasionally feels tight', 2, 7),
  ('Often need looser clothing', 3, 4),
  ('Significantly affects clothing choices', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No clear food triggers', 1, 10),
  ('1-2 foods I can identify', 2, 7),
  ('Several foods trigger symptoms', 3, 4),
  ('Many foods cause bloating', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Less than 1 hour', 1, 10),
  ('1-3 hours', 2, 7),
  ('3-6 hours', 3, 4),
  ('All day or overnight', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No visible distension', 1, 10),
  ('Slight visible swelling', 2, 7),
  ('Noticeable swelling', 3, 4),
  ('Significant visible distension', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No impact on activities', 1, 10),
  ('Minor occasional disruption', 2, 7),
  ('Regular impact on comfort and activities', 3, 4),
  ('Significantly limits daily activities', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'bloating' AND q.question_order = 8;