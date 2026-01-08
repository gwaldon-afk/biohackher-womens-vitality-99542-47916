-- Add Fitbit-specific columns to wearable_connections
ALTER TABLE wearable_connections
ADD COLUMN IF NOT EXISTS fitbit_user_id TEXT,
ADD COLUMN IF NOT EXISTS token_type TEXT DEFAULT 'Bearer';