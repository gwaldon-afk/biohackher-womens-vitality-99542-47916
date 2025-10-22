-- =============================================
-- PART 5: ACHIEVEMENTS, INSIGHTS, WEARABLES, ENERGY, MENOPAUSE, EXPERTS
-- =============================================

-- =============================================
-- 10. ACHIEVEMENTS AND GAMIFICATION
-- =============================================

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  points INTEGER NOT NULL DEFAULT 10,
  requirements JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  points_to_next_level INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active achievements" ON public.achievements FOR SELECT USING (is_active = true);
CREATE POLICY "Users can view their own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 11. INSIGHTS AND WEARABLES
-- =============================================

CREATE TABLE public.user_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_viewed BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  viewed_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.wearable_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own insights" ON public.user_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own insights" ON public.user_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insights" ON public.user_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own wearable connections" ON public.wearable_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own wearable connections" ON public.wearable_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own wearable connections" ON public.wearable_connections FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_insights_updated_at BEFORE UPDATE ON public.user_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wearable_connections_updated_at BEFORE UPDATE ON public.wearable_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 12. SUBSCRIPTIONS AND HEALTH PROFILES
-- =============================================

CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'registered' CHECK (tier IN ('guest', 'registered', 'subscribed', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'trial')),
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  daily_submissions_count INTEGER DEFAULT 0,
  last_daily_submission_date DATE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_health_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  date_of_birth DATE,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  bmi NUMERIC,
  biological_sex TEXT,
  menopause_status TEXT,
  smoking_status TEXT,
  alcohol_consumption TEXT,
  exercise_frequency TEXT,
  diet_type TEXT,
  chronic_conditions TEXT[],
  current_medications TEXT[],
  allergies TEXT[],
  family_history JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.guest_lis_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pillar_scores JSONB NOT NULL,
  overall_score NUMERIC NOT NULL,
  longevity_impact_score NUMERIC NOT NULL,
  biological_age_impact NUMERIC NOT NULL,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_health_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_lis_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own health profile" ON public.user_health_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own health profile" ON public.user_health_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own health profile" ON public.user_health_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert guest assessments" ON public.guest_lis_assessments FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_health_profile_updated_at BEFORE UPDATE ON public.user_health_profile FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 13. ENERGY LOOP TRACKING
-- =============================================

CREATE TABLE public.energy_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 10),
  context_tags TEXT[],
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.energy_loop_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  morning_energy NUMERIC,
  afternoon_energy NUMERIC,
  evening_energy NUMERIC,
  average_daily_energy NUMERIC,
  energy_stability_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE public.energy_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendations JSONB,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.energy_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_loop_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own energy check-ins" ON public.energy_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own energy check-ins" ON public.energy_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own energy scores" ON public.energy_loop_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own energy scores" ON public.energy_loop_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own energy insights" ON public.energy_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own energy insights" ON public.energy_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 14. MENOPAUSE TRACKING
-- =============================================

CREATE TABLE public.menopause_symptom_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptom_type TEXT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.menopause_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recommendations JSONB,
  is_viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.menopause_symptom_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menopause_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own menopause tracking" ON public.menopause_symptom_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own menopause tracking" ON public.menopause_symptom_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own menopause insights" ON public.menopause_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own menopause insights" ON public.menopause_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 15. EXPERT PROFILES
-- =============================================

CREATE TABLE public.expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  professional_title TEXT NOT NULL,
  bio TEXT,
  specialties TEXT[],
  credentials TEXT[],
  years_experience INTEGER,
  location TEXT,
  timezone TEXT,
  profile_photo_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.expert_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price_gbp NUMERIC(10,2),
  price_usd NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved expert profiles" ON public.expert_profiles FOR SELECT USING (verification_status = 'approved' AND is_active = true);
CREATE POLICY "Experts can view their own profile" ON public.expert_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Experts can insert their own profile" ON public.expert_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Experts can update their own profile" ON public.expert_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view services from approved experts" ON public.expert_services FOR SELECT USING (EXISTS (SELECT 1 FROM public.expert_profiles WHERE expert_profiles.id = expert_services.expert_id AND expert_profiles.verification_status = 'approved' AND expert_profiles.is_active = true));
CREATE POLICY "Experts can manage their own services" ON public.expert_services FOR ALL USING (EXISTS (SELECT 1 FROM public.expert_profiles WHERE expert_profiles.id = expert_services.expert_id AND expert_profiles.user_id = auth.uid()));

CREATE TRIGGER update_expert_profiles_updated_at BEFORE UPDATE ON public.expert_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expert_services_updated_at BEFORE UPDATE ON public.expert_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Database restoration complete!