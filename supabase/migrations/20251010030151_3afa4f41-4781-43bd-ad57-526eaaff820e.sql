-- Insert Supplement items (Brain pillar)
INSERT INTO public.toolkit_items (
  category_id, slug, name, description, detailed_description,
  target_symptoms, contraindications, evidence_level,
  protocols, benefits, research_citations, display_order
)
VALUES
-- Lion's Mane Mushroom
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'lions-mane',
  'Lion''s Mane Mushroom',
  'Cognitive enhancement and nerve growth factor support',
  'Natural nootropic mushroom that supports brain health, cognitive function, and may promote nerve growth factor production for neuroplasticity.',
  '["brain-fog", "memory-issues", "cognitive-decline"]'::jsonb,
  '[{"condition": "Mushroom allergies", "severity": "high"}, {"condition": "Autoimmune conditions", "severity": "medium"}]'::jsonb,
  'silver',
  '[{"dosage": "1000mg daily", "timing": "Morning with food", "frequency": "daily"}]'::jsonb,
  '["Cognitive enhancement", "Nerve growth factor support", "Memory improvement"]'::jsonb,
  '[{
    "title": "Lion''s Mane Mushroom Study",
    "url": "https://pubmed.ncbi.nlm.nih.gov/31413233/",
    "studyType": "RCT"
  }]'::jsonb,
  1
),
-- Phosphatidylserine
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'phosphatidylserine',
  'Phosphatidylserine',
  'Memory improvement and stress reduction',
  'Essential phospholipid that supports brain cell membranes, enhances memory, focus, and helps reduce cortisol levels.',
  '["memory-issues", "brain-fog", "stress"]'::jsonb,
  '[{"condition": "Blood thinners", "severity": "medium"}, {"condition": "Soy allergies", "severity": "high"}]'::jsonb,
  'gold',
  '[{"dosage": "100mg daily", "timing": "Evening before bed", "frequency": "daily"}]'::jsonb,
  '["Memory improvement", "Focus enhancement", "Stress reduction"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/25933483/", "studyType": "Meta-analysis"}]'::jsonb,
  2
),
-- CoQ10 Ubiquinol
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'coq10',
  'CoQ10 Ubiquinol',
  'Mitochondrial support and energy production',
  'Powerful antioxidant that supports cellular energy production, heart health, and reduces oxidative stress.',
  '["energy-fluctuations", "fatigue", "heart-health"]'::jsonb,
  '[{"condition": "Blood pressure medications", "severity": "medium"}]'::jsonb,
  'gold',
  '[{"dosage": "200mg daily", "timing": "With fatty meal", "frequency": "daily"}]'::jsonb,
  '["Mitochondrial support", "Energy production", "Heart health"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/29302906/", "studyType": "RCT"}]'::jsonb,
  3
),
-- Magnesium Glycinate
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'magnesium-glycinate',
  'Magnesium Glycinate',
  'Muscle function, sleep quality, and stress reduction',
  'Highly bioavailable form of magnesium that supports muscle relaxation, sleep quality, and nervous system health.',
  '["sleep-disruption", "muscle-tension", "anxiety", "stress"]'::jsonb,
  '[{"condition": "Kidney disease", "severity": "high"}]'::jsonb,
  'gold',
  '[{"dosage": "400mg daily", "timing": "Evening before bed", "frequency": "daily"}]'::jsonb,
  '["Improved muscle function", "Better sleep quality", "Stress reduction"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/23853635/", "studyType": "RCT"}]'::jsonb,
  4
),
-- Omega-3 EPA/DHA
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'omega-3',
  'Omega-3 EPA/DHA',
  'Anti-inflammatory support and brain health',
  'Essential fatty acids that reduce inflammation, support heart health, and promote optimal brain function.',
  '["inflammation", "joint-pain", "brain-fog", "mood-changes"]'::jsonb,
  '[{"condition": "Blood thinners", "severity": "medium"}, {"condition": "Fish allergies", "severity": "high"}]'::jsonb,
  'gold',
  '[{"dosage": "2-3g daily", "timing": "With meals", "frequency": "daily"}]'::jsonb,
  '["Inflammation reduction", "Heart health", "Brain support"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/31662871/", "studyType": "Meta-analysis"}]'::jsonb,
  5
),
-- Ashwagandha
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'supplements'),
  'ashwagandha',
  'Ashwagandha',
  'Stress adaptation and cortisol regulation',
  'Adaptogenic herb that helps the body manage stress, balance cortisol levels, and support energy throughout the day.',
  '["stress", "anxiety", "fatigue", "cortisol-issues"]'::jsonb,
  '[{"condition": "Autoimmune conditions", "severity": "medium"}, {"condition": "Nightshade allergies", "severity": "high"}]'::jsonb,
  'gold',
  '[{"dosage": "600mg daily", "timing": "Morning or evening", "frequency": "daily"}]'::jsonb,
  '["Stress adaptation", "Cortisol regulation", "Energy balance"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/31991619/", "studyType": "RCT"}]'::jsonb,
  6
)
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  detailed_description = EXCLUDED.detailed_description,
  target_symptoms = EXCLUDED.target_symptoms,
  contraindications = EXCLUDED.contraindications,
  evidence_level = EXCLUDED.evidence_level,
  protocols = EXCLUDED.protocols,
  benefits = EXCLUDED.benefits,
  research_citations = EXCLUDED.research_citations,
  display_order = EXCLUDED.display_order;