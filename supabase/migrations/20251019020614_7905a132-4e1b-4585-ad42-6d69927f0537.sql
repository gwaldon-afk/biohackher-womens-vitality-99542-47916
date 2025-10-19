-- Add structured address fields and virtual consultation support to expert_profiles
ALTER TABLE expert_profiles 
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state_province TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS offers_in_person BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS offers_virtual_video BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_virtual_phone BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS offers_virtual_messaging BOOLEAN DEFAULT false;

-- Update expert_services to support virtual service types
ALTER TABLE expert_services
  ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS is_virtual BOOLEAN DEFAULT false;