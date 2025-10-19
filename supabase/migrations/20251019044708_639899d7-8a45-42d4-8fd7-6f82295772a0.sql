-- Delete duplicate protocol (keeping the older one)
DELETE FROM user_protocols 
WHERE id = 'f717e6ae-e117-4bf9-ab5e-5f8b499f2259';

-- Add unique index to prevent duplicate active protocols with same name per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_user_protocol 
ON user_protocols(user_id, name) 
WHERE is_active = true;