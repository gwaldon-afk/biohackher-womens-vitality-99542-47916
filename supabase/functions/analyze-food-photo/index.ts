import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodAnalysisResult {
  food_items: string[];
  calories_estimated: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fibre_g: number;
  serving_size_estimate: string;
  confidence_score: number;
  meal_description: string;
  health_notes: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mealType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing food photo for meal type:', mealType);

    // Use Lovable AI with Gemini 2.5 Flash for vision analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional nutritionist AI that analyzes food photos to extract nutritional information. 
            
            Analyze the food image and provide accurate nutritional estimates. Be conservative with estimates - it's better to slightly underestimate than overestimate.
            
            Consider portion sizes visible in the image. If unsure about exact amounts, provide reasonable estimates based on typical serving sizes.
            
            Always identify all visible food items and calculate combined nutritional values for the entire meal.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${mealType || 'meal'} photo and extract nutritional information. Identify all food items, estimate portion sizes, and calculate total nutritional values.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'extract_nutrition',
              description: 'Extract nutritional information from the analyzed food photo',
              parameters: {
                type: 'object',
                properties: {
                  food_items: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of identified food items in the image'
                  },
                  calories_estimated: {
                    type: 'number',
                    description: 'Total estimated calories for the meal'
                  },
                  protein_g: {
                    type: 'number',
                    description: 'Total estimated protein in grams'
                  },
                  carbs_g: {
                    type: 'number',
                    description: 'Total estimated carbohydrates in grams'
                  },
                  fats_g: {
                    type: 'number',
                    description: 'Total estimated fats in grams'
                  },
                  fibre_g: {
                    type: 'number',
                    description: 'Total estimated fibre in grams'
                  },
                  serving_size_estimate: {
                    type: 'string',
                    description: 'Estimated serving size description (e.g., "1 medium plate", "large bowl")'
                  },
                  confidence_score: {
                    type: 'number',
                    description: 'Confidence score from 0 to 1 indicating how confident the analysis is'
                  },
                  meal_description: {
                    type: 'string',
                    description: 'Brief description of the meal'
                  },
                  health_notes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Brief health notes about the meal (e.g., "Good protein source", "High in fibre", "Consider adding vegetables")'
                  }
                },
                required: ['food_items', 'calories_estimated', 'protein_g', 'carbs_g', 'fats_g', 'fibre_g', 'serving_size_estimate', 'confidence_score', 'meal_description', 'health_notes'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'extract_nutrition' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'extract_nutrition') {
      console.error('Unexpected AI response format:', data);
      return new Response(
        JSON.stringify({ error: 'Unable to analyze the image. Please try with a clearer photo.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisResult: FoodAnalysisResult = JSON.parse(toolCall.function.arguments);
    console.log('Analysis result:', analysisResult);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis: analysisResult 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-food-photo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
