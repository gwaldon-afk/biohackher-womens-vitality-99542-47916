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
      .select('id, name, description, slug')
      .eq('is_active', true);

    const { data: toolkitItems } = await supabase
      .from('toolkit_items')
      .select('id, name, description, target_symptoms, category_id, evidence_level, benefits')
      .eq('is_active', true);

    const { data: assessments } = await supabase
      .from('assessments')
      .select('id, name, description, pillar')
      .limit(20);

    // Create comprehensive system prompt
    const systemPrompt = `You are a women's health expert assistant for Biohackher, a science-backed women's longevity platform.

Your role is to:
- Provide evidence-based, empathetic answers about women's health (2-3 sentences)
- Focus on the four pillars: Brain, Body, Balance, and Beauty
- ALWAYS recommend 2-4 specific toolkit items that can help (from our available items below)
- ALWAYS recommend 1-2 relevant assessments they should take (ONLY from our available assessments below)
- Mention clinical tests they could discuss with their healthcare provider separately
- Encourage them to explore these tools and assessments in the app
- Include a medical disclaimer to consult healthcare providers

IMPORTANT - ONLY recommend from these available assessments:
${assessments?.map(a => `- ${a.name} (${a.pillar} pillar): ${a.description}`).join('\n') || 'No assessments available'}

Available toolkit categories: ${toolkitCategories?.map(c => c.name).join(', ') || 'supplements, therapies, nutrition, sleep, stress management'}

Available toolkit items include: ${toolkitItems?.slice(0, 30).map(t => t.name).join(', ')}

When responding:
1. Give a warm, helpful answer (2-3 sentences)
2. ALWAYS recommend specific toolkit items from our available items (match exact names)
3. ALWAYS suggest assessments to help them track progress (ONLY from the list above)
4. If relevant, mention clinical tests they could discuss with their doctor (e.g., hormone panels, vitamin levels)
5. Suggest follow-up questions the USER might want to ask next (not clarification questions from you)

Follow-up questions should be:
- Related health topics they might explore
- Different aspects of their concern
- Examples: "How can I improve my sleep naturally?", "What supplements support hormone balance?", "How does stress affect aging?"

CRITICAL: Only recommend assessments that are in the available assessments list above. Do not make up assessment names.`;

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
                    description: 'Assessment names from Biohackher platform that would be helpful (ONLY use exact names from available assessments list)'
                  },
                  clinical_tests: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional clinical tests they could discuss with their healthcare provider (e.g., hormone panels, vitamin D levels)'
                  },
                  follow_up_questions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Suggested questions the USER might want to ask next (not clarification questions from the assistant)'
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
          // Find category for this item
          const category = toolkitCategories?.find(c => c.id === matchedItem.category_id);
          recommendedTools.push({
            id: matchedItem.id,
            name: matchedItem.name,
            description: matchedItem.description,
            relevance_reason: aiRec.relevance_reason,
            evidence_level: matchedItem.evidence_level,
            benefits: matchedItem.benefits,
            category_slug: category?.slug || 'biohacking-toolkit'
          });
        }
      }
    }

    // Match assessments
    const recommendedAssessments = [];
    if (assessments && structuredResponse.recommended_assessments) {
      for (const aiAssessment of structuredResponse.recommended_assessments) {
        const matchedAssessment = assessments.find(a => 
          a.name.toLowerCase().includes(aiAssessment.toLowerCase()) ||
          aiAssessment.toLowerCase().includes(a.name.toLowerCase())
        );
        if (matchedAssessment) {
          recommendedAssessments.push({
            id: matchedAssessment.id,
            name: matchedAssessment.name,
            description: matchedAssessment.description,
            pillar: matchedAssessment.pillar
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
        recommended_assessments: {
          assessments: recommendedAssessments,
          clinical_tests: structuredResponse.clinical_tests || []
        }
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
        recommended_assessments: recommendedAssessments,
        clinical_tests: structuredResponse.clinical_tests || [],
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