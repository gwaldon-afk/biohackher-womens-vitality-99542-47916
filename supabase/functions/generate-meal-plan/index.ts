import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MealPlanRequest {
  weight: number;
  activityLevel: string;
  fitnessGoal: string;
  allergies: string[];
  dislikes: string[];
  isLowFODMAP: boolean;
  hasIBS: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  recipeStyle: string;
}

interface MealNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface MealIngredient {
  name: string;
  amount: string;
  unit: string;
}

interface Meal {
  name: string;
  description: string;
  ingredients: MealIngredient[];
  instructions: string;
  nutrition: MealNutrition;
}

interface DayPlan {
  day: string;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const requestData: MealPlanRequest = await req.json();
    console.log('Generating meal plan for:', requestData);

    const systemPrompt = `You are a certified nutritionist generating personalized meal plans. Create delicious, practical, and nutritionally complete meals.

CRITICAL RULES:
1. NEVER include ANY of these excluded items: ${requestData.allergies.concat(requestData.dislikes).join(', ')}
2. ${requestData.isLowFODMAP ? 'ALL meals MUST be low-FODMAP compliant. Avoid onions, garlic, wheat, beans, high-lactose dairy.' : ''}
3. ${requestData.hasIBS ? 'Meals must be gentle on digestion. Avoid spicy, fatty, or gas-producing foods.' : ''}
4. Each meal must include: protein source, complex carbs, vegetables, healthy fats
5. Maximum portions: 300g eggs, 250g other proteins, 200g carbs per meal
6. Instructions must be clear, simple, and reference only listed ingredients
7. Prioritize ${requestData.recipeStyle} cooking style
8. Ensure variety across the week - don't repeat the same meal twice`;

