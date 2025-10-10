-- Insert Sleep protocol items
INSERT INTO public.toolkit_items (
  category_id, slug, name, description, detailed_description,
  target_symptoms, contraindications, evidence_level,
  protocols, benefits, research_citations, display_order
)
VALUES
-- Evening Wind-Down Routine
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'sleep'),
  'evening-wind-down',
  'Evening Wind-Down Routine',
  'Prepare your body and mind for restorative sleep',
  'A comprehensive evening routine designed to optimize your circadian rhythm and transition smoothly into deep, restorative sleep.',
  '["sleep-disruption", "insomnia", "poor-sleep-quality"]'::jsonb,
  '[]'::jsonb,
  'gold',
  '[
    {"step": "Dim lights to <50 lux", "timing": "2h before bed"},
    {"step": "Stop blue light screens or use blue light blockers", "timing": "1h before"},
    {"step": "Set room temperature to 18-20°C", "timing": "1h before"},
    {"step": "Take magnesium glycinate supplement", "timing": "30min before"},
    {"step": "Take warm bath or shower", "timing": "90min before"},
    {"step": "Write down tomorrow''s priorities", "timing": "30min before"},
    {"step": "Read fiction book with warm light", "timing": "15min before"}
  ]'::jsonb,
  '["Improved sleep onset", "Better sleep quality", "Reduced nighttime anxiety"]'::jsonb,
  '[{"url": "https://pubmed.ncbi.nlm.nih.gov/20469800/", "studyType": "Meta-analysis"}]'::jsonb,
  1
),
-- Blue Light Management
(
  (SELECT id FROM public.toolkit_categories WHERE slug = 'sleep'),
  'blue-light-management',
  'Blue Light Management',
  'Optimize circadian rhythm through light exposure',
  'Strategic light exposure protocol to strengthen your natural circadian rhythm and improve melatonin production.',
  '["sleep-disruption", "circadian-rhythm-issues", "insomnia"]'::jsonb,
  '[]'::jsonb,
  'gold',
  '[
    {"step": "Get 10-15 minutes natural sunlight", "timing": "Within 2h of waking"},
    {"step": "Maximize bright light exposure", "intensity": ">1000 lux", "timing": "During day"},
    {"step": "Use amber/red light bulbs", "timing": "Evening"},
    {"step": "Wear blue light blocking glasses", "timing": "After sunset"},
    {"step": "Avoid overhead lighting", "timing": "2h before bed"},
    {"step": "Use blackout curtains or eye mask", "timing": "All night"},
    {"step": "Use red light flashlight for bathroom trips", "timing": "As needed"}
  ]'::jsonb,
  '["Strengthened circadian rhythm", "Improved melatonin production", "Better sleep-wake cycle"]'::jsonb,
  '[{"url": "https://www.pnas.org/doi/10.1073/pnas.1417490112", "studyType": "RCT"}]'::jsonb,
  2
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