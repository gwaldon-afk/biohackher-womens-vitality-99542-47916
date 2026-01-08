-- Fix transfer_mock_user_data function to:
-- 1. Skip test users (biohackher.dev emails)
-- 2. Use correct column (NEW.user_id not NEW.id)
-- 3. Use correct table name (protocol_item_completions)
-- 4. Add defensive check for table existence

CREATE OR REPLACE FUNCTION public.transfer_mock_user_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  mock_user_id uuid := '00000000-0000-0000-0000-000000000001';
  mock_protocol_id uuid;
BEGIN
  -- Skip test users to avoid interference with seeding
  IF NEW.email LIKE '%@biohackher.dev' THEN
    RETURN NEW;
  END IF;

  -- Check if there's a protocol for the mock user
  SELECT id INTO mock_protocol_id
  FROM public.protocols
  WHERE user_id = mock_user_id
  LIMIT 1;
  
  -- If mock protocol exists, transfer it to the new user
  IF mock_protocol_id IS NOT NULL THEN
    -- Update the protocol to belong to the new user (use user_id, not id)
    UPDATE public.protocols
    SET user_id = NEW.user_id,
        updated_at = NOW()
    WHERE id = mock_protocol_id;
    
    -- Update any protocol items (if they have user_id)
    UPDATE public.protocol_items
    SET updated_at = NOW()
    WHERE protocol_id = mock_protocol_id;
    
    -- Update any protocol item completions if table exists
    IF to_regclass('public.protocol_item_completions') IS NOT NULL THEN
      UPDATE public.protocol_item_completions
      SET user_id = NEW.user_id
      WHERE user_id = mock_user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;