-- Function to transfer mock user data to real user on signup
CREATE OR REPLACE FUNCTION public.transfer_mock_user_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mock_user_id uuid := '00000000-0000-0000-0000-000000000001';
  mock_protocol_id uuid;
BEGIN
  -- Check if there's a protocol for the mock user
  SELECT id INTO mock_protocol_id
  FROM public.protocols
  WHERE user_id = mock_user_id
  LIMIT 1;
  
  -- If mock protocol exists, transfer it to the new user
  IF mock_protocol_id IS NOT NULL THEN
    -- Update the protocol to belong to the new user
    UPDATE public.protocols
    SET user_id = NEW.id,
        updated_at = NOW()
    WHERE id = mock_protocol_id;
    
    -- Update any protocol items (if they have user_id)
    UPDATE public.protocol_items
    SET updated_at = NOW()
    WHERE protocol_id = mock_protocol_id;
    
    -- Update any protocol completions
    UPDATE public.protocol_completions
    SET user_id = NEW.id
    WHERE user_id = mock_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to run after profile is created (which happens after user signup)
DROP TRIGGER IF EXISTS transfer_mock_data_on_signup ON public.profiles;
CREATE TRIGGER transfer_mock_data_on_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.transfer_mock_user_data();