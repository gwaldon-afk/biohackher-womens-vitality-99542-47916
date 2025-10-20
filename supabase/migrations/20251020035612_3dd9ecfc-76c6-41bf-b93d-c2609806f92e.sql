-- Add missing columns to energy_check_ins table for comprehensive Energy Loop tracking

ALTER TABLE public.energy_check_ins
ADD COLUMN IF NOT EXISTS movement_quality integer CHECK (movement_quality >= 1 AND movement_quality <= 5),
ADD COLUMN IF NOT EXISTS nutrition_quality integer CHECK (nutrition_quality >= 1 AND nutrition_quality <= 5),
ADD COLUMN IF NOT EXISTS hydrated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cycle_day integer CHECK (cycle_day >= 1 AND cycle_day <= 35);

COMMENT ON COLUMN public.energy_check_ins.movement_quality IS 'Quality rating of movement/exercise (1-5 scale)';
COMMENT ON COLUMN public.energy_check_ins.nutrition_quality IS 'Quality rating of nutrition/fuel (1-5 scale)';
COMMENT ON COLUMN public.energy_check_ins.hydrated IS 'Whether user stayed hydrated throughout the day';
COMMENT ON COLUMN public.energy_check_ins.cycle_day IS 'Day of menstrual cycle (1-35, nullable for those not tracking)';