-- Add RLS bypass policies for test mode mock user
-- This allows the mock user (00000000-0000-0000-0000-000000000001) to access protocols without authentication

-- protocols table policies
CREATE POLICY "Test mode: Allow mock user to view protocols" ON protocols
  FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to insert protocols" ON protocols
  FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to update protocols" ON protocols
  FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to delete protocols" ON protocols
  FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- protocol_items table policies
CREATE POLICY "Test mode: Allow mock user to view protocol items" ON protocol_items
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM protocols 
    WHERE protocols.id = protocol_items.protocol_id 
    AND protocols.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ));

CREATE POLICY "Test mode: Allow mock user to insert protocol items" ON protocol_items
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM protocols 
    WHERE protocols.id = protocol_items.protocol_id 
    AND protocols.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ));

CREATE POLICY "Test mode: Allow mock user to update protocol items" ON protocol_items
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM protocols 
    WHERE protocols.id = protocol_items.protocol_id 
    AND protocols.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ));

CREATE POLICY "Test mode: Allow mock user to delete protocol items" ON protocol_items
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM protocols 
    WHERE protocols.id = protocol_items.protocol_id 
    AND protocols.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  ));

-- protocol_item_completions table policies
CREATE POLICY "Test mode: Allow mock user to view completions" ON protocol_item_completions
  FOR SELECT USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to insert completions" ON protocol_item_completions
  FOR INSERT WITH CHECK (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to update completions" ON protocol_item_completions
  FOR UPDATE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "Test mode: Allow mock user to delete completions" ON protocol_item_completions
  FOR DELETE USING (user_id = '00000000-0000-0000-0000-000000000001'::uuid);