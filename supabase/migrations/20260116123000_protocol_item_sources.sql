-- Track assessment provenance for protocol items

CREATE TABLE IF NOT EXISTS public.protocol_item_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_item_id UUID NOT NULL REFERENCES public.protocol_items(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_assessment_id TEXT NOT NULL,
  source_recommendation_id UUID REFERENCES public.protocol_recommendations(id) ON DELETE SET NULL,
  source_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(protocol_item_id, source_type, source_assessment_id)
);

ALTER TABLE public.protocol_item_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own protocol item sources"
  ON public.protocol_item_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own protocol item sources"
  ON public.protocol_item_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own protocol item sources"
  ON public.protocol_item_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protocol item sources"
  ON public.protocol_item_sources FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_protocol_item_sources_user
  ON public.protocol_item_sources(user_id);

CREATE INDEX IF NOT EXISTS idx_protocol_item_sources_item
  ON public.protocol_item_sources(protocol_item_id);

CREATE INDEX IF NOT EXISTS idx_protocol_item_sources_source
  ON public.protocol_item_sources(source_type, source_assessment_id);

CREATE TRIGGER update_protocol_item_sources_updated_at
  BEFORE UPDATE ON public.protocol_item_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
