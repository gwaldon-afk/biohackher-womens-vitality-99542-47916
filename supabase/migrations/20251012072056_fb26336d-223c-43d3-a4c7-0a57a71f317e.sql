-- ===================================
-- Health Goals Feature - Database Schema
-- ===================================

-- 1. Create goal_templates table
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

CREATE INDEX idx_goal_templates_pillar ON goal_templates(pillar_category);
CREATE INDEX idx_goal_templates_active ON goal_templates(is_active);
CREATE INDEX idx_goal_templates_assessment ON goal_templates USING GIN(target_assessment_types);

-- 2. Create subscription_tier_limits table
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

CREATE INDEX idx_tier_limits_tier ON subscription_tier_limits(tier_name);

-- 3. Create user_health_goals table
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

CREATE INDEX idx_user_goals_user_id ON user_health_goals(user_id);
CREATE INDEX idx_user_goals_status ON user_health_goals(status);
CREATE INDEX idx_user_goals_pillar ON user_health_goals(pillar_category);
CREATE INDEX idx_user_goals_template ON user_health_goals(template_id);
CREATE INDEX idx_user_goals_next_checkin ON user_health_goals(next_check_in_due) WHERE status = 'active';

-- 4. Create goal_check_ins table
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
    CASE WHEN total_metrics > 0 THEN (metrics_achieved::numeric / total_metrics::numeric * 100)
    ELSE 0 END
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

CREATE INDEX idx_check_ins_goal_id ON goal_check_ins(goal_id);
CREATE INDEX idx_check_ins_user_id ON goal_check_ins(user_id);
CREATE INDEX idx_check_ins_date ON goal_check_ins(check_in_date);

-- 5. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create triggers
CREATE TRIGGER update_goal_templates_updated_at
  BEFORE UPDATE ON goal_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_health_goals_updated_at
  BEFORE UPDATE ON user_health_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_check_ins_updated_at
  BEFORE UPDATE ON goal_check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Create trigger to update goal progress on check-in
CREATE OR REPLACE FUNCTION update_goal_progress_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_health_goals
  SET 
    current_progress = NEW.progress_percentage,
    last_check_in_date = NEW.check_in_date,
    next_check_in_due = NEW.check_in_date + INTERVAL '1 week',
    updated_at = NOW()
  WHERE id = NEW.goal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
  AFTER INSERT OR UPDATE ON goal_check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress_on_checkin();

-- 8. Enable RLS on all tables
ALTER TABLE goal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tier_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_check_ins ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for goal_templates
CREATE POLICY "Anyone can view active templates"
  ON goal_templates FOR SELECT
  USING (is_active = true);

-- 10. Create RLS policies for subscription_tier_limits
CREATE POLICY "Anyone can view tier limits"
  ON subscription_tier_limits FOR SELECT
  USING (true);

-- 11. Create RLS policies for user_health_goals
CREATE POLICY "Users can view own goals"
  ON user_health_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON user_health_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON user_health_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON user_health_goals FOR DELETE
  USING (auth.uid() = user_id);

-- 12. Create RLS policies for goal_check_ins
CREATE POLICY "Users can view own check-ins"
  ON goal_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own check-ins"
  ON goal_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON goal_check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON goal_check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- ===================================
-- Seed Data
-- ===================================

-- 13. Seed subscription_tier_limits
INSERT INTO subscription_tier_limits (
  tier_name, max_active_goals, max_total_goals, can_use_ai_optimization,
  can_use_adaptive_recommendations, can_track_biological_age_impact,
  can_access_advanced_analytics, available_check_in_frequencies,
  max_check_ins_per_month, restricted_template_keys, display_name, marketing_description
) VALUES
('guest', 0, 0, false, false, false, false, ARRAY[]::TEXT[], 0, ARRAY[]::TEXT[], 'Guest', 'Sign up to start setting health goals'),
('registered', 3, NULL, false, false, false, false, ARRAY['weekly'], NULL, ARRAY[]::TEXT[], 'Free Plan', 'Set up to 3 active health goals with weekly tracking'),
('subscribed', NULL, NULL, true, true, true, true, ARRAY['daily', 'weekly', 'biweekly', 'monthly'], NULL, ARRAY[]::TEXT[], 'Premium Plan', 'Unlimited goals with AI optimization and advanced analytics'),
('premium', NULL, NULL, true, true, true, true, ARRAY['daily', 'weekly', 'biweekly', 'monthly'], NULL, ARRAY[]::TEXT[], 'Premium Plan', 'Unlimited goals with AI optimization and advanced analytics');

