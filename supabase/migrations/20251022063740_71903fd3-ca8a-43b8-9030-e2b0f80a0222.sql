-- =============================================
-- PART 3: GOALS, TOOLKIT, PRODUCTS, ACHIEVEMENTS
-- =============================================

-- =============================================
-- 8. HEALTH GOALS SYSTEM
-- =============================================

CREATE TABLE goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  pillar_category TEXT NOT NULL CHECK (pillar_category IN ('brain', 'body', 'balance', 'beauty')),
  icon_name TEXT NOT NULL,
  target_assessment_types TEXT[] DEFAULT '{}',
  default_healthspan_target JSONB,
  default_interventions JSONB,
  default_metrics JSONB,
  common_barriers JSONB,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subscription_tier_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT NOT NULL UNIQUE CHECK (tier_name IN ('guest', 'registered', 'subscribed', 'premium')),
  max_active_goals INTEGER,
  max_total_goals INTEGER,
  can_use_ai_optimization BOOLEAN NOT NULL DEFAULT false,
  can_use_adaptive_recommendations BOOLEAN NOT NULL DEFAULT false,
  can_track_biological_age_impact BOOLEAN NOT NULL DEFAULT false,
  can_access_advanced_analytics BOOLEAN NOT NULL DEFAULT false,
  available_check_in_frequencies TEXT[] DEFAULT ARRAY['weekly'],
  max_check_ins_per_month INTEGER,
  restricted_template_keys TEXT[] DEFAULT '{}',
  display_name TEXT NOT NULL,
  marketing_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_health_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES goal_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  pillar_category TEXT NOT NULL CHECK (pillar_category IN ('brain', 'body', 'balance', 'beauty')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  healthspan_target JSONB NOT NULL,
  aging_blueprint JSONB NOT NULL,
  barriers_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  longevity_metrics JSONB NOT NULL,
  triggered_by_assessment_id TEXT,
  related_assessment_ids TEXT[] DEFAULT '{}',
  current_progress NUMERIC DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  last_check_in_date TIMESTAMP WITH TIME ZONE,
  next_check_in_due DATE,
  check_in_frequency TEXT DEFAULT 'weekly',
  ai_optimization_plan TEXT,
  ai_generated_at TIMESTAMP WITH TIME ZONE,
  adaptive_recommendations JSONB DEFAULT '[]'::jsonb,
  biological_age_impact_predicted NUMERIC,
  biological_age_impact_actual NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE goal_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES user_health_goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  external_biomarkers JSONB,
  lis_impact JSONB,
  self_reported_metrics JSONB,
  metrics_achieved INTEGER NOT NULL DEFAULT 0,
  total_metrics INTEGER NOT NULL,
  progress_percentage NUMERIC GENERATED ALWAYS AS (
    CASE WHEN total_metrics > 0 THEN (metrics_achieved::numeric / total_metrics::numeric * 100) ELSE 0 END
  ) STORED,
  whats_working TEXT,
  whats_not_working TEXT,
  barriers_encountered TEXT[] DEFAULT '{}',
  adjustments_needed TEXT,
  motivation_level INTEGER CHECK (motivation_level BETWEEN 1 AND 10),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  ai_coaching_suggestions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(goal_id, check_in_date)
);

CREATE TABLE goal_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_health_goals(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('progress', 'motivation', 'barrier', 'optimization', 'celebration')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_suggestions JSONB DEFAULT '[]'::jsonb,
  severity TEXT CHECK (severity IN ('info', 'warning', 'celebration')),
  acknowledged BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tier_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active templates" ON goal_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view tier limits" ON subscription_tier_limits FOR SELECT USING (true);
CREATE POLICY "Users can view own goals" ON user_health_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON user_health_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON user_health_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON user_health_goals FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own check-ins" ON goal_check_ins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own check-ins" ON goal_check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own check-ins" ON goal_check_ins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own check-ins" ON goal_check_ins FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own goal insights" ON goal_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goal insights" ON goal_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goal insights" ON goal_insights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goal insights" ON goal_insights FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_goal_templates_pillar ON goal_templates(pillar_category);
CREATE INDEX idx_goal_templates_active ON goal_templates(is_active);
CREATE INDEX idx_user_goals_user_id ON user_health_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_health_goals(status);
CREATE INDEX idx_check_ins_goal_id ON goal_check_ins(goal_id);
CREATE INDEX idx_goal_insights_user_id ON goal_insights(user_id);

CREATE TRIGGER update_goal_templates_updated_at BEFORE UPDATE ON goal_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_health_goals_updated_at BEFORE UPDATE ON user_health_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goal_check_ins_updated_at BEFORE UPDATE ON goal_check_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goal_insights_updated_at BEFORE UPDATE ON goal_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed subscription tier data
INSERT INTO subscription_tier_limits (tier_name, max_active_goals, max_total_goals, can_use_ai_optimization, can_use_adaptive_recommendations, can_track_biological_age_impact, can_access_advanced_analytics, available_check_in_frequencies, max_check_ins_per_month, restricted_template_keys, display_name, marketing_description) VALUES
('guest', 0, 0, false, false, false, false, ARRAY[]::TEXT[], 0, ARRAY[]::TEXT[], 'Guest', 'Sign up to start setting health goals'),
('registered', 3, NULL, false, false, false, false, ARRAY['weekly'], NULL, ARRAY[]::TEXT[], 'Free Plan', 'Set up to 3 active health goals with weekly tracking'),
('subscribed', NULL, NULL, true, true, true, true, ARRAY['daily', 'weekly', 'biweekly', 'monthly'], NULL, ARRAY[]::TEXT[], 'Premium Plan', 'Unlimited goals with AI optimization and advanced analytics'),
('premium', NULL, NULL, true, true, true, true, ARRAY['daily', 'weekly', 'biweekly', 'monthly'], NULL, ARRAY[]::TEXT[], 'Premium Plan', 'Unlimited goals with AI optimization and advanced analytics');

-- Continue in next message...