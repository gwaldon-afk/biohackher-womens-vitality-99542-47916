-- Insert remaining Therapies items
INSERT INTO public.toolkit_items (
  category_id, slug, name, description, detailed_description,
  target_symptoms, contraindications, evidence_level,
  protocols, benefits, research_citations, display_order
)
VALUES
-- Cold Exposure
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'therapies'),
  'cold-exposure',
  'Cold Exposure',
  'Controlled exposure to cold temperatures activates brown fat and boosts metabolism',
  'Controlled exposure to cold temperatures activates your body''s special fat-burning tissue (brown adipose tissue) and triggers the release of norepinephrine, a hormone that naturally boosts your mood. It also strengthens your vagal nerve tone and trains your body to handle stress better, improving your metabolism and immune system over time',
  '["mood-changes", "energy-fluctuations", "weight-changes"]'::jsonb,
  '[{"condition": "Heart conditions", "severity": "high"}, {"condition": "Pregnancy", "severity": "high"}, {"condition": "Eating disorders", "severity": "medium"}]'::jsonb,
  'gold',
  '[
    {"name": "Cold Shower", "duration_minutes": 3, "temperature": "10-15°C", "frequency": "daily"},
    {"name": "Ice Bath", "duration_minutes": 2, "temperature": "7-13°C", "frequency": "3x/week"},
    {"name": "Cryotherapy", "duration_minutes": 1, "temperature": "Below 0°C", "frequency": "2x/week"}
  ]'::jsonb,
  '["Brown fat activation", "Mood enhancement", "Immune system boost"]'::jsonb,
  '[{
    "title": "Cold-water immersion and other forms of cryotherapy: physiological changes potentially affecting recovery from high-intensity exercise",
    "journal": "Extreme Physiology & Medicine",
    "year": 2013,
    "url": "https://pubmed.ncbi.nlm.nih.gov/24004719/",
    "doi": "10.1186/2046-7648-2-26",
    "studyType": "Review"
  }]'::jsonb,
  2
),
-- Heat/Cold Contrast
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'therapies'),
  'contrast-therapy',
  'Heat/Cold Contrast',
  'Alternating hot and cold to enhance circulation and recovery',
  'Alternating between hot and cold causes your blood vessels to expand (vasodilation) and contract (vasoconstriction), pumping fresh blood throughout your body. This flushes out metabolic waste, reduces muscle inflammation, and trains your nervous system to better handle stress while improving cardiovascular health',
  '["muscle-maintenance", "energy-fluctuations", "circulation-issues"]'::jsonb,
  '[{"condition": "Cardiovascular disease", "severity": "high"}, {"condition": "Pregnancy", "severity": "high"}, {"condition": "Blood pressure issues", "severity": "high"}]'::jsonb,
  'gold',
  '[
    {"name": "Sauna + Cold Plunge", "duration_minutes": 20, "cycles": "3 rounds", "frequency": "3x/week"},
    {"name": "Hot/Cold Shower", "duration_minutes": 12, "cycles": "4 rounds", "frequency": "daily"},
    {"name": "Steam + Ice", "duration_minutes": 15, "cycles": "3 rounds", "frequency": "2x/week"}
  ]'::jsonb,
  '["Enhanced circulation", "Faster muscle recovery", "Stress resilience"]'::jsonb,
  '[{
    "title": "Contrast Water Therapy and Exercise Induced Muscle Damage: A Systematic Review and Meta-Analysis",
    "journal": "PLoS ONE",
    "year": 2013,
    "url": "https://pubmed.ncbi.nlm.nih.gov/23626806/",
    "doi": "10.1371/journal.pone.0062356",
    "studyType": "Meta-analysis"
  }]'::jsonb,
  3
),
-- HRV Breathwork
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'therapies'),
  'hrv-breathwork',
  'HRV Breathwork',
  'Breathing techniques to improve heart rate variability and stress management',
  'Specific breathing techniques help balance your nervous system by improving heart rate variability (HRV), activating your body''s relaxation response (parasympathetic system), and lowering stress hormones like cortisol. This strengthens your vagal nerve, helping you manage emotions and handle stress more effectively',
  '["anxiety", "sleep-disruption", "stress"]'::jsonb,
  '[{"condition": "Panic disorders", "severity": "medium"}, {"condition": "Severe anxiety", "severity": "medium"}, {"condition": "Breathing disorders", "severity": "high"}]'::jsonb,
  'gold',
  '[
    {"name": "4-7-8 Breathing", "duration_minutes": 10, "pattern": "4in-7hold-8out", "frequency": "2x daily"},
    {"name": "Box Breathing", "duration_minutes": 15, "pattern": "4in-4hold-4out-4hold", "frequency": "daily"},
    {"name": "Coherent Breathing", "duration_minutes": 12, "pattern": "5in-5out", "frequency": "daily"}
  ]'::jsonb,
  '["Parasympathetic activation", "Stress reduction", "Sleep quality improvement"]'::jsonb,
  '[{
    "title": "The Effect of Diaphragmatic Breathing on Attention, Negative Affect and Stress in Healthy Adults",
    "journal": "Frontiers in Psychology",
    "year": 2017,
    "url": "https://pubmed.ncbi.nlm.nih.gov/31756711/",
    "doi": "10.3389/fpsyg.2017.00874",
    "studyType": "RCT"
  }]'::jsonb,
  4
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