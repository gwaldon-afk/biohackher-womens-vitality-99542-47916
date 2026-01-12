-- Phase C: Harden guest assessment RLS + add safe RPC helpers.
--
-- Problem: several guest assessment policies used conditions like
--   "session_id IS NOT NULL"
-- which makes *all* guest rows readable to everyone (PII leakage).
--
-- Strategy:
-- - Remove public SELECT access to guest tables.
-- - Provide SECURITY DEFINER RPC helpers that require a session_id "bearer secret"
--   for guest viewing, and authenticated user for claiming.

-- -----------------------------
-- Guest LIS (guest_lis_assessments)
-- -----------------------------

-- Remove the unsafe policy (it allowed everyone to SELECT all rows).
DROP POLICY IF EXISTS "Anyone can view own guest assessment" ON public.guest_lis_assessments;

-- Allow authenticated users to view rows they have claimed.
DROP POLICY IF EXISTS "Users can view claimed guest LIS assessments" ON public.guest_lis_assessments;
CREATE POLICY "Users can view claimed guest LIS assessments"
  ON public.guest_lis_assessments
  FOR SELECT
  TO authenticated
  USING (claimed_by_user_id = auth.uid());

-- Guests should NOT be able to SELECT directly from the table.
-- Use RPC below to fetch by session_id.

CREATE OR REPLACE FUNCTION public.get_guest_lis_assessment(p_session_id text)
RETURNS public.guest_lis_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.guest_lis_assessments;
BEGIN
  SELECT *
    INTO rec
  FROM public.guest_lis_assessments
  WHERE session_id = p_session_id
    AND claimed_by_user_id IS NULL
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN rec;
END;
$$;

-- Claim (authenticated only) and return the assessment row.
CREATE OR REPLACE FUNCTION public.claim_guest_lis_assessment(p_session_id text)
RETURNS public.guest_lis_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.guest_lis_assessments;
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to claim guest LIS assessment';
  END IF;

  UPDATE public.guest_lis_assessments
     SET claimed_by_user_id = uid,
         claimed_at = now()
   WHERE session_id = p_session_id
     AND claimed_by_user_id IS NULL
     AND (expires_at IS NULL OR expires_at > now())
  RETURNING * INTO rec;

  -- If already claimed by this user, return it (idempotent).
  IF rec IS NULL THEN
    SELECT *
      INTO rec
    FROM public.guest_lis_assessments
    WHERE session_id = p_session_id
      AND claimed_by_user_id = uid
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF rec IS NULL THEN
    RAISE EXCEPTION 'Guest LIS assessment not found, expired, or already claimed';
  END IF;

  RETURN rec;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_guest_lis_assessment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_guest_lis_assessment(text) TO authenticated;

-- get_guest_lis_assessment is intentionally callable by PUBLIC so guests can view
-- their results by session_id "bearer secret".


-- -----------------------------
-- Guest Symptoms (guest_symptom_assessments)
-- -----------------------------

-- Remove unsafe public SELECT policy.
DROP POLICY IF EXISTS "View own or claimed guest assessments" ON public.guest_symptom_assessments;

-- Allow only authenticated users to view symptom assessments they've claimed.
DROP POLICY IF EXISTS "Users can view claimed guest symptom assessments" ON public.guest_symptom_assessments;
CREATE POLICY "Users can view claimed guest symptom assessments"
  ON public.guest_symptom_assessments
  FOR SELECT
  TO authenticated
  USING (claimed_by_user_id = auth.uid());


-- -----------------------------
-- Nutrition (longevity_nutrition_assessments)
-- -----------------------------

-- Remove unsafe guest view policy (it allowed everyone to SELECT all guest rows).
DROP POLICY IF EXISTS "Guests can view their session assessments" ON public.longevity_nutrition_assessments;

-- Ensure we have an authenticated-only SELECT policy.
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.longevity_nutrition_assessments;
CREATE POLICY "Users can view their own assessments"
  ON public.longevity_nutrition_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Guests should not SELECT directly; use RPC below.
CREATE OR REPLACE FUNCTION public.get_guest_nutrition_assessment(p_id uuid, p_session_id text)
RETURNS public.longevity_nutrition_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.longevity_nutrition_assessments;
BEGIN
  SELECT *
    INTO rec
  FROM public.longevity_nutrition_assessments
  WHERE id = p_id
    AND user_id IS NULL
    AND session_id = p_session_id
    AND (expires_at IS NULL OR expires_at > now())
  LIMIT 1;

  RETURN rec;
END;
$$;

-- Claim (authenticated only) and attach to user.
CREATE OR REPLACE FUNCTION public.claim_guest_nutrition_assessment(p_session_id text)
RETURNS public.longevity_nutrition_assessments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec public.longevity_nutrition_assessments;
  uid uuid;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to claim guest nutrition assessment';
  END IF;

  UPDATE public.longevity_nutrition_assessments
     SET user_id = uid,
         claimed_by_user_id = uid,
         claimed_at = now()
   WHERE session_id = p_session_id
     AND user_id IS NULL
     AND (expires_at IS NULL OR expires_at > now())
  RETURNING * INTO rec;

  -- If already claimed by this user, return it (idempotent).
  IF rec IS NULL THEN
    SELECT *
      INTO rec
    FROM public.longevity_nutrition_assessments
    WHERE session_id = p_session_id
      AND user_id = uid
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF rec IS NULL THEN
    RAISE EXCEPTION 'Guest nutrition assessment not found, expired, or already claimed';
  END IF;

  RETURN rec;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_guest_nutrition_assessment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_guest_nutrition_assessment(text) TO authenticated;

-- get_guest_nutrition_assessment is intentionally callable by PUBLIC so guests can view
-- their results by id+session_id "bearer secret".