    const userPrompt = `Generate a 7-day meal plan with these specifications:

DAILY TARGETS:
- Calories: ${requestData.calories} kcal
- Protein: ${requestData.protein}g  
- Carbs: ${requestData.carbs}g
- Fat: ${requestData.fat}g

USER PROFILE:
- Weight: ${requestData.weight}kg
- Activity Level: ${requestData.activityLevel}
- Fitness Goal: ${requestData.fitnessGoal}

MEAL DISTRIBUTION:
- Breakfast: 25% protein, 30% carbs, 25% fat (lighter meal)
- Lunch: 35% protein, 35% carbs, 35% fat (balanced meal)
- Dinner: 40% protein, 35% carbs, 40% fat (larger meal)

Create meals that are delicious, culturally diverse, and practical to prepare.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'generate_meal_plan',
            description: 'Generate a 7-day nutritionally complete meal plan',
            parameters: {
              type: 'object',
              properties: {
                days: {
                  type: 'array',
                  description: 'Array of 7 daily meal plans',
                  items: {
                    type: 'object',
                    properties: {
                      day: { 
                        type: 'string',
                        description: 'Day name (Monday, Tuesday, etc.)'
                      },
                      breakfast: {
                        type: 'object',
                        properties: {
                          name: { type: 'string', description: 'Meal name' },
                          description: { type: 'string', description: 'Brief description' },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string' },
                                amount: { type: 'string' },
                                unit: { type: 'string' }
                              },
                              required: ['name', 'amount', 'unit']
                            }
                          },
                          instructions: { type: 'string', description: 'Step-by-step cooking instructions' },
                          nutrition: {
                            type: 'object',
                            properties: {
                              calories: { type: 'number' },
                              protein: { type: 'number' },
                              carbs: { type: 'number' },
                              fat: { type: 'number' },
                              fiber: { type: 'number' }
                            },
                            required: ['calories', 'protein', 'carbs', 'fat', 'fiber']
                          }
                        },
                        required: ['name', 'description', 'ingredients', 'instructions', 'nutrition']
                      },
                      lunch: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          description: { type: 'string' },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string' },
                                amount: { type: 'string' },
                                unit: { type: 'string' }
                              },
                              required: ['name', 'amount', 'unit']
                            }
                          },
                          instructions: { type: 'string' },
                          nutrition: {
                            type: 'object',
                            properties: {
                              calories: { type: 'number' },
                              protein: { type: 'number' },
                              carbs: { type: 'number' },
                              fat: { type: 'number' },
                              fiber: { type: 'number' }
                            },
                            required: ['calories', 'protein', 'carbs', 'fat', 'fiber']
                          }
                        },
                        required: ['name', 'description', 'ingredients', 'instructions', 'nutrition']
                      },
                      dinner: {
                        type: 'object',
                        properties: {
                          name: { type: 'string' },
                          description: { type: 'string' },
                          ingredients: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                name: { type: 'string' },
                                amount: { type: 'string' },
                                unit: { type: 'string' }
                              },
                              required: ['name', 'amount', 'unit']
                            }
                          },
                          instructions: { type: 'string' },
                          nutrition: {
                            type: 'object',
                            properties: {
                              calories: { type: 'number' },
                              protein: { type: 'number' },
                              carbs: { type: 'number' },
                              fat: { type: 'number' },
                              fiber: { type: 'number' }
                            },
                            required: ['calories', 'protein', 'carbs', 'fat', 'fiber']
                          }
                        },
                        required: ['name', 'description', 'ingredients', 'instructions', 'nutrition']
                      }
                    },
                    required: ['day', 'breakfast', 'lunch', 'dinner']
                  }
                }
              },
              required: ['days']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_meal_plan' } }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limits exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('AI Response:', JSON.stringify(aiResponse, null, 2));

    // Extract the meal plan from tool calls
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'generate_meal_plan') {
      throw new Error('AI did not return meal plan in expected format');
    }

    const mealPlan = JSON.parse(toolCall.function.arguments);
    
    // Validate the meal plan
    const validation = validateMealPlan(mealPlan, requestData);
    if (!validation.isValid) {
      console.error('Meal plan validation failed:', validation.errors);
      return new Response(JSON.stringify({ 
        error: 'Generated meal plan failed validation',
        details: validation.errors,
        fallbackRequired: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Meal plan generated and validated successfully');
    return new Response(JSON.stringify({ 
      mealPlan: mealPlan.days,
      generatedBy: 'ai',
      validated: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating meal plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      fallbackRequired: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function validateMealPlan(mealPlan: any, request: MealPlanRequest): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!mealPlan.days || !Array.isArray(mealPlan.days) || mealPlan.days.length !== 7) {
    errors.push('Meal plan must contain exactly 7 days');
    return { isValid: false, errors };
  }

  const excludedItems = [...request.allergies, ...request.dislikes].map(item => item.toLowerCase());

  mealPlan.days.forEach((day: DayPlan, index: number) => {
    if (!day.breakfast || !day.lunch || !day.dinner) {
      errors.push(`Day ${index + 1}: Missing meals`);
      return;
    }

    [day.breakfast, day.lunch, day.dinner].forEach((meal: Meal, mealIndex: number) => {
      const mealType = ['breakfast', 'lunch', 'dinner'][mealIndex];
      
      // Check for excluded ingredients
      meal.ingredients?.forEach((ing: MealIngredient) => {
        if (excludedItems.some(excluded => ing.name.toLowerCase().includes(excluded))) {
          errors.push(`Day ${index + 1} ${mealType}: Contains excluded ingredient "${ing.name}"`);
        }
      });

      // Check nutritional minimums
      if (meal.nutrition) {
        if (meal.nutrition.protein < 15) {
          errors.push(`Day ${index + 1} ${mealType}: Protein too low (${meal.nutrition.protein}g)`);
        }
        if (meal.nutrition.fiber < 3) {
          errors.push(`Day ${index + 1} ${mealType}: Fiber too low (${meal.nutrition.fiber}g)`);
        }
      } else {
        errors.push(`Day ${index + 1} ${mealType}: Missing nutrition data`);
      }

      // Check instructions reference ingredients
      if (meal.instructions && meal.ingredients) {
        const hasIngredientMismatch = meal.ingredients.some((ing: MealIngredient) => 
          !meal.instructions.toLowerCase().includes(ing.name.toLowerCase().split(' ')[0])
        );
        if (hasIngredientMismatch) {
          errors.push(`Day ${index + 1} ${mealType}: Instructions may not match ingredients`);
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
