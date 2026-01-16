-- Phase 2: Fix function search_path for security
CREATE OR REPLACE FUNCTION public.update_assessment_progress_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Phase 3: Create secure public view for expert profiles
-- This view only exposes safe fields, hiding sensitive data like email, phone, insurance_number, etc.
CREATE OR REPLACE VIEW public.public_expert_profiles AS
SELECT 
  id,
  expert_id,
  practice_name,
  bio,
  specialties,
  city,
  state_province,
  country,
  location,
  professional_tagline,
  education,
  certifications,
  profile_photo_url,
  cover_photo_url,
  intro_video_url,
  gallery_photos,
  average_rating,
  total_reviews,
  years_of_practice,
  consultation_fee,
  accepts_insurance,
  offers_in_person,
  offers_virtual_video,
  offers_virtual_phone,
  offers_virtual_messaging,
  website,
  featured,
  tier,
  verification_status,
  listing_status,
  latitude,
  longitude,
  timezone,
  created_at
FROM public.expert_profiles
WHERE verification_status = 'approved' 
  AND listing_status = 'active';

-- Drop the overly permissive policy that exposes sensitive data
DROP POLICY IF EXISTS "Anyone can view approved active experts" ON public.expert_profiles;

-- Grant access to the secure view for public browsing
GRANT SELECT ON public.public_expert_profiles TO anon, authenticated;