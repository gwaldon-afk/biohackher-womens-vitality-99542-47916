-- Populate toolkit_categories with existing hardcoded data
INSERT INTO public.toolkit_categories (slug, name, description, icon_name, display_order) VALUES
  ('therapies', 'Therapies', 'Evidence-based biohacking therapies and protocols', 'Activity', 1),
  ('sleep', 'Sleep', 'Optimise your sleep quality and recovery', 'Moon', 2),
  ('nutrition', 'Nutrition', 'Personalised nutrition strategies for longevity', 'UtensilsCrossed', 3),
  ('coaching', 'Coaching', 'Cycle-synced training and wellness coaching', 'Brain', 4),
  ('supplements', 'Supplements', 'Science-backed supplement recommendations', 'Pill', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  display_order = EXCLUDED.display_order;