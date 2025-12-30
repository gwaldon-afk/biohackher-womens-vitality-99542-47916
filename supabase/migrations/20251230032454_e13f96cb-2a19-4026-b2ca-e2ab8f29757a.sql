-- Create meal_photos table for storing food photo logs with AI analysis
CREATE TABLE public.meal_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  photo_url TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_result JSONB,
  calories_estimated INTEGER,
  protein_g NUMERIC(5,1),
  carbs_g NUMERIC(5,1),
  fats_g NUMERIC(5,1),
  fibre_g NUMERIC(5,1),
  food_items TEXT[],
  confirmed BOOLEAN DEFAULT FALSE,
  user_adjusted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_meal_photos_user_date ON public.meal_photos(user_id, meal_date);
CREATE INDEX idx_meal_photos_confirmed ON public.meal_photos(user_id, confirmed);

-- Enable RLS
ALTER TABLE public.meal_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for meal_photos
CREATE POLICY "Users can view their own meal photos"
ON public.meal_photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal photos"
ON public.meal_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal photos"
ON public.meal_photos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal photos"
ON public.meal_photos FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_meal_photos_updated_at
BEFORE UPDATE ON public.meal_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create meal-photos storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', false);

-- Storage policies for meal-photos bucket
CREATE POLICY "Users can upload their own meal photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own meal photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own meal photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'meal-photos' AND auth.uid()::text = (storage.foldername(name))[1]);