-- Add user_stream column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_stream TEXT CHECK (user_stream IN ('performance', 'menopause'));