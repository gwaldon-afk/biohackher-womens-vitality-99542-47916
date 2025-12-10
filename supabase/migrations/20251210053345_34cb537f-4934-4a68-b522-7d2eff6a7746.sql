-- Add Hormone Age columns to hormone_compass_stages table
ALTER TABLE public.hormone_compass_stages 
ADD COLUMN IF NOT EXISTS hormone_age INTEGER,
ADD COLUMN IF NOT EXISTS chronological_age INTEGER,
ADD COLUMN IF NOT EXISTS age_offset INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN public.hormone_compass_stages.hormone_age IS 'Calculated hormone age based on symptom severity compared to age-normalized MRS population norms';
COMMENT ON COLUMN public.hormone_compass_stages.chronological_age IS 'User chronological age at time of assessment';
COMMENT ON COLUMN public.hormone_compass_stages.age_offset IS 'Difference between hormone age and chronological age (positive = older, negative = younger)';