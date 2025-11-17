-- Allow guests to view their own session results
DROP POLICY IF EXISTS "Users can view their own assessments" ON longevity_nutrition_assessments;

CREATE POLICY "Guests can view their session assessments"
ON longevity_nutrition_assessments
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);