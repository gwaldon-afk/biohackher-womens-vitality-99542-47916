-- =============================================
-- PART 2: SYMPTOMS, ASSESSMENTS, GOALS, AND MORE
-- =============================================

-- =============================================
-- 5. SYMPTOM TRACKING
-- =============================================

CREATE TABLE public.user_symptoms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptom_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  severity TEXT NOT NULL DEFAULT 'Mild',
  frequency TEXT NOT NULL DEFAULT 'Occasional',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, symptom_id)
);

CREATE TABLE public.symptom_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptom_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  frequency TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.symptom_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptom_id TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  triggers JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.nutrition_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dietary_restrictions TEXT[],
  allergies TEXT[],
  food_preferences TEXT[],
  health_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own symptoms" ON public.user_symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own symptoms" ON public.user_symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own symptoms" ON public.user_symptoms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own symptoms" ON public.user_symptoms FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own symptom assessments" ON public.symptom_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own symptom assessments" ON public.symptom_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own symptom assessments" ON public.symptom_assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own symptom tracking" ON public.symptom_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own symptom tracking" ON public.symptom_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own symptom tracking" ON public.symptom_tracking FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own nutrition preferences" ON public.nutrition_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own nutrition preferences" ON public.nutrition_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own nutrition preferences" ON public.nutrition_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_symptoms_updated_at BEFORE UPDATE ON public.user_symptoms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_symptom_assessments_updated_at BEFORE UPDATE ON public.symptom_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_symptom_tracking_updated_at BEFORE UPDATE ON public.symptom_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_nutrition_preferences_updated_at BEFORE UPDATE ON public.nutrition_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 6. ASSESSMENT COMPLETIONS AND USER PROGRESS
-- =============================================

CREATE TABLE public.user_assessment_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id TEXT NOT NULL,
  pillar TEXT,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, assessment_id)
);

CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER DEFAULT 1,
  pillars_visited JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.streak_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_assessment_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessment completions" ON public.user_assessment_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own assessment completions" ON public.user_assessment_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own assessment completions" ON public.user_assessment_completions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own streaks" ON public.streak_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own streaks" ON public.streak_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own streaks" ON public.streak_tracking FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_assessment_completions_updated_at BEFORE UPDATE ON public.user_assessment_completions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_streak_tracking_updated_at BEFORE UPDATE ON public.streak_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_assessment_completions_user_id ON public.user_assessment_completions(user_id);
CREATE INDEX idx_user_assessment_completions_pillar ON public.user_assessment_completions(pillar);
CREATE INDEX idx_user_assessment_completions_assessment_id ON public.user_assessment_completions(assessment_id);

-- =============================================
-- 7. ASSESSMENTS
-- =============================================

CREATE TABLE public.assessments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  pillar TEXT NOT NULL,
  journey_path TEXT,
  scoring_guidance JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_order INTEGER NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, question_order)
);

CREATE TABLE public.assessment_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  score_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, option_order)
);

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view assessments" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "Anyone can view assessment questions" ON public.assessment_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can view assessment options" ON public.assessment_question_options FOR SELECT USING (true);

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Continue in next message...