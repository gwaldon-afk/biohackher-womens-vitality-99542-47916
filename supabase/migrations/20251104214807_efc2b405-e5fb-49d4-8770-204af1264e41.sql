-- Deactivate protocols with 0 items when user has multiple active protocols
-- This prevents empty protocols from being loaded instead of ones with actual items
UPDATE protocols 
SET is_active = false 
WHERE id IN (
  SELECT p.id 
  FROM protocols p
  LEFT JOIN protocol_items pi ON pi.protocol_id = p.id AND pi.is_active = true
  WHERE p.is_active = true
  GROUP BY p.id
  HAVING COUNT(pi.id) = 0
  AND EXISTS (
    SELECT 1 FROM protocols p2 
    WHERE p2.user_id = p.user_id 
    AND p2.is_active = true 
    AND p2.id != p.id
  )
);