-- 14. Seed goal_templates
INSERT INTO goal_templates (
  template_key, name, description, detailed_description, pillar_category, icon_name,
  target_assessment_types, default_healthspan_target, default_interventions,
  default_metrics, common_barriers, display_order, is_active
) VALUES
(
  'cognitive-optimization', 'Cognitive Optimization', 'Enhance mental clarity, focus, and memory',
  'A comprehensive protocol to optimize brain function through evidence-based interventions targeting neuroplasticity, neurotransmitter balance, and cognitive resilience.',
  'brain', 'Brain', ARRAY['cognitive-function', 'brain-fog', 'concentration'],
  '{"objective_template": "Improve cognitive performance and mental clarity", "baseline_questions": ["Current mental sharpness?", "Memory recall?", "Focus duration?"], "outcome_template": "Achieve sustained focus, improved memory, and mental clarity"}'::jsonb,
  '{"interventions": [{"name": "Omega-3 supplementation", "type": "supplement", "rationale": "Supports brain cell membrane health"}, {"name": "Cognitive training", "type": "activity", "rationale": "Promotes neuroplasticity"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Processing speed", "unit": "ms"}, {"name": "Memory recall test score", "unit": "points"}], "lis_connection": {"pillar": "brain"}, "self_reported": [{"name": "Mental clarity", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Forget to take supplements", "if_then_template": "If I forget morning supplements, then I will set a phone alarm"}]'::jsonb,
  1, true
),
(
  'sleep-restoration', 'Sleep Restoration', 'Optimize sleep quality and duration for recovery',
  'Science-backed strategies to improve sleep architecture, reduce sleep latency, and enhance restorative deep sleep phases.',
  'brain', 'Moon', ARRAY['sleep', 'insomnia', 'sleep-quality'],
  '{"objective_template": "Achieve 7-9 hours of quality sleep nightly", "baseline_questions": ["Average sleep duration?", "Sleep quality rating?", "Wake feeling refreshed?"], "outcome_template": "Consistent deep sleep and waking refreshed"}'::jsonb,
  '{"interventions": [{"name": "Magnesium glycinate before bed", "type": "supplement", "rationale": "Promotes relaxation and sleep"}, {"name": "Blue light blocking 2hrs before bed", "type": "habit", "rationale": "Protects melatonin production"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Deep sleep hours", "unit": "hours"}, {"name": "REM hours", "unit": "hours"}, {"name": "HRV", "unit": "ms"}], "lis_connection": {"pillar": "brain"}, "self_reported": [{"name": "Sleep quality", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Stimulating activities before bed", "if_then_template": "If I am tempted to scroll phone, then I will read a book instead"}]'::jsonb,
  2, true
),
(
  'metabolic-health', 'Metabolic Health', 'Optimize metabolism, energy, and body composition',
  'A holistic approach to metabolic optimization through nutrition timing, movement, and targeted supplementation.',
  'body', 'Activity', ARRAY['weight-changes', 'energy-levels', 'metabolism'],
  '{"objective_template": "Optimize metabolic function and energy levels", "baseline_questions": ["Current energy levels?", "Fasting glucose?", "Body composition?"], "outcome_template": "Stable energy, improved metabolic markers"}'::jsonb,
  '{"interventions": [{"name": "Time-restricted eating (16:8)", "type": "nutrition", "rationale": "Improves insulin sensitivity"}, {"name": "Zone 2 cardio 3x/week", "type": "exercise", "rationale": "Enhances mitochondrial function"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Fasting glucose", "unit": "mg/dL"}, {"name": "Body fat percentage", "unit": "%"}, {"name": "VO2 max", "unit": "mL/kg/min"}], "lis_connection": {"pillar": "body"}, "self_reported": [{"name": "Energy level", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Social eating disrupts fasting", "if_then_template": "If invited to breakfast, then I will adjust eating window to 12-8pm"}]'::jsonb,
  3, true
),
(
  'joint-mobility', 'Joint & Mobility', 'Improve joint health and range of motion',
  'Comprehensive joint support through anti-inflammatory nutrition, targeted supplementation, and mobility work.',
  'body', 'Move', ARRAY['joint-pain', 'stiffness', 'mobility'],
  '{"objective_template": "Reduce joint pain and improve mobility", "baseline_questions": ["Pain level?", "Range of motion limitations?", "Daily activities affected?"], "outcome_template": "Pain-free movement and full range of motion"}'::jsonb,
  '{"interventions": [{"name": "Collagen peptides daily", "type": "supplement", "rationale": "Supports joint cartilage"}, {"name": "Daily mobility routine", "type": "exercise", "rationale": "Maintains joint health"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Range of motion", "unit": "degrees"}, {"name": "Inflammation markers (CRP)", "unit": "mg/L"}], "lis_connection": {"pillar": "body"}, "self_reported": [{"name": "Pain level", "scale": "0-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Morning stiffness prevents exercise", "if_then_template": "If joints are stiff, then I will do gentle warm-up first"}]'::jsonb,
  4, true
),
(
  'stress-resilience', 'Stress Resilience', 'Build resilience to stress and improve emotional balance',
  'Evidence-based approaches to managing stress response, supporting HRV, and maintaining emotional equilibrium.',
  'balance', 'Heart', ARRAY['anxiety', 'stress', 'overwhelm'],
  '{"objective_template": "Improve stress resilience and emotional balance", "baseline_questions": ["Stress level?", "HRV baseline?", "Coping strategies?"], "outcome_template": "Lower perceived stress and improved HRV"}'::jsonb,
  '{"interventions": [{"name": "Adaptogenic herbs (Ashwagandha)", "type": "supplement", "rationale": "Modulates cortisol response"}, {"name": "Daily HRV-guided meditation", "type": "practice", "rationale": "Strengthens parasympathetic tone"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "HRV", "unit": "ms"}, {"name": "Cortisol levels", "unit": "µg/dL"}], "lis_connection": {"pillar": "balance"}, "self_reported": [{"name": "Stress level", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "No time for meditation", "if_then_template": "If I skip morning meditation, then I will do 5-min breathing before bed"}]'::jsonb,
  5, true
),
(
  'hormonal-balance', 'Hormonal Balance', 'Support hormonal health through menopause transitions',
  'Targeted support for hormonal balance during perimenopause and menopause, addressing symptoms naturally.',
  'balance', 'Sparkles', ARRAY['hot-flashes', 'mood-swings', 'menopause'],
  '{"objective_template": "Achieve hormonal balance and reduce symptoms", "baseline_questions": ["Hot flash frequency?", "Mood stability?", "Sleep disruption?"], "outcome_template": "Reduced symptoms and improved wellbeing"}'::jsonb,
  '{"interventions": [{"name": "Black cohosh supplement", "type": "supplement", "rationale": "Reduces hot flash frequency"}, {"name": "Phytoestrogen-rich foods", "type": "nutrition", "rationale": "Natural hormonal support"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Hot flash frequency", "unit": "per day"}, {"name": "Hormone panel", "unit": "various"}], "lis_connection": {"pillar": "balance"}, "self_reported": [{"name": "Mood stability", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Forget to take supplements", "if_then_template": "If I forget supplements, then I will keep them by coffee maker"}]'::jsonb,
  6, true
),
(
  'cellular-longevity', 'Cellular Longevity', 'Optimize cellular health and biological aging markers',
  'Cutting-edge interventions targeting cellular senescence, autophagy, and NAD+ levels for longevity.',
  'beauty', 'Sparkles', ARRAY['skin-health', 'aging', 'cellular-health'],
  '{"objective_template": "Optimize cellular health and reduce biological age", "baseline_questions": ["Skin elasticity?", "Energy levels?", "Current biological age?"], "outcome_template": "Improved cellular markers and skin health"}'::jsonb,
  '{"interventions": [{"name": "NAD+ precursors (NMN/NR)", "type": "supplement", "rationale": "Supports cellular energy"}, {"name": "Red light therapy", "type": "therapy", "rationale": "Stimulates collagen production"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Biological age", "unit": "years"}, {"name": "Skin elasticity", "unit": "score"}], "lis_connection": {"pillar": "beauty"}, "self_reported": [{"name": "Skin appearance", "scale": "1-10"}], "frequency": "weekly"}'::jsonb,
  '[{"barrier": "Cost of therapies", "if_then_template": "If therapy is too expensive, then I will prioritize sleep and nutrition first"}]'::jsonb,
  7, true
),
(
  'hair-vitality', 'Hair Vitality', 'Support hair health, growth, and density',
  'Comprehensive approach to hair health through targeted nutrition, scalp care, and supplementation.',
  'beauty', 'Sparkles', ARRAY['hair-thinning', 'hair-loss', 'hair-health'],
  '{"objective_template": "Improve hair density and growth rate", "baseline_questions": ["Hair density?", "Hair growth rate?", "Scalp health?"], "outcome_template": "Increased hair density and improved growth"}'::jsonb,
  '{"interventions": [{"name": "Biotin complex", "type": "supplement", "rationale": "Supports hair keratin"}, {"name": "Scalp massage routine", "type": "practice", "rationale": "Improves blood flow to follicles"}], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [{"name": "Hair density", "unit": "hairs/cm²"}, {"name": "Growth rate", "unit": "cm/month"}], "lis_connection": {"pillar": "beauty"}, "self_reported": [{"name": "Hair thickness", "scale": "1-10"}], "frequency": "monthly"}'::jsonb,
  '[{"barrier": "Inconsistent supplement use", "if_then_template": "If I forget biotin, then I will pair it with morning coffee"}]'::jsonb,
  8, true
),
(
  'custom-goal', 'Custom Goal', 'Start from scratch and design your own health goal',
  'Create a fully customized health goal tailored to your unique needs and objectives.',
  'brain', 'Target', ARRAY[]::TEXT[],
  '{"objective_template": "", "baseline_questions": [], "outcome_template": ""}'::jsonb,
  '{"interventions": [], "toolkit_item_ids": [], "product_ids": []}'::jsonb,
  '{"external": [], "lis_connection": {}, "self_reported": [], "frequency": "weekly"}'::jsonb,
  '[]'::jsonb,
  99, true
);