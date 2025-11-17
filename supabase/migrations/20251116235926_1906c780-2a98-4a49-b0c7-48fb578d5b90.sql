-- Create longevity_nutrition_assessments table
CREATE TABLE public.longevity_nutrition_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  
  -- Demographics (Screen 2)
  age INTEGER,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  
  -- Primary Goal (Screen 3)
  goal_primary TEXT CHECK (goal_primary IN (
    'longevity', 'gut-repair', 'menopause-support', 'fat-loss', 
    'muscle-gain', 'energy', 'cognitive-performance', 'skin-ageing'
  )),
  
  -- Activity (Screen 4)
  activity_level TEXT CHECK (activity_level IN (
    'sedentary', 'light', 'moderate', 'active', 'athletic'
  )),
  
  -- Eating Personality (Screen 5)
  nutrition_identity_type TEXT CHECK (nutrition_identity_type IN (
    'grazer', 'emotional-eater', 'under-eater', 'late-night-snacker',
    'over-scheduled-skipper', 'sugar-rollercoaster', 'high-protein-performer', 'gut-healer'
  )),
  
  -- Protein (Screen 6)
  protein_score INTEGER CHECK (protein_score >= 0 AND protein_score <= 4),
  protein_sources TEXT[],
  
  -- Fiber & Gut (Screen 7)
  plant_diversity_score INTEGER CHECK (plant_diversity_score >= 1 AND plant_diversity_score <= 4),
  fiber_score INTEGER CHECK (fiber_score >= 1 AND fiber_score <= 4),
  gut_symptom_score INTEGER CHECK (gut_symptom_score >= 0 AND gut_symptom_score <= 4),
  gut_symptoms TEXT[],
  
  -- Inflammation (Screen 8)
  inflammation_score INTEGER CHECK (inflammation_score >= 0 AND inflammation_score <= 6),
  inflammation_symptoms TEXT[],
  
  -- Chrono-Nutrition (Screen 9)
  first_meal_hour INTEGER,
  last_meal_hour INTEGER,
  eats_after_8pm BOOLEAN,
  chrononutrition_type TEXT,
  meal_timing_window INTEGER,
  
  -- Hormone Stage (Screen 10)
  menopause_stage TEXT CHECK (menopause_stage IN (
    'cycling', 'perimenopause', 'menopause', 'post-menopause', 'not-sure'
  )),
  
  -- Cravings (Screen 11)
  craving_pattern NUMERIC,
  craving_details JSONB,
  
  -- Hydration & Stimulants (Screen 12)
  hydration_score INTEGER CHECK (hydration_score >= 1 AND hydration_score <= 5),
  caffeine_score INTEGER CHECK (caffeine_score >= 0 AND caffeine_score <= 4),
  alcohol_intake INTEGER,
  
  -- Allergies & Dietary (Screen 13)
  allergies TEXT[],
  values_dietary TEXT[],
  
  -- Cooking (Screen 14)
  confidence_in_cooking INTEGER CHECK (confidence_in_cooking >= 1 AND confidence_in_cooking <= 5),
  food_preference_type TEXT,
  
  -- Metabolic Symptoms (Screen 15)
  metabolic_symptom_flags TEXT[],
  
  -- Calculated Score (Screen 16)
  longevity_nutrition_score NUMERIC,
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.longevity_nutrition_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own assessments"
  ON public.longevity_nutrition_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON public.longevity_nutrition_assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own assessments"
  ON public.longevity_nutrition_assessments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_longevity_nutrition_user_id ON public.longevity_nutrition_assessments(user_id);
CREATE INDEX idx_longevity_nutrition_session_id ON public.longevity_nutrition_assessments(session_id);

-- Create updated_at trigger
CREATE TRIGGER update_longevity_nutrition_assessments_updated_at
  BEFORE UPDATE ON public.longevity_nutrition_assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();