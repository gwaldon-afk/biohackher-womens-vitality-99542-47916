-- Phase C: Harden RLS for health_questions (AI health assistant history).
--
-- Problem: previous SELECT policy allowed anyone to read all guest questions via:
--   (user_id IS NULL AND session_id IS NOT NULL)
--
-- Strategy:
-- - Only authenticated users can SELECT their own rows directly.
-- - Guests do not SELECT directly; use session-bound RPC for retrieval.
-- - Provide an authenticated claim RPC to attach a guest session to a user.

-- Replace unsafe SELECT policy
DROP POLICY IF EXISTS "Users can view own questions" ON public.health_questions;

CREATE POLICY "Users can view own questions"
  ON public.health_questions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Guests should not SELECT directly; session-bound RPC only.
CREATE OR REPLACE FUNCTION public.get_health_questions_by_session(
  p_session_id text,
  p_limit int DEFAULT 50
)
RETURNS SETOF public.health_questions
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.health_questions
  WHERE user_id IS NULL
    AND session_id = p_session_id
  ORDER BY created_at DESC
  LIMIT LEAST(p_limit, 200);
$$;

-- Authenticated: claim a guest session's questions and attach them to the user.
CREATE OR REPLACE FUNCTION public.claim_health_questions_session(p_session_id text)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid;
  updated_count int;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Must be authenticated to claim health questions session';
  END IF;

  UPDATE public.health_questions
     SET user_id = uid
   WHERE user_id IS NULL
     AND session_id = p_session_id;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_health_questions_session(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_health_questions_session(text) TO authenticated;

