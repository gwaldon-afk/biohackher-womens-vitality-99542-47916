-- Add columns for personalized nutrition targets to user_health_profile
ALTER TABLE public.user_health_profile
ADD COLUMN IF NOT EXISTS recommended_protein_min numeric,
ADD COLUMN IF NOT EXISTS recommended_protein_max numeric,
ADD COLUMN IF NOT EXISTS recommended_daily_calories numeric,
ADD COLUMN IF NOT EXISTS nutrition_calculation_date date;

-- Add comment for clarity
COMMENT ON COLUMN public.user_health_profile.recommended_protein_min IS 'Personalized daily protein minimum in grams';
COMMENT ON COLUMN public.user_health_profile.recommended_protein_max IS 'Personalized daily protein maximum in grams';
COMMENT ON COLUMN public.user_health_profile.recommended_daily_calories IS 'Personalized daily calorie target';
COMMENT ON COLUMN public.user_health_profile.nutrition_calculation_date IS 'Date when nutrition calculations were last updated';