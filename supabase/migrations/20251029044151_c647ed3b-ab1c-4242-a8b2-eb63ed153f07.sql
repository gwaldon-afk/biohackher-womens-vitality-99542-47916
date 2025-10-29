-- Create assessment_ai_insights table for storing AI-generated analysis
CREATE TABLE assessment_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  symptom_assessment_id UUID REFERENCES symptom_assessments(id),
  
  -- Assessment context
  score NUMERIC NOT NULL,
  score_category TEXT NOT NULL,
  answers JSONB NOT NULL,
  metadata JSONB,
  
  -- AI Analysis Results (structured)
  overall_analysis TEXT NOT NULL,
  key_findings JSONB NOT NULL,
  pattern_detections JSONB,
  personalized_insights JSONB NOT NULL,
  protocol_recommendations JSONB NOT NULL,
  priority_actions JSONB NOT NULL,
  next_steps JSONB,
  
  -- AI Metadata
  ai_model TEXT NOT NULL,
  confidence_score NUMERIC,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  
  -- Caching & Versioning
  cache_key TEXT UNIQUE NOT NULL,
  answers_hash TEXT NOT NULL,
  expires_at TIMESTAMP,
  version INTEGER DEFAULT 1,
  
  -- Tracking
  viewed_at TIMESTAMP,
  applied_to_protocol BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_insights_user_assessment ON assessment_ai_insights(user_id, assessment_id);
CREATE INDEX idx_ai_insights_cache_key ON assessment_ai_insights(cache_key);
CREATE INDEX idx_ai_insights_expires ON assessment_ai_insights(expires_at);

-- Enable Row Level Security
ALTER TABLE assessment_ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI insights"
  ON assessment_ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
  ON assessment_ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI insights"
  ON assessment_ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_assessment_ai_insights_updated_at
  BEFORE UPDATE ON assessment_ai_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();