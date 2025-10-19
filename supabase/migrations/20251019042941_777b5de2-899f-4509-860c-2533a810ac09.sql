-- Create profiles for users who don't have one
INSERT INTO public.profiles (user_id, preferred_name, email)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'preferred_name', split_part(u.email, '@', 1)),
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Enable MenoMap for users with menopause-related symptom assessments
UPDATE public.profiles
SET 
  menomap_enabled = true,
  updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT user_id
  FROM public.symptom_assessments
  WHERE symptom_type IN (
    'hot-flashes', 'night-sweats', 'irregular-periods', 
    'mood-swings', 'vaginal-dryness', 'sleep-disturbances',
    'menopause', 'perimenopause'
  )
  AND user_id IS NOT NULL
)
AND (menomap_enabled IS NULL OR menomap_enabled = false);

-- Enable Energy Loop for users with energy-related assessments
UPDATE public.profiles
SET 
  energy_loop_enabled = true,
  updated_at = now()
WHERE user_id IN (
  SELECT DISTINCT user_id
  FROM public.symptom_assessments
  WHERE symptom_type IN (
    'fatigue', 'low-energy', 'brain-fog', 'exhaustion', 'energy'
  )
  AND user_id IS NOT NULL
)
AND (energy_loop_enabled IS NULL OR energy_loop_enabled = false);

-- Update the handle_new_user function to set better defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    preferred_name, 
    email,
    menomap_enabled,
    energy_loop_enabled
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'preferred_name', split_part(new.email, '@', 1)),
    new.email,
    false,
    false
  );
  RETURN new;
END;
$$;