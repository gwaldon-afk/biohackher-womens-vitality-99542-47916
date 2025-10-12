import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, sessionId, userId } = await req.json();

    if (!question || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Question and sessionId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Fetch toolkit categories and items for context
    const { data: toolkitCategories } = await supabase
      .from('toolkit_categories')
      .select('name, description')
      .eq('is_active', true);

    const { data: toolkitItems } = await supabase
      .from('toolkit_items')
      .select('id, name, description, target_symptoms, category_id')
      .eq('is_active', true);

    // Create comprehensive system prompt
    const systemPrompt = `You are a women's health expert assistant for Biohackher, a science-backed women's longevity platform.

Your role is to:
- Provide evidence-based, empathetic answers about women's health
- Focus on the four pillars: Brain, Body, Balance, and Beauty
- Extract health concerns from questions and recommend relevant tools
- Always include a medical disclaimer to consult healthcare providers

Available toolkit categories: ${toolkitCategories?.map(c => c.name).join(', ') || 'supplements, therapies, nutrition, sleep, stress management'}

When responding, be warm, supportive, and science-based. Keep answers concise but helpful.

IMPORTANT: You must use the provided tool to structure your response with:
1. A clear, helpful answer to the user's question
2. Extracted health concerns/symptoms mentioned
3. Recommended toolkit items with relevance explanations
4. Suggested assessments if applicable
5. Optional follow-up questions`;

    // Call Lovable AI with tool calling
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
          { role: 'user', content: question }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_health_assistance',
              description: 'Provide structured health assistance response',
              parameters: {
                type: 'object',
                properties: {
                  answer: {
                    type: 'string',
                    description: 'The main answer to the user question including a medical disclaimer'
                  },
                  extracted_concerns: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of health concerns or symptoms mentioned'
                  },
                  recommended_toolkit_items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        relevance_reason: { type: 'string' }
                      }
                    },
                    description: 'Toolkit items that could help with mentioned concerns'
                  },
                  recommended_assessments: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Assessment types that would be helpful'
                  },
                  follow_up_questions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Suggested follow-up questions'
                  }
                },
                required: ['answer', 'extracted_concerns', 'recommended_toolkit_items']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_health_assistance' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: 'AI did not provide structured response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const structuredResponse = JSON.parse(toolCall.function.arguments);

    // Match toolkit items from AI recommendations with actual database items
    const recommendedTools = [];
    if (toolkitItems && structuredResponse.recommended_toolkit_items) {
      for (const aiRec of structuredResponse.recommended_toolkit_items) {
        const matchedItem = toolkitItems.find(item => 
          item.name.toLowerCase().includes(aiRec.name.toLowerCase()) ||
          aiRec.name.toLowerCase().includes(item.name.toLowerCase())
        );
        if (matchedItem) {
          recommendedTools.push({
            id: matchedItem.id,
            name: matchedItem.name,
            description: matchedItem.description,
            relevance_reason: aiRec.relevance_reason
          });
        }
      }
    }

    // Save to database
    const { error: dbError } = await supabase
      .from('health_questions')
      .insert({
        user_id: userId || null,
        session_id: sessionId,
        question,
        ai_answer: structuredResponse.answer,
        extracted_concerns: structuredResponse.extracted_concerns,
        recommended_tools: recommendedTools,
        recommended_assessments: structuredResponse.recommended_assessments || []
      });

    if (dbError) {
      console.error('Database error:', dbError);
      // Don't fail the request if saving fails
    }

    return new Response(
      JSON.stringify({
        answer: structuredResponse.answer,
        extracted_concerns: structuredResponse.extracted_concerns,
        recommended_tools: recommendedTools,
        recommended_assessments: structuredResponse.recommended_assessments || [],
        follow_up_questions: structuredResponse.follow_up_questions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Health assistant error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});