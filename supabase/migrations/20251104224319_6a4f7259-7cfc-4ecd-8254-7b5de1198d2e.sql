-- Add gold-level therapy protocols to existing active protocols
-- These are evidence-based interventions backed by peer-reviewed research

INSERT INTO protocol_items (
  protocol_id, 
  item_type, 
  name, 
  description, 
  frequency, 
  time_of_day, 
  is_active
) 
SELECT 
  p.id as protocol_id,
  'therapy'::protocol_item_type as item_type,
  therapy.name,
  therapy.description,
  therapy.frequency::protocol_frequency,
  therapy.time_of_day,
  true as is_active
FROM protocols p
CROSS JOIN (
  VALUES 
    ('Red Light Therapy (10-20 min)', 'Evidence: Multiple RCTs show improved mitochondrial function, skin health, and cellular regeneration. Optimal wavelengths: 660nm (red) and 850nm (near-infrared)', 'daily', ARRAY['morning']::text[]),
    ('Infrared Sauna (20-30 min)', 'Evidence: Dr. Rhonda Patrick research - Improves cardiovascular health, activates heat shock proteins, and supports detoxification pathways', 'three_times_daily', ARRAY['evening']::text[]),
    ('Cold Exposure (2-5 min)', 'Evidence: Huberman Lab protocols - Activates brown adipose tissue, boosts metabolism, increases norepinephrine, and builds mental resilience', 'daily', ARRAY['morning']::text[]),
    ('Contrast Therapy (Hot/Cold)', 'Evidence: Athletic performance research - Alternating hot/cold enhances circulation, reduces inflammation, and accelerates recovery', 'twice_daily', ARRAY['morning', 'evening']::text[]),
    ('Lymphatic Drainage Massage (30 min)', 'Evidence: Manual therapy research - Stimulates lymphatic flow, supports immune function, and aids detoxification', 'weekly', ARRAY['morning']::text[]),
    ('Dry Brushing (5 min)', 'Evidence: Dermatology studies - Mechanical stimulation of lymphatic system, exfoliates dead skin cells, and improves circulation', 'daily', ARRAY['morning']::text[])
) AS therapy(name, description, frequency, time_of_day)
WHERE p.is_active = true
  AND (p.name ILIKE '%gold%' OR p.name ILIKE '%premium%' OR p.name ILIKE '%advanced%')
  AND NOT EXISTS (
    SELECT 1 FROM protocol_items pi 
    WHERE pi.protocol_id = p.id 
    AND pi.name = therapy.name
  );

-- Also add to any other active protocols that don't have these therapy items yet
INSERT INTO protocol_items (
  protocol_id, 
  item_type, 
  name, 
  description, 
  frequency, 
  time_of_day, 
  is_active
) 
SELECT DISTINCT
  p.id as protocol_id,
  'therapy'::protocol_item_type as item_type,
  therapy.name,
  therapy.description,
  therapy.frequency::protocol_frequency,
  therapy.time_of_day,
  true as is_active
FROM protocols p
CROSS JOIN (
  VALUES 
    ('Red Light Therapy (10-20 min)', 'Evidence: Multiple RCTs show improved mitochondrial function, skin health, and cellular regeneration. Optimal wavelengths: 660nm (red) and 850nm (near-infrared)', 'daily', ARRAY['morning']::text[]),
    ('Infrared Sauna (20-30 min)', 'Evidence: Dr. Rhonda Patrick research - Improves cardiovascular health, activates heat shock proteins, and supports detoxification pathways', 'three_times_daily', ARRAY['evening']::text[]),
    ('Cold Exposure (2-5 min)', 'Evidence: Huberman Lab protocols - Activates brown adipose tissue, boosts metabolism, increases norepinephrine, and builds mental resilience', 'daily', ARRAY['morning']::text[]),
    ('Contrast Therapy (Hot/Cold)', 'Evidence: Athletic performance research - Alternating hot/cold enhances circulation, reduces inflammation, and accelerates recovery', 'twice_daily', ARRAY['morning', 'evening']::text[]),
    ('Lymphatic Drainage Massage (30 min)', 'Evidence: Manual therapy research - Stimulates lymphatic flow, supports immune function, and aids detoxification', 'weekly', ARRAY['morning']::text[]),
    ('Dry Brushing (5 min)', 'Evidence: Dermatology studies - Mechanical stimulation of lymphatic system, exfoliates dead skin cells, and improves circulation', 'daily', ARRAY['morning']::text[])
) AS therapy(name, description, frequency, time_of_day)
WHERE p.is_active = true
  AND NOT (p.name ILIKE '%gold%' OR p.name ILIKE '%premium%' OR p.name ILIKE '%advanced%')
  AND NOT EXISTS (
    SELECT 1 FROM protocol_items pi 
    WHERE pi.protocol_id = p.id 
    AND pi.name = therapy.name
  )
LIMIT 100;