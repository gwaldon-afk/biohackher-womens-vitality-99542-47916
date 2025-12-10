-- Add protocol prioritization and evidence columns to protocol_items
ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS priority_tier text DEFAULT 'foundation' 
  CHECK (priority_tier IN ('immediate', 'foundation', 'optimization'));

ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS impact_weight integer DEFAULT 5 
  CHECK (impact_weight >= 1 AND impact_weight <= 10);

ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS evidence_level text DEFAULT 'moderate' 
  CHECK (evidence_level IN ('weak', 'moderate', 'strong', 'very_strong'));

ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS accessibility text DEFAULT 'universal' 
  CHECK (accessibility IN ('universal', 'requires_equipment', 'requires_purchase'));

ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS lis_pillar_contribution text[] DEFAULT ARRAY[]::text[];

-- Create index for faster queries by tier and active status
CREATE INDEX IF NOT EXISTS idx_protocol_items_tier_active 
ON protocol_items(priority_tier, is_active);

-- Create index for pillar contribution queries
CREATE INDEX IF NOT EXISTS idx_protocol_items_pillar_contribution 
ON protocol_items USING GIN(lis_pillar_contribution);