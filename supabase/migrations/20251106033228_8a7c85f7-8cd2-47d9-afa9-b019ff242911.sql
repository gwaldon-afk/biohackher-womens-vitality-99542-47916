-- Create custom meal plans table for AI-generated meal plans
CREATE TABLE IF NOT EXISTS custom_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  meal_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE custom_meal_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own custom meal plans"
ON custom_meal_plans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom meal plans"
ON custom_meal_plans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom meal plans"
ON custom_meal_plans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom meal plans"
ON custom_meal_plans
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_meal_plans_user_id ON custom_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_meal_plans_is_active ON custom_meal_plans(user_id, is_active);