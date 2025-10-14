-- Fix security warnings: Add search_path to validation functions

-- 1. Fix validate_contraindications function
CREATE OR REPLACE FUNCTION validate_contraindications(data jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

-- 2. Fix validate_target_symptoms function
CREATE OR REPLACE FUNCTION validate_target_symptoms(data jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
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

-- 3. Fix validate_product_jsonb function
CREATE OR REPLACE FUNCTION validate_product_jsonb()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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