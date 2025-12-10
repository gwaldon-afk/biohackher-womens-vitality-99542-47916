-- Phase 5: Add protocol_adherence_score column to daily_scores for tracking protocol adherence
ALTER TABLE public.daily_scores ADD COLUMN IF NOT EXISTS protocol_adherence_score numeric;

-- Add comment to document the column
COMMENT ON COLUMN public.daily_scores.protocol_adherence_score IS 'Weighted protocol adherence score (0-100) based on completed protocol items and their impact weights';