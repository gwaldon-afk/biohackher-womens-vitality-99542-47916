-- Create missing assessments to match all 20 symptoms

-- 1. Gut Health Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('gut', 'Digestive Health Assessment', 'Comprehensive evaluation of gut health, digestion, and microbiome function', 'body', 
'{"excellent": {"min": 80, "max": 100, "description": "Optimal digestive function with regular bowel movements and no discomfort"}, 
"good": {"min": 60, "max": 79, "description": "Generally good digestion with occasional mild symptoms"}, 
"fair": {"min": 40, "max": 59, "description": "Moderate digestive issues requiring attention and lifestyle modifications"}, 
"poor": {"min": 0, "max": 39, "description": "Significant digestive problems requiring comprehensive intervention"}}'::jsonb);

-- 2. Bloating Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('bloating', 'Bloating & Abdominal Discomfort Assessment', 'Evaluate bloating patterns, triggers, and digestive comfort', 'body',
'{"excellent": {"min": 80, "max": 100, "description": "Minimal to no bloating with comfortable digestion"}, 
"good": {"min": 60, "max": 79, "description": "Occasional mild bloating that resolves quickly"}, 
"fair": {"min": 40, "max": 59, "description": "Frequent bloating affecting comfort and daily activities"}, 
"poor": {"min": 0, "max": 39, "description": "Severe chronic bloating significantly impacting quality of life"}}'::jsonb);

-- 3. Irregular Periods Assessment  
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('irregular-periods', 'Menstrual Cycle Regularity Assessment', 'Track cycle regularity, flow patterns, and menstrual symptoms', 'balance',
'{"excellent": {"min": 80, "max": 100, "description": "Regular predictable cycles with minimal symptoms"}, 
"good": {"min": 60, "max": 79, "description": "Generally regular cycles with some variability"}, 
"fair": {"min": 40, "max": 59, "description": "Irregular cycles requiring investigation and support"}, 
"poor": {"min": 0, "max": 39, "description": "Severely irregular or absent periods needing medical attention"}}'::jsonb);

-- 4. Headaches Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('headaches', 'Headache & Migraine Assessment', 'Evaluate headache frequency, intensity, triggers, and impact', 'brain',
'{"excellent": {"min": 80, "max": 100, "description": "Rare or no headaches with minimal impact"}, 
"good": {"min": 60, "max": 79, "description": "Occasional headaches that respond well to management"}, 
"fair": {"min": 40, "max": 59, "description": "Frequent headaches affecting daily function"}, 
"poor": {"min": 0, "max": 39, "description": "Chronic severe headaches or migraines significantly impacting life quality"}}'::jsonb);

-- 5. Night Sweats Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('night-sweats', 'Night Sweats & Temperature Dysregulation Assessment', 'Track night sweating patterns, severity, and sleep disruption', 'balance',
'{"excellent": {"min": 80, "max": 100, "description": "No night sweats with comfortable sleep temperature"}, 
"good": {"min": 60, "max": 79, "description": "Occasional mild night sweats with minimal sleep disruption"}, 
"fair": {"min": 40, "max": 59, "description": "Regular night sweats affecting sleep quality"}, 
"poor": {"min": 0, "max": 39, "description": "Severe night sweats causing significant sleep disruption"}}'::jsonb);

-- 6. Memory Issues Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('memory-issues', 'Memory & Recall Assessment', 'Evaluate memory function, recall ability, and cognitive retention', 'brain',
'{"excellent": {"min": 80, "max": 100, "description": "Sharp memory with excellent recall"}, 
"good": {"min": 60, "max": 79, "description": "Good memory with occasional minor lapses"}, 
"fair": {"min": 40, "max": 59, "description": "Noticeable memory difficulties affecting daily tasks"}, 
"poor": {"min": 0, "max": 39, "description": "Significant memory impairment requiring intervention"}}'::jsonb);

-- 7. Appearance Concerns Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('appearance-concerns', 'Physical Appearance & Self-Image Assessment', 'Evaluate concerns about physical appearance and its impact on wellbeing', 'beauty',
'{"excellent": {"min": 80, "max": 100, "description": "Positive body image with minimal appearance concerns"}, 
"good": {"min": 60, "max": 79, "description": "Generally satisfied with appearance with minor concerns"}, 
"fair": {"min": 40, "max": 59, "description": "Moderate appearance concerns affecting self-confidence"}, 
"poor": {"min": 0, "max": 39, "description": "Significant appearance concerns impacting mental wellbeing"}}'::jsonb);

-- 8. Sexual Function Assessment
INSERT INTO assessments (id, name, description, pillar, scoring_guidance) VALUES
('sexual-function', 'Sexual Health & Intimacy Assessment', 'Comprehensive evaluation of sexual function, desire, and satisfaction', 'balance',
'{"excellent": {"min": 80, "max": 100, "description": "Satisfying sexual function and intimacy"}, 
"good": {"min": 60, "max": 79, "description": "Generally good sexual function with minor concerns"}, 
"fair": {"min": 40, "max": 59, "description": "Moderate sexual function issues requiring support"}, 
"poor": {"min": 0, "max": 39, "description": "Significant sexual dysfunction affecting relationships and wellbeing"}}'::jsonb);

-- 9. Rename cognitive-function to match Symptoms.tsx if needed
-- (keeping cognitive-function as is, will map both IDs in frontend)

-- 10. Menopause Brain Health (specialized assessment)
INSERT INTO assessments (id, name, description, pillar, journey_path, scoring_guidance) VALUES
('menopause-brain-health', 'Menopause Cognitive Changes Assessment', 'Evaluate brain health changes during menopause transition', 'brain', 'menopause',
'{"excellent": {"min": 80, "max": 100, "description": "Minimal cognitive changes with good adaptation"}, 
"good": {"min": 60, "max": 79, "description": "Some cognitive changes managed effectively"}, 
"fair": {"min": 40, "max": 59, "description": "Moderate cognitive challenges during transition"}, 
"poor": {"min": 0, "max": 39, "description": "Significant cognitive difficulties requiring comprehensive support"}}'::jsonb);