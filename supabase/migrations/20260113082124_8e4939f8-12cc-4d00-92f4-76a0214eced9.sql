-- Fix public_expert_profiles view - recreate with security_invoker
DROP VIEW IF EXISTS public.public_expert_profiles;

CREATE VIEW public.public_expert_profiles
WITH (security_invoker = true)
AS SELECT 
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
WHERE verification_status = 'approved' AND listing_status = 'active';

-- Grant access to the view
GRANT SELECT ON public.public_expert_profiles TO anon, authenticated;

-- Fix unified_assessments view - recreate with security_invoker
DROP VIEW IF EXISTS public.unified_assessments;

CREATE VIEW public.unified_assessments
WITH (security_invoker = true)
AS SELECT 
    user_id,
    pillar,
    assessment_id,
    score,
    completed_at,
    'pillar'::text AS source
FROM public.user_assessment_completions
UNION ALL
SELECT 
    user_id,
    'body'::text AS pillar,
    symptom_type AS assessment_id,
    overall_score AS score,
    completed_at,
    'symptom'::text AS source
FROM public.symptom_assessments
WHERE symptom_type = 'energy-levels';

-- Grant access to authenticated users only (contains user data)
GRANT SELECT ON public.unified_assessments TO authenticated;