-- Add use_cases column to products table for secondary filtering
ALTER TABLE products ADD COLUMN IF NOT EXISTS use_cases JSONB DEFAULT '[]'::jsonb;

-- Create index for faster pillar filtering
CREATE INDEX IF NOT EXISTS idx_products_target_pillars ON products USING GIN (target_pillars);

-- Create index for use_cases filtering
CREATE INDEX IF NOT EXISTS idx_products_use_cases ON products USING GIN (use_cases);

COMMENT ON COLUMN products.use_cases IS 'Secondary use case tags for filtering within pillar categories (e.g., ["sleep", "stress", "hormone-support"])';