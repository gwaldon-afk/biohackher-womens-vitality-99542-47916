-- Add new columns to research_studies for PubMed integration
ALTER TABLE public.research_studies 
ADD COLUMN IF NOT EXISTS pmid text,
ADD COLUMN IF NOT EXISTS raw_abstract text,
ADD COLUMN IF NOT EXISTS ai_summary text,
ADD COLUMN IF NOT EXISTS intervention_name text,
ADD COLUMN IF NOT EXISTS pillar text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS last_synced_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS source text DEFAULT 'curated';

-- Create index for faster lookups by intervention and pillar
CREATE INDEX IF NOT EXISTS idx_research_studies_intervention ON public.research_studies(intervention_name);
CREATE INDEX IF NOT EXISTS idx_research_studies_pillar ON public.research_studies(pillar);
CREATE INDEX IF NOT EXISTS idx_research_studies_pmid ON public.research_studies(pmid);

-- Add unique constraint on pmid to prevent duplicates
ALTER TABLE public.research_studies ADD CONSTRAINT unique_pmid UNIQUE (pmid);

COMMENT ON COLUMN public.research_studies.pmid IS 'PubMed ID for direct linking to source';
COMMENT ON COLUMN public.research_studies.raw_abstract IS 'Full abstract text from PubMed';
COMMENT ON COLUMN public.research_studies.ai_summary IS 'Pre-generated AI summary (2-3 sentences)';
COMMENT ON COLUMN public.research_studies.intervention_name IS 'Intervention/supplement name for matching';
COMMENT ON COLUMN public.research_studies.last_synced_at IS 'Last time this study was synced from PubMed';
COMMENT ON COLUMN public.research_studies.source IS 'Source: curated, pubmed_batch, pubmed_live';