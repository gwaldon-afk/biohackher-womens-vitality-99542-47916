-- Re-enable RLS and restore policies for protocols table
ALTER TABLE protocols ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own protocols" ON protocols;
DROP POLICY IF EXISTS "Users can create own protocols" ON protocols;
DROP POLICY IF EXISTS "Users can update own protocols" ON protocols;
DROP POLICY IF EXISTS "Users can delete own protocols" ON protocols;

-- Create RLS policies for protocols table
CREATE POLICY "Users can view own protocols"
  ON protocols
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own protocols"
  ON protocols
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own protocols"
  ON protocols
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own protocols"
  ON protocols
  FOR DELETE
  USING (auth.uid() = user_id);