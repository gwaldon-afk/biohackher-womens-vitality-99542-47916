-- Create nutrition preferences table
CREATE TABLE public.nutrition_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight NUMERIC,
  activity_level TEXT,
  fitness_goal TEXT,
  allergies TEXT[],
  dislikes TEXT[],
  selected_recipe_style TEXT DEFAULT 'simple',
  selected_breakfast_recipe TEXT,
  selected_lunch_recipe TEXT,
  selected_dinner_recipe TEXT,
  is_low_fodmap BOOLEAN DEFAULT false,
  has_ibs BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.nutrition_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own nutrition preferences" 
ON public.nutrition_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nutrition preferences" 
ON public.nutrition_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutrition preferences" 
ON public.nutrition_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_nutrition_preferences_updated_at
BEFORE UPDATE ON public.nutrition_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();