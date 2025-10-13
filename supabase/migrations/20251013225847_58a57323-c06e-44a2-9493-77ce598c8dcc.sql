-- Add INSERT policy for research_studies to allow importing reference data
CREATE POLICY "Allow inserting research studies"
  ON public.research_studies
  FOR INSERT
  WITH CHECK (true);

-- This policy allows anyone to insert research studies since they are public reference data
-- Can be restricted or removed after initial import if needed