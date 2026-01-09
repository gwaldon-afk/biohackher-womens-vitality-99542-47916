-- =====================================================
-- COACH & EXERCISE PROGRAM MODULE - DATABASE SCHEMA
-- =====================================================

-- 1. Exercise Programs Metadata Table
CREATE TABLE public.exercise_programs_meta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL DEFAULT 4,
  sessions_per_week INTEGER NOT NULL DEFAULT 3,
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate',
  equipment_required TEXT[] DEFAULT '{}',
  suitable_for TEXT[] DEFAULT '{}',
  focus_areas TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_programs_meta ENABLE ROW LEVEL SECURITY;

-- Public read access for programs
CREATE POLICY "Programs are viewable by everyone"
ON public.exercise_programs_meta
FOR SELECT
USING (true);

-- 2. User Program Access Table
CREATE TABLE public.user_program_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_id UUID REFERENCES public.exercise_programs_meta(id) ON DELETE CASCADE,
  program_key TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_week INTEGER DEFAULT 1,
  current_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  paused_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, program_key)
);

-- Enable RLS
ALTER TABLE public.user_program_access ENABLE ROW LEVEL SECURITY;

-- User can only access their own program data
CREATE POLICY "Users can view their own program access"
ON public.user_program_access FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own program access"
ON public.user_program_access FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own program access"
ON public.user_program_access FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own program access"
ON public.user_program_access FOR DELETE
USING (auth.uid() = user_id);

-- 3. Exercise Workout Completions Table
CREATE TABLE public.exercise_workout_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_key TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  day_number INTEGER NOT NULL,
  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  exercises_completed JSONB DEFAULT '[]',
  duration_minutes INTEGER,
  perceived_effort INTEGER CHECK (perceived_effort >= 1 AND perceived_effort <= 10),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exercise_workout_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workout completions"
ON public.exercise_workout_completions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout completions"
ON public.exercise_workout_completions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout completions"
ON public.exercise_workout_completions FOR UPDATE
USING (auth.uid() = user_id);

-- 4. User Exercise Swaps Table
CREATE TABLE public.user_exercise_swaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_exercise_key TEXT NOT NULL,
  replacement_exercise_key TEXT NOT NULL,
  program_key TEXT,
  swap_type TEXT NOT NULL DEFAULT 'temporary' CHECK (swap_type IN ('temporary', 'permanent')),
  reason TEXT,
  swap_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_exercise_swaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exercise swaps"
ON public.user_exercise_swaps FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise swaps"
ON public.user_exercise_swaps FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise swaps"
ON public.user_exercise_swaps FOR DELETE
USING (auth.uid() = user_id);

-- 5. User Workout Schedule Modifications Table
CREATE TABLE public.user_workout_schedule_mods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_key TEXT NOT NULL,
  original_date DATE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('reschedule', 'swap', 'skip', 'recovery')),
  new_date DATE,
  swap_with_date DATE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_workout_schedule_mods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own schedule mods"
ON public.user_workout_schedule_mods FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedule mods"
ON public.user_workout_schedule_mods FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Add columns to user_health_profile for exercise preferences
ALTER TABLE public.user_health_profile 
ADD COLUMN IF NOT EXISTS equipment_access TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_session_duration TEXT DEFAULT '30-45',
ADD COLUMN IF NOT EXISTS preferred_workout_days INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS desired_intensity TEXT DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS training_aspiration TEXT,
ADD COLUMN IF NOT EXISTS training_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS program_duration_preference TEXT DEFAULT '4-week',
ADD COLUMN IF NOT EXISTS recovery_needs TEXT,
ADD COLUMN IF NOT EXISTS exercise_considerations TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS exercise_setup_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS selected_program_id UUID REFERENCES public.exercise_programs_meta(id),
ADD COLUMN IF NOT EXISTS wearable_auto_adjust BOOLEAN DEFAULT true;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_program_access_user_id ON public.user_program_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_program_access_active ON public.user_program_access(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workout_completions_user_date ON public.exercise_workout_completions(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_exercise_swaps_user ON public.user_exercise_swaps(user_id, program_key);
CREATE INDEX IF NOT EXISTS idx_schedule_mods_user ON public.user_workout_schedule_mods(user_id, program_key);

-- 8. Trigger for updated_at on new tables
CREATE TRIGGER update_exercise_programs_meta_updated_at
BEFORE UPDATE ON public.exercise_programs_meta
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_program_access_updated_at
BEFORE UPDATE ON public.user_program_access
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();