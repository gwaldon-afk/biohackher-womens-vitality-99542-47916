-- Fix Function Search Path Security Issues

-- 1. Update the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Update the generate_expert_id function
CREATE OR REPLACE FUNCTION public.generate_expert_id()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: EXP-YYYYMM-XXXXX (e.g., EXP-202501-A3F9K)
    new_id := 'EXP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.expert_profiles WHERE expert_id = new_id) INTO id_exists;
    
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- 3. Update the update_expert_rating function
CREATE OR REPLACE FUNCTION public.update_expert_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.expert_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.expert_reviews
      WHERE expert_id = NEW.expert_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.expert_reviews
      WHERE expert_id = NEW.expert_id
    )
  WHERE id = NEW.expert_id;
  
  RETURN NEW;
END;
$$;

-- 4. Update the check_expert_auto_suspension function
CREATE OR REPLACE FUNCTION public.check_expert_auto_suspension()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-suspend if 3+ unresolved complaints in 12 months
  IF (
    SELECT COUNT(*)
    FROM public.expert_complaints
    WHERE expert_id = NEW.expert_id
    AND status = 'open'
    AND created_at > NOW() - INTERVAL '12 months'
  ) >= 3 THEN
    UPDATE public.expert_profiles
    SET 
      listing_status = 'suspended',
      auto_suspended = true
    WHERE id = NEW.expert_id;
  END IF;
  
  RETURN NEW;
END;
$$;