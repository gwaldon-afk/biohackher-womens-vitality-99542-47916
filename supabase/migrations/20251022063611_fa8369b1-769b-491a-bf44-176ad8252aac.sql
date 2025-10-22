-- =============================================
-- COMPREHENSIVE DATABASE RESTORATION
-- Restoring full schema from migration history
-- =============================================

-- Create update_updated_at function (used by many triggers)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =============================================
-- 1. USER PROFILES AND AUTHENTICATION
-- =============================================

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, preferred_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'preferred_name', split_part(new.email, '@', 1)), new.email);
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 2. USER ROLES AND PERMISSIONS
-- =============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 3. DAILY SCORES AND WEARABLE DATA (LIS System)
-- =============================================

CREATE TABLE public.daily_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  longevity_impact_score NUMERIC(5,2) NOT NULL,
  biological_age_impact NUMERIC(5,2) NOT NULL,
  color_code TEXT NOT NULL,
  sleep_score NUMERIC(5,2),
  stress_score NUMERIC(5,2), 
  physical_activity_score NUMERIC(5,2),
  nutrition_score NUMERIC(5,2),
  social_connections_score NUMERIC(5,2),
  cognitive_engagement_score NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE public.wearable_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  device_type TEXT NOT NULL,
  total_sleep_hours NUMERIC(4,2),
  rem_sleep_percentage NUMERIC(5,2),
  heart_rate_variability NUMERIC(6,2),
  resting_heart_rate INTEGER,
  active_minutes INTEGER,
  steps INTEGER,
  exercise_intensity_zones JSONB,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, device_type)
);

CREATE TABLE public.self_reported_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  loveable_score INTEGER CHECK (loveable_score >= 1 AND loveable_score <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  social_interaction_quality INTEGER CHECK (social_interaction_quality >= 1 AND social_interaction_quality <= 10),
  journal_entry TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE public.habit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  date DATE NOT NULL,
  habit_type TEXT NOT NULL,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date, habit_type)
);

ALTER TABLE public.daily_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_reported_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily scores" ON public.daily_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily scores" ON public.daily_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily scores" ON public.daily_scores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wearable data" ON public.wearable_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wearable data" ON public.wearable_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own self-reported metrics" ON public.self_reported_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own self-reported metrics" ON public.self_reported_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own self-reported metrics" ON public.self_reported_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own habit tracking" ON public.habit_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habit tracking" ON public.habit_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habit tracking" ON public.habit_tracking FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_scores_updated_at BEFORE UPDATE ON public.daily_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_self_reported_metrics_updated_at BEFORE UPDATE ON public.self_reported_metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_daily_scores_user_date ON public.daily_scores(user_id, date DESC);
CREATE INDEX idx_wearable_data_user_date ON public.wearable_data(user_id, date DESC);
CREATE INDEX idx_self_reported_metrics_user_date ON public.self_reported_metrics(user_id, date DESC);
CREATE INDEX idx_habit_tracking_user_date ON public.habit_tracking(user_id, date DESC);

-- =============================================
-- 4. PROTOCOL MANAGEMENT
-- =============================================

CREATE TYPE public.protocol_item_type AS ENUM ('supplement', 'therapy', 'habit', 'exercise', 'diet');
CREATE TYPE public.protocol_frequency AS ENUM ('daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed');

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

ALTER TABLE public.user_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own protocols" ON public.user_protocols FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own protocols" ON public.user_protocols FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own protocols" ON public.user_protocols FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own protocols" ON public.user_protocols FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own protocol items" ON public.protocol_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_protocols WHERE user_protocols.id = protocol_items.protocol_id AND user_protocols.user_id = auth.uid()));
CREATE POLICY "Users can insert their own protocol items" ON public.protocol_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_protocols WHERE user_protocols.id = protocol_items.protocol_id AND user_protocols.user_id = auth.uid()));
CREATE POLICY "Users can update their own protocol items" ON public.protocol_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_protocols WHERE user_protocols.id = protocol_items.protocol_id AND user_protocols.user_id = auth.uid()));
CREATE POLICY "Users can delete their own protocol items" ON public.protocol_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_protocols WHERE user_protocols.id = protocol_items.protocol_id AND user_protocols.user_id = auth.uid()));

CREATE POLICY "Users can view their own adherence" ON public.protocol_adherence FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own adherence" ON public.protocol_adherence FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own adherence" ON public.protocol_adherence FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own adherence" ON public.protocol_adherence FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own measurements" ON public.progress_measurements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own measurements" ON public.progress_measurements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own measurements" ON public.progress_measurements FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own measurements" ON public.progress_measurements FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own photos" ON public.progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own photos" ON public.progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own photos" ON public.progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own photos" ON public.progress_photos FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_protocols_updated_at BEFORE UPDATE ON public.user_protocols FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protocol_items_updated_at BEFORE UPDATE ON public.protocol_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_protocol_adherence_updated_at BEFORE UPDATE ON public.protocol_adherence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_progress_measurements_updated_at BEFORE UPDATE ON public.progress_measurements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_progress_photos_updated_at BEFORE UPDATE ON public.progress_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Continue in next message due to size...