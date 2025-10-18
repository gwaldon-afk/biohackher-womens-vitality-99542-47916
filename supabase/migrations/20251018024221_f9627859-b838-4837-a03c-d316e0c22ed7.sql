-- Create storage bucket for expert credentials

INSERT INTO storage.buckets (id, name, public)
VALUES ('expert-credentials', 'expert-credentials', false);

-- RLS Policies for expert-credentials bucket

-- Experts can upload their own credentials
CREATE POLICY "Experts can upload own credentials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'expert-credentials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Experts can view their own credentials
CREATE POLICY "Experts can view own credentials"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expert-credentials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all credentials
CREATE POLICY "Admins can view all credentials"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'expert-credentials'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Experts can delete their own credentials
CREATE POLICY "Experts can delete own credentials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'expert-credentials'
  AND auth.uid()::text = (storage.foldername(name))[1]
);