-- Create goal_insights table for AI-generated goal recommendations
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

-- Enable RLS
ALTER TABLE goal_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own goal insights"
  ON goal_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goal insights"
  ON goal_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal insights"
  ON goal_insights FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goal insights"
  ON goal_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_goal_insights_user_id ON goal_insights(user_id);
CREATE INDEX idx_goal_insights_goal_id ON goal_insights(goal_id);
CREATE INDEX idx_goal_insights_created_at ON goal_insights(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_goal_insights_updated_at
  BEFORE UPDATE ON goal_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();