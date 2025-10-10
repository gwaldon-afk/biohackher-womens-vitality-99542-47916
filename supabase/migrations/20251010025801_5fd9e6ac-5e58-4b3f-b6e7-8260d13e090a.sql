-- Populate toolkit_items with Therapies content
-- First, get category IDs for reference
WITH category_ids AS (
  SELECT id, slug FROM public.toolkit_categories
)

-- Insert Red Light Therapy
INSERT INTO public.toolkit_items (
  category_id, slug, name, description, detailed_description,
  target_symptoms, contraindications, evidence_level,
  protocols, benefits, research_citations, display_order
)
SELECT 
  (SELECT id FROM category_ids WHERE slug = 'therapies'),
  'red-light-therapy',
  'Red Light Therapy',
  'Uses specific wavelengths of red and near-infrared light to boost cellular energy',
  'Uses specific wavelengths of red and near-infrared light (660nm-850nm) that penetrate deep into your skin. This light energizes your cells'' powerhouses (mitochondria) to produce more ATP (cellular energy), which helps reduce inflammation and speeds up healing and tissue repair throughout your body',
  '["skin-changes", "muscle-maintenance", "energy-fluctuations"]'::jsonb,
  '[{"condition": "Pregnancy", "severity": "high"}, {"condition": "Cancer treatment area", "severity": "high"}, {"condition": "Photosensitizing medications", "severity": "medium"}]'::jsonb,
  'silver',
  '[
    {"name": "Face & Neck", "duration_minutes": 10, "distance": "15-30cm", "frequency": "daily"},
    {"name": "Full Body", "duration_minutes": 15, "distance": "45-60cm", "frequency": "daily"},
    {"name": "Targeted Area", "duration_minutes": 8, "distance": "15cm", "frequency": "daily"}
  ]'::jsonb,
  '["Increased collagen production", "Accelerated wound healing", "Reduced inflammation"]'::jsonb,
  '[{
    "title": "Photobiomodulation in human muscle tissue: an advantage in sports performance?",
    "journal": "Journal of Biophotonics",
    "year": 2016,
    "url": "https://pubmed.ncbi.nlm.nih.gov/26833881/",
    "doi": "10.1002/jbio.201500137",
    "studyType": "Review"
  }]'::jsonb,
  1
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