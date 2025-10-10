-- Final question options for memory-issues, appearance-concerns, and sexual-function

-- Memory issues options
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely', 1, 10),
  ('Occasionally', 2, 7),
  ('Frequently', 3, 4),
  ('Constantly', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely forget any type', 1, 10),
  ('Occasionally forget details or appointments', 2, 7),
  ('Often forget conversations or tasks', 3, 4),
  ('Frequently forget important information', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Excellent recall', 1, 10),
  ('Good recall, occasional lapses', 2, 7),
  ('Moderate difficulty', 3, 4),
  ('Significant difficulty', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very good at names', 1, 10),
  ('Generally good with some difficulty', 2, 7),
  ('Often struggle with names', 3, 4),
  ('Consistently difficult', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely', 1, 10),
  ('Sometimes', 2, 7),
  ('Often', 3, 4),
  ('Very frequently', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Quick learner, good retention', 1, 10),
  ('Learn well with some effort', 2, 7),
  ('Takes more time and repetition', 3, 4),
  ('Significant difficulty learning new things', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No impact', 1, 10),
  ('Minor impact, manage with strategies', 2, 7),
  ('Moderate impact on performance', 3, 4),
  ('Significant impact on function', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No change or improvement', 1, 10),
  ('Stable', 2, 7),
  ('Gradual decline', 3, 4),
  ('Noticeable worsening', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'memory-issues' AND q.question_order = 8;

-- Appearance concerns options
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very satisfied', 1, 10),
  ('Generally satisfied', 2, 7),
  ('Somewhat dissatisfied', 3, 4),
  ('Very dissatisfied', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Rarely', 1, 10),
  ('Occasionally', 2, 7),
  ('Frequently', 3, 4),
  ('Constantly preoccupied', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Not at all', 1, 10),
  ('Slightly', 2, 7),
  ('Moderately', 3, 4),
  ('Significantly limits activities', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Positive impact', 1, 10),
  ('Neutral', 2, 7),
  ('Somewhat negative', 3, 4),
  ('Very negative impact', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No specific concerns', 1, 10),
  ('1-2 minor concerns', 2, 7),
  ('Several concerns', 3, 4),
  ('Many significant concerns', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Normal routine (<30 min daily)', 1, 10),
  ('Moderate time (30-60 min daily)', 2, 7),
  ('Significant time (1-2 hours daily)', 3, 4),
  ('Excessive time (>2 hours daily)', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Never avoid situations', 1, 10),
  ('Rarely avoid', 2, 7),
  ('Sometimes avoid', 3, 4),
  ('Frequently avoid', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very positive', 1, 10),
  ('Generally positive', 2, 7),
  ('Somewhat negative', 3, 4),
  ('Very negative', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'appearance-concerns' AND q.question_order = 8;

-- Sexual function options
INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Very satisfied', 1, 10),
  ('Satisfied', 2, 7),
  ('Somewhat dissatisfied', 3, 4),
  ('Very dissatisfied', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 1;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Strong and healthy', 1, 10),
  ('Moderate, normal', 2, 7),
  ('Lower than desired', 3, 4),
  ('Very low or absent', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 2;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No difficulties', 1, 10),
  ('Occasional difficulties', 2, 7),
  ('Frequent difficulties', 3, 4),
  ('Consistent difficulties', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 3;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No pain', 1, 10),
  ('Occasional mild discomfort', 2, 7),
  ('Regular moderate pain', 3, 4),
  ('Significant pain preventing intimacy', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 4;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Normal, satisfying', 1, 10),
  ('Generally good', 2, 7),
  ('Difficult but possible', 3, 4),
  ('Very difficult or impossible', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 5;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No dryness', 1, 10),
  ('Occasional mild dryness', 2, 7),
  ('Regular moderate dryness', 3, 4),
  ('Severe persistent dryness', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 6;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('No negative impact', 1, 10),
  ('Minor impact', 2, 7),
  ('Moderate impact', 3, 4),
  ('Significant negative impact', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 7;

INSERT INTO assessment_question_options (question_id, option_text, option_order, score_value)
SELECT q.id, opt.text, opt.ord, opt.score FROM assessment_questions q
CROSS JOIN LATERAL (VALUES
  ('Positive and comfortable', 1, 10),
  ('Generally comfortable', 2, 7),
  ('Somewhat uncomfortable', 3, 4),
  ('Very uncomfortable or distressing', 4, 1)
) AS opt(text, ord, score)
WHERE q.assessment_id = 'sexual-function' AND q.question_order = 8;