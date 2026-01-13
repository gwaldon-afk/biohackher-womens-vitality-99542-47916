-- Remove test mode policies that expose protocol_items to public
DROP POLICY IF EXISTS "Test mode: Allow mock user to view protocol items" ON public.protocol_items;
DROP POLICY IF EXISTS "Test mode: Allow mock user to insert protocol items" ON public.protocol_items;
DROP POLICY IF EXISTS "Test mode: Allow mock user to update protocol items" ON public.protocol_items;
DROP POLICY IF EXISTS "Test mode: Allow mock user to delete protocol items" ON public.protocol_items;