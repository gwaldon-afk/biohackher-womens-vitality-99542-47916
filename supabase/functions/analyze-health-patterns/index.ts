import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Assessment {
  symptom_type: string;
  overall_score: number;
  score_category: string;
  primary_issues: string[];
  completed_at: string;
}

interface AnalysisRequest {
  assessments: Assessment[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { assessments } = await req.json() as AnalysisRequest;

    if (!assessments || assessments.length < 2) {
      throw new Error('At least 2 assessments required for progressive analysis');
    }

    // Create assessment summary for AI
    const assessmentSummary = assessments.map(a => 
      `${a.symptom_type}: Score ${a.overall_score}/100 (${a.score_category}), Primary issues: ${a.primary_issues.join(', ')}`
    ).join('\n');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a health analysis AI specializing in women's health. Analyze symptom assessments and provide comprehensive insights.

IMPORTANT: Return ONLY valid JSON matching the exact structure specified in the tool. No additional text.`;

    const userPrompt = `Analyze these symptom assessments and provide comprehensive health insights:

${assessmentSummary}

Provide:
1. Overall wellness score (0-100) - weighted average considering all symptoms
2. Category breakdown scores (0-100 each):
   - energy_sleep: energy-levels, sleep, fatigue symptoms
   - cognitive: brain-fog, memory-issues, focus symptoms
   - emotional: anxiety, mood, stress symptoms
   - physical: joint-pain, mobility, pain symptoms
   - hormonal: hot-flashes, night-sweats, periods symptoms
   - digestive: gut, bloating symptoms
3. Detected patterns (2-4 patterns connecting symptoms)
4. Top 3 priority actions (most impactful interventions)
5. Next assessment recommendation based on gaps in data`;

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_health_analysis',
              description: 'Provide comprehensive health analysis based on symptom assessments',
              parameters: {
                type: 'object',
                properties: {
                  overallScore: {
                    type: 'number',
                    description: 'Overall wellness score from 0-100'
                  },
                  categoryScores: {
                    type: 'object',
                    properties: {
                      energy_sleep: { type: 'number' },
                      cognitive: { type: 'number' },
                      emotional: { type: 'number' },
                      physical: { type: 'number' },
                      hormonal: { type: 'number' },
                      digestive: { type: 'number' }
                    },
                    required: ['energy_sleep', 'cognitive', 'emotional', 'physical', 'hormonal', 'digestive']
                  },
                  patterns: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        affectedSymptoms: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                        severity: {
                          type: 'string',
                          enum: ['high', 'medium', 'low']
                        }
                      },
                      required: ['title', 'description', 'affectedSymptoms', 'severity']
                    }
                  },
                  priorityActions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        impact: {
                          type: 'string',
                          enum: ['high', 'medium']
                        }
                      },
                      required: ['title', 'description', 'impact']
                    }
                  },
                  nextAssessmentSuggestion: {
                    type: 'object',
                    properties: {
                      symptomId: { type: 'string' },
                      reason: { type: 'string' }
                    },
                    required: ['symptomId', 'reason']
                  }
                },
                required: ['overallScore', 'categoryScores', 'patterns', 'priorityActions', 'nextAssessmentSuggestion']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'provide_health_analysis' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI service quota exceeded. Please contact support.');
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI analysis failed');
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No analysis generated');
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-health-patterns:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
