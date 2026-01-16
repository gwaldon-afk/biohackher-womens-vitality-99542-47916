-- Daily Check-in tables for Today Plan tailoring

CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 5),
  sleep_quality_score INTEGER CHECK (sleep_quality_score BETWEEN 1 AND 3),
  sleep_hours NUMERIC(4,1) CHECK (sleep_hours BETWEEN 0 AND 10),
  stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  context_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_note TEXT,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE public.user_checkin_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT true,
  questions_config JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_checkin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily check-ins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily check-ins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily check-ins"
  ON public.daily_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily check-ins"
  ON public.daily_checkins FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-in settings"
  ON public.user_checkin_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own check-in settings"
  ON public.user_checkin_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-in settings"
  ON public.user_checkin_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own check-in settings"
  ON public.user_checkin_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_daily_checkins_user_date ON public.daily_checkins(user_id, date DESC);

CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_checkin_settings_updated_at
  BEFORE UPDATE ON public.user_checkin_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
