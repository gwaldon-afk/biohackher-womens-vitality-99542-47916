-- Add profile media fields to expert_profiles
ALTER TABLE expert_profiles 
  ADD COLUMN profile_photo_url TEXT,
  ADD COLUMN cover_photo_url TEXT,
  ADD COLUMN intro_video_url TEXT,
  ADD COLUMN gallery_photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN professional_tagline TEXT,
  ADD COLUMN education TEXT,
  ADD COLUMN certifications TEXT[];

-- Create storage bucket for expert profile media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('expert-profiles', 'expert-profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for expert profile media
CREATE POLICY "Anyone can view expert profile media"
ON storage.objects FOR SELECT
USING (bucket_id = 'expert-profiles');

CREATE POLICY "Experts can upload own profile media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expert-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Experts can update own profile media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'expert-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Experts can delete own profile media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expert-profiles' AND
  (storage.foldername(name))[1] = auth.uid()::text
);