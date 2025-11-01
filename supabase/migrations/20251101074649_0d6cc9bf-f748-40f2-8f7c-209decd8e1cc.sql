-- Extend user_health_profile table with training and nutrition context
ALTER TABLE user_health_profile 
ADD COLUMN IF NOT EXISTS training_experience text CHECK (training_experience IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS exercise_preferences jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_supplements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS known_deficiencies jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS protein_per_meal numeric,
ADD COLUMN IF NOT EXISTS exercise_routine_frequency integer,
ADD COLUMN IF NOT EXISTS compound_lift_experience jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS previous_injuries text,
ADD COLUMN IF NOT EXISTS medication_list jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS allergies_sensitivities jsonb DEFAULT '[]'::jsonb;

-- Create protocol_versions table for tracking protocol updates over time
CREATE TABLE IF NOT EXISTS protocol_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES protocols(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  change_summary text,
  evidence_level text CHECK (evidence_level IN ('low', 'moderate', 'high', 'very_high')),
  research_basis text,
  items_snapshot jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id)
);

-- Create protocol_research_links table to connect protocols to supporting evidence
CREATE TABLE IF NOT EXISTS protocol_research_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid REFERENCES protocols(id) ON DELETE CASCADE,
  protocol_item_id uuid REFERENCES protocol_items(id) ON DELETE CASCADE,
  research_title text NOT NULL,
  authors text,
  journal text,
  publication_year integer,
  doi text,
  url text,
  key_findings text,
  evidence_strength text CHECK (evidence_strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  expert_source text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE protocol_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_research_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for protocol_versions
CREATE POLICY "Users can view their own protocol versions"
  ON protocol_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protocols 
      WHERE protocols.id = protocol_versions.protocol_id 
      AND protocols.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert protocol versions"
  ON protocol_versions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM protocols 
      WHERE protocols.id = protocol_versions.protocol_id 
      AND protocols.user_id = auth.uid()
    )
  );

-- RLS policies for protocol_research_links
CREATE POLICY "Users can view research for their protocols"
  ON protocol_research_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protocols 
      WHERE protocols.id = protocol_research_links.protocol_id 
      AND protocols.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view research links for protocol items"
  ON protocol_research_links FOR SELECT
  USING (true);

CREATE POLICY "System can insert research links"
  ON protocol_research_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM protocols 
      WHERE protocols.id = protocol_research_links.protocol_id 
      AND protocols.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_protocol_versions_protocol_id ON protocol_versions(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_research_links_protocol_id ON protocol_research_links(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_research_links_item_id ON protocol_research_links(protocol_item_id);

-- Add trigger to update updated_at columns
CREATE TRIGGER update_protocol_versions_updated_at
  BEFORE UPDATE ON protocol_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocol_research_links_updated_at
  BEFORE UPDATE ON protocol_research_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();