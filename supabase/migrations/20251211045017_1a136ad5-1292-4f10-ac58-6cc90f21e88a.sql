-- Phase 1: Add included_in_plan column to protocol_items table
-- This separates "item existence" (is_active) from "include in daily/90-day plans" (included_in_plan)

ALTER TABLE public.protocol_items 
ADD COLUMN included_in_plan boolean NOT NULL DEFAULT true;

-- Add comment for clarity
COMMENT ON COLUMN public.protocol_items.included_in_plan IS 'Controls whether this item appears in Today page and 90-Day Plan. Separate from is_active which controls item existence.';