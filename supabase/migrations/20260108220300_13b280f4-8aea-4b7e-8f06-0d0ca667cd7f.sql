-- Add expires_at column to guest_lis_assessments
ALTER TABLE public.guest_lis_assessments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Add expires_at column to guest_symptom_assessments
ALTER TABLE public.guest_symptom_assessments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days');

-- Add expires_at column to longevity_nutrition_assessments for guest records (session_id not null, user_id null)
ALTER TABLE public.longevity_nutrition_assessments 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Set default expires_at for existing unclaimed guest records
UPDATE public.guest_lis_assessments 
SET expires_at = created_at + INTERVAL '30 days' 
WHERE expires_at IS NULL AND claimed_by_user_id IS NULL;

UPDATE public.guest_symptom_assessments 
SET expires_at = created_at + INTERVAL '30 days' 
WHERE expires_at IS NULL AND claimed_by_user_id IS NULL;

UPDATE public.longevity_nutrition_assessments 
SET expires_at = created_at + INTERVAL '30 days' 
WHERE expires_at IS NULL AND user_id IS NULL AND session_id IS NOT NULL;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_guest_lis_expires ON public.guest_lis_assessments(expires_at) WHERE claimed_by_user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_guest_symptom_expires ON public.guest_symptom_assessments(expires_at) WHERE claimed_by_user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_nutrition_guest_expires ON public.longevity_nutrition_assessments(expires_at) WHERE user_id IS NULL;