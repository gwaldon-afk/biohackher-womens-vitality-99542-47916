-- Create enum for protocol item types
CREATE TYPE public.protocol_item_type AS ENUM ('supplement', 'therapy', 'habit', 'exercise', 'diet');

-- Create enum for protocol item frequency
CREATE TYPE public.protocol_frequency AS ENUM ('daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed');

-- Create user_protocols table
CREATE TABLE public.user_protocols (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_from_pillar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create protocol_items table
CREATE TABLE public.protocol_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocol_id UUID NOT NULL REFERENCES public.user_protocols(id) ON DELETE CASCADE,
  item_type public.protocol_item_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dosage TEXT,
  frequency public.protocol_frequency NOT NULL DEFAULT 'daily',
  time_of_day TEXT[],
  notes TEXT,
  product_link TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create protocol_adherence table
CREATE TABLE public.protocol_adherence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  protocol_item_id UUID NOT NULL REFERENCES public.protocol_items(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(protocol_item_id, date)
);

-- Create progress_measurements table
CREATE TABLE public.progress_measurements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass NUMERIC,
  waist_circumference NUMERIC,
  hip_circumference NUMERIC,
  chest_circumference NUMERIC,
  custom_measurements JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create progress_photos table
CREATE TABLE public.progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'front',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_protocols
CREATE POLICY "Users can view their own protocols"
  ON public.user_protocols FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own protocols"
  ON public.user_protocols FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own protocols"
  ON public.user_protocols FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own protocols"
  ON public.user_protocols FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for protocol_items
CREATE POLICY "Users can view their own protocol items"
  ON public.protocol_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_protocols
    WHERE user_protocols.id = protocol_items.protocol_id
    AND user_protocols.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own protocol items"
  ON public.protocol_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_protocols
    WHERE user_protocols.id = protocol_items.protocol_id
    AND user_protocols.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own protocol items"
  ON public.protocol_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_protocols
    WHERE user_protocols.id = protocol_items.protocol_id
    AND user_protocols.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own protocol items"
  ON public.protocol_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.user_protocols
    WHERE user_protocols.id = protocol_items.protocol_id
    AND user_protocols.user_id = auth.uid()
  ));

-- RLS Policies for protocol_adherence
CREATE POLICY "Users can view their own adherence"
  ON public.protocol_adherence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adherence"
  ON public.protocol_adherence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own adherence"
  ON public.protocol_adherence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own adherence"
  ON public.protocol_adherence FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_measurements
CREATE POLICY "Users can view their own measurements"
  ON public.progress_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own measurements"
  ON public.progress_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own measurements"
  ON public.progress_measurements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own measurements"
  ON public.progress_measurements FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for progress_photos
CREATE POLICY "Users can view their own photos"
  ON public.progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own photos"
  ON public.progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
  ON public.progress_photos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON public.progress_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_user_protocols_updated_at
  BEFORE UPDATE ON public.user_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_protocol_items_updated_at
  BEFORE UPDATE ON public.protocol_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_protocol_adherence_updated_at
  BEFORE UPDATE ON public.protocol_adherence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_measurements_updated_at
  BEFORE UPDATE ON public.progress_measurements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at
  BEFORE UPDATE ON public.progress_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();