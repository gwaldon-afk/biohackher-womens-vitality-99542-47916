-- Add missing menomap_enabled column to profiles table
-- This column is referenced by the handle_new_user() trigger
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS menomap_enabled boolean DEFAULT false;