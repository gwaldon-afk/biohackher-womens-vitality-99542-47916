-- Add detailed input fields to daily_scores table for complete record keeping
ALTER TABLE public.daily_scores 
ADD COLUMN total_sleep_hours numeric,
ADD COLUMN rem_hours numeric,
ADD COLUMN deep_sleep_hours numeric,
ADD COLUMN hrv numeric,
ADD COLUMN self_reported_stress numeric,
ADD COLUMN active_minutes integer,
ADD COLUMN steps integer,
ADD COLUMN activity_intensity numeric,
ADD COLUMN activity_type text,
ADD COLUMN meal_quality numeric,
ADD COLUMN nutritional_detailed_score numeric,
ADD COLUMN nutritional_grade text,
ADD COLUMN social_interaction_quality numeric,
ADD COLUMN social_time_minutes integer,
ADD COLUMN meditation_minutes integer,
ADD COLUMN learning_minutes integer,
ADD COLUMN input_mode text DEFAULT 'manual';

-- Add comment to explain the additional fields
COMMENT ON COLUMN public.daily_scores.total_sleep_hours IS 'Total sleep duration in hours';
COMMENT ON COLUMN public.daily_scores.rem_hours IS 'REM sleep duration in hours';
COMMENT ON COLUMN public.daily_scores.deep_sleep_hours IS 'Deep sleep duration in hours';
COMMENT ON COLUMN public.daily_scores.hrv IS 'Heart Rate Variability measurement';
COMMENT ON COLUMN public.daily_scores.self_reported_stress IS 'Self-reported stress level (1-10)';
COMMENT ON COLUMN public.daily_scores.active_minutes IS 'Active minutes per day';
COMMENT ON COLUMN public.daily_scores.steps IS 'Daily step count';
COMMENT ON COLUMN public.daily_scores.activity_intensity IS 'Activity intensity level (1-10)';
COMMENT ON COLUMN public.daily_scores.activity_type IS 'Type of activity: strength, cardio, or hiit';
COMMENT ON COLUMN public.daily_scores.meal_quality IS 'Simple meal quality rating (1-10)';
COMMENT ON COLUMN public.daily_scores.nutritional_detailed_score IS 'Detailed nutritional scorecard score';
COMMENT ON COLUMN public.daily_scores.nutritional_grade IS 'Nutritional scorecard grade (A-F)';
COMMENT ON COLUMN public.daily_scores.social_interaction_quality IS 'Quality of social interactions (1-10)';
COMMENT ON COLUMN public.daily_scores.social_time_minutes IS 'Time spent in social activities (minutes)';
COMMENT ON COLUMN public.daily_scores.meditation_minutes IS 'Daily meditation time in minutes';
COMMENT ON COLUMN public.daily_scores.learning_minutes IS 'Daily learning/cognitive engagement time in minutes';
COMMENT ON COLUMN public.daily_scores.input_mode IS 'Data input method: manual or wearable';