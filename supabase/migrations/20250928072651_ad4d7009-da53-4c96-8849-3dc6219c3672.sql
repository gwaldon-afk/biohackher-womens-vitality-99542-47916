-- Add locale fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN country TEXT DEFAULT 'GB',
ADD COLUMN language TEXT DEFAULT 'en-GB', 
ADD COLUMN currency TEXT DEFAULT 'GBP',
ADD COLUMN measurement_system TEXT DEFAULT 'metric',
ADD COLUMN timezone TEXT DEFAULT 'Europe/London';