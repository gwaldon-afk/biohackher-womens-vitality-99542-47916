-- Phase 1: Foundation - Database Schema (CORRECTED)
-- Create protocol package system tables

-- Protocol packages table
CREATE TABLE IF NOT EXISTS protocol_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  protocol_id UUID NOT NULL REFERENCES protocols(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold')),
  duration_days INTEGER NOT NULL DEFAULT 90,
  total_items_count INTEGER NOT NULL,
  gold_items_count INTEGER NOT NULL DEFAULT 0,
  silver_items_count INTEGER NOT NULL DEFAULT 0,
  bronze_items_count INTEGER NOT NULL DEFAULT 0,
  base_price NUMERIC(10,2) NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Package protocol items linking table
CREATE TABLE IF NOT EXISTS package_protocol_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES protocol_packages(id) ON DELETE CASCADE,
  protocol_item_id UUID NOT NULL REFERENCES protocol_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  item_position INTEGER NOT NULL,
  is_customizable BOOLEAN DEFAULT true,
  replacement_options JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Package purchases table
CREATE TABLE IF NOT EXISTS package_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES protocol_packages(id) ON DELETE CASCADE,
  purchase_type TEXT CHECK (purchase_type IN ('full_90_day', 'payment_plan_3x')),
  total_amount NUMERIC(10,2) NOT NULL,
  discount_applied NUMERIC(10,2) DEFAULT 0,
  discount_code TEXT,
  stripe_payment_intent_id TEXT,
  stripe_subscription_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  shipment_status TEXT DEFAULT 'pending' CHECK (shipment_status IN ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  payment_plan_installment_count INTEGER DEFAULT 1,
  payment_plan_current_installment INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Discount rules table for flexible discount management
CREATE TABLE IF NOT EXISTS discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT CHECK (rule_type IN ('package_full_90', 'package_payment_plan', 'membership', 'promo_code', 'product_bundle')),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  applies_to TEXT CHECK (applies_to IN ('all', 'packages', 'products', 'specific_items')),
  specific_item_ids UUID[],
  promo_code TEXT,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Goal metric tracking table for outcome-based progress
CREATE TABLE IF NOT EXISTS goal_metric_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES user_health_goals(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_unit TEXT,
  tracked_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rename menopause tables to hormone_compass (check if they exist first)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menopause_stages') THEN
    ALTER TABLE menopause_stages RENAME TO hormone_compass_stages;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menopause_symptom_tracking') THEN
    ALTER TABLE menopause_symptom_tracking RENAME TO hormone_compass_symptom_tracking;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menopause_insights') THEN
    ALTER TABLE menopause_insights RENAME TO hormone_compass_insights;
  END IF;
END $$;

-- Add goal linking columns to protocol_items
ALTER TABLE protocol_items 
ADD COLUMN IF NOT EXISTS goal_ids UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN IF NOT EXISTS contributes_to_metrics TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update profiles table for HormoneCompass
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS hormone_compass_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hormone_compass_onboarding_completed BOOLEAN DEFAULT false;

-- If old menomap columns exist, migrate data
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'menomap_enabled') THEN
    UPDATE profiles SET hormone_compass_enabled = menomap_enabled WHERE menomap_enabled IS NOT NULL;
    ALTER TABLE profiles DROP COLUMN menomap_enabled;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_protocol_packages_user_id ON protocol_packages(user_id);
CREATE INDEX IF NOT EXISTS idx_protocol_packages_protocol_id ON protocol_packages(protocol_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_user_id ON package_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_package_id ON package_purchases(package_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_payment_status ON package_purchases(payment_status);
CREATE INDEX IF NOT EXISTS idx_discount_rules_rule_type ON discount_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_discount_rules_is_active ON discount_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_goal_metric_tracking_goal_id ON goal_metric_tracking(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_metric_tracking_user_id ON goal_metric_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_protocol_items_goal_ids ON protocol_items USING GIN(goal_ids);

-- Enable RLS on all new tables
ALTER TABLE protocol_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_metric_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for protocol_packages
CREATE POLICY "Users can view their own packages"
  ON protocol_packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own packages"
  ON protocol_packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own packages"
  ON protocol_packages FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for package_protocol_items
CREATE POLICY "Users can view items in their packages"
  ON package_protocol_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM protocol_packages
      WHERE protocol_packages.id = package_protocol_items.package_id
      AND protocol_packages.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage items in their packages"
  ON package_protocol_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM protocol_packages
      WHERE protocol_packages.id = package_protocol_items.package_id
      AND protocol_packages.user_id = auth.uid()
    )
  );

-- RLS Policies for package_purchases
CREATE POLICY "Users can view their own purchases"
  ON package_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases"
  ON package_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
  ON package_purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for discount_rules (public read, admin write using has_role function)
CREATE POLICY "Everyone can view active discount rules"
  ON discount_rules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage discount rules"
  ON discount_rules FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for goal_metric_tracking
CREATE POLICY "Users can view their own goal metrics"
  ON goal_metric_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal metrics"
  ON goal_metric_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal metrics"
  ON goal_metric_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal metrics"
  ON goal_metric_tracking FOR DELETE
  USING (auth.uid() = user_id);

-- Insert default discount rules
INSERT INTO discount_rules (rule_name, rule_type, discount_type, discount_value, applies_to, is_active)
VALUES 
  ('Full 90-Day Package Discount', 'package_full_90', 'percentage', 15.0, 'packages', true),
  ('Payment Plan Processing Fee', 'package_payment_plan', 'percentage', 7.5, 'packages', true)
ON CONFLICT DO NOTHING;