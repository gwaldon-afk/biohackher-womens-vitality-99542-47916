-- Add product_id to protocol_items to link items with shop products
ALTER TABLE protocol_items
ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL;

-- Create protocol_bundles table for managing bundled protocol purchases
CREATE TABLE protocol_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id uuid NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  bundle_name text NOT NULL,
  total_items integer NOT NULL DEFAULT 0,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  final_price numeric(10,2) NOT NULL DEFAULT 0,
  discount_percentage integer DEFAULT 0,
  bundle_status text DEFAULT 'pending' CHECK (bundle_status IN ('pending', 'purchased', 'expired')),
  items_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  purchased_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on protocol_bundles
ALTER TABLE protocol_bundles ENABLE ROW LEVEL SECURITY;

-- Users can view their own bundles
CREATE POLICY "Users can view own bundles"
ON protocol_bundles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bundles
CREATE POLICY "Users can create own bundles"
ON protocol_bundles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bundles
CREATE POLICY "Users can update own bundles"
ON protocol_bundles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_protocol_bundles_user_id ON protocol_bundles(user_id);
CREATE INDEX idx_protocol_bundles_protocol_id ON protocol_bundles(protocol_id);
CREATE INDEX idx_protocol_items_product_id ON protocol_items(product_id);