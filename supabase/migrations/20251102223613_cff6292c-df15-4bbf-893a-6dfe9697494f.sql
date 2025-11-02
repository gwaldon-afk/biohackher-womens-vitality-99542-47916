-- Add meal plan template support to protocol_items
ALTER TABLE protocol_items 
ADD COLUMN meal_template_id TEXT,
ADD COLUMN recipe_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN protocol_items.meal_template_id IS 'References a meal plan template ID from mealTemplates data';
COMMENT ON COLUMN protocol_items.recipe_data IS 'Stores detailed recipe information for diet items including ingredients and instructions';