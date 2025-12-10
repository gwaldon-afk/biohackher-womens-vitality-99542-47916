-- Add Metabolic Age columns to longevity_nutrition_assessments table
ALTER TABLE public.longevity_nutrition_assessments
ADD COLUMN IF NOT EXISTS metabolic_age integer,
ADD COLUMN IF NOT EXISTS chronological_age integer,
ADD COLUMN IF NOT EXISTS metabolic_age_offset integer,
ADD COLUMN IF NOT EXISTS metabolic_severity_score numeric;