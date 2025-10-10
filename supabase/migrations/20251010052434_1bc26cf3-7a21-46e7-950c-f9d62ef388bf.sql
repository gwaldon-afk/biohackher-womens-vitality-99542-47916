-- Add questions for menopause-brain-health assessment
INSERT INTO assessment_questions (assessment_id, question_text, question_order, category) VALUES
('menopause-brain-health', 'Have you noticed changes in your memory since perimenopause/menopause began?', 1, 'cognitive'),
('menopause-brain-health', 'How often do you experience "brain fog" or mental cloudiness?', 2, 'clarity'),
('menopause-brain-health', 'Have you noticed changes in your ability to focus or concentrate?', 3, 'focus'),
('menopause-brain-health', 'How would you describe your word-finding ability?', 4, 'verbal'),
('menopause-brain-health', 'Do you experience mental fatigue more easily than before?', 5, 'fatigue'),
('menopause-brain-health', 'How has your ability to multitask been affected?', 6, 'executive'),
('menopause-brain-health', 'Are you concerned about these cognitive changes?', 7, 'emotional'),
('menopause-brain-health', 'Have cognitive changes affected your work or daily activities?', 8, 'functional');

-- Options for menopause-brain-health
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No noticeable changes', 1, 10),
  ('Mild changes, barely noticeable', 2, 7),
  ('Moderate changes, clearly different', 3, 4),
  ('Significant changes, very concerning', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely or never', 1, 10),
  ('1-2 times per week', 2, 7),
  ('Most days', 3, 4),
  ('Daily or constantly', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No change', 1, 10),
  ('Slight decrease', 2, 7),
  ('Noticeable decrease', 3, 4),
  ('Significant difficulty focusing', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Normal, no issues', 1, 10),
  ('Occasional word-finding pauses', 2, 7),
  ('Frequent difficulty finding words', 3, 4),
  ('Significant word-finding problems', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No, same as before', 1, 10),
  ('Slightly more easily', 2, 7),
  ('Noticeably more easily', 3, 4),
  ('Significantly exhausted mentally', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No change in multitasking', 1, 10),
  ('Slightly more difficult', 2, 7),
  ('Noticeably harder, prefer single tasks', 3, 4),
  ('Very difficult, must focus on one thing', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Not at all concerned', 1, 10),
  ('Mildly concerned', 2, 7),
  ('Moderately concerned', 3, 4),
  ('Very concerned', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No impact', 1, 10),
  ('Minor impact occasionally', 2, 7),
  ('Moderate impact regularly', 3, 4),
  ('Significant impact on function', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'menopause-brain-health' AND q.question_order = 8;