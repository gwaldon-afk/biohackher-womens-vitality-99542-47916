-- Phase 1: Database Architecture Fixes

-- 1. Properly define user_protocols table (it exists but may need columns verified)
-- Ensure all necessary columns exist
DO $$ 
BEGIN
  -- Add any missing columns to user_protocols if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_protocols' AND column_name = 'user_id') THEN
    ALTER TABLE user_protocols ADD COLUMN user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Add foreign key constraint from protocol_items to user_protocols
ALTER TABLE protocol_items 
DROP CONSTRAINT IF EXISTS protocol_items_protocol_id_fkey;

ALTER TABLE protocol_items
ADD CONSTRAINT protocol_items_protocol_id_fkey 
FOREIGN KEY (protocol_id) 
REFERENCES user_protocols(id) 
ON DELETE CASCADE;

-- 3. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_daily_scores_user_date 
ON daily_scores(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_protocol_items_protocol_id 
ON protocol_items(protocol_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_user_protocols_user_id 
ON user_protocols(user_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_symptom_assessments_user_date 
ON symptom_assessments(user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_goal_check_ins_user_goal 
ON goal_check_ins(user_id, goal_id, check_in_date DESC);

-- 4. Create JSONB validation function for contraindications
CREATE OR REPLACE FUNCTION validate_contraindications(data jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Validate that contraindications is an array
  IF jsonb_typeof(data) != 'array' THEN
    RETURN false;
  END IF;
  
  -- Validate each item has required fields
  IF EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(data) AS item
    WHERE NOT (
      item ? 'condition' AND 
      item ? 'severity' AND
      jsonb_typeof(item->'condition') = 'string' AND
      jsonb_typeof(item->'severity') = 'string'
    )
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 5. Create JSONB validation function for target_symptoms
CREATE OR REPLACE FUNCTION validate_target_symptoms(data jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Validate that target_symptoms is an array
  IF jsonb_typeof(data) != 'array' THEN
    RETURN false;
  END IF;
  
  -- Each item should be a string
  IF EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(data) AS item
    WHERE jsonb_typeof(item) != 'string'
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 6. Add validation triggers to products table
CREATE OR REPLACE FUNCTION validate_product_jsonb()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate contraindications if present
  IF NEW.contraindications IS NOT NULL THEN
    IF NOT validate_contraindications(NEW.contraindications) THEN
      RAISE EXCEPTION 'Invalid contraindications format';
    END IF;
  END IF;
  
  -- Validate target_symptoms if present
  IF NEW.target_symptoms IS NOT NULL THEN
    IF NOT validate_target_symptoms(NEW.target_symptoms) THEN
      RAISE EXCEPTION 'Invalid target_symptoms format';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_product_jsonb_trigger ON products;
CREATE TRIGGER validate_product_jsonb_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_jsonb();

-- 7. Add validation triggers to toolkit_items table
DROP TRIGGER IF EXISTS validate_toolkit_jsonb_trigger ON toolkit_items;
CREATE TRIGGER validate_toolkit_jsonb_trigger
  BEFORE INSERT OR UPDATE ON toolkit_items
  FOR EACH ROW
  EXECUTE FUNCTION validate_product_jsonb();

-- 8. Add onboarding_completed column to profiles for Phase 2
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 9. Add index for onboarding status
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON profiles(user_id, onboarding_completed);