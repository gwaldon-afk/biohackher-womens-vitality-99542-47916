import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      goalDescription, 
      pillar, 
      userProfile, 
      assessmentData,
      currentGoal,
      refinementRequest,
      conversationHistory,
      stage = 'expand' // 'reframe' or 'expand'
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Get user's auth token to fetch profile data
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Build context for AI
    const isRefinement = !!refinementRequest && !!currentGoal;
    const isReframe = stage === 'reframe';
    
    const contextPrompt = isReframe ? `
You want to create a health goal: "${goalDescription}"
${pillar ? `Suggested Health Pillar: ${pillar}` : 'Please analyze and determine which health pillar(s) this goal relates to'}
${userProfile ? `Your Profile: ${JSON.stringify(userProfile)}` : ''}

TASK: Reframe this goal using the HACK Protocol framework for you to review and accept.

Return a simplified JSON structure with:
{
  "title": "Clear, actionable goal title (1 sentence)",
  "description": "2-3 sentence explanation of what this goal means in HACK terms, written directly to you",
  "pillar": "brain|body|balance|beauty (choose the PRIMARY pillar)",
  "healthspanTarget": "Brief target outcome statement for you"
}

Keep it concise - this is just for you to approve the basic reframing before generating the full detailed plan.` : isRefinement ? `
You want to refine your existing health goal following the HACK Protocol framework.

CURRENT GOAL (HACK Structure):
${JSON.stringify(currentGoal, null, 2)}

YOUR REFINEMENT REQUEST:
"${refinementRequest}"

${conversationHistory ? `CONVERSATION HISTORY:\n${conversationHistory.map((m: any) => `${m.role}: ${m.content}`).join('\n')}` : ''}

Please update the goal plan based on your request while maintaining the HACK Protocol structure:
- H (Healthspan Target): Keep specific and measurable for you
- A (Aging Blueprint): Update interventions as requested while maintaining evidence-based reasoning
- C (Check-in Frequency): Adjust if requested
- K (Knowledge of Barriers): Update barriers/solutions as needed

Make sure the changes are clear and maintain the quality of the plan.` : `
You want to create a health goal: "${goalDescription}"
${pillar ? `Suggested Health Pillar: ${pillar} (please analyze if this is correct or if other pillars are more relevant)` : 'Please analyze and determine which health pillar(s) this goal relates to'}
${userProfile ? `Your Profile: ${JSON.stringify(userProfile)}` : ''}
${assessmentData ? `Your Recent Assessment Data: ${JSON.stringify(assessmentData)}` : ''}

Generate a comprehensive, personalized health goal plan using the HACK Protocol framework:

**H - Healthspan Target:** A specific, measurable outcome for you within 30-90 days
**A - Aging Blueprint:** 3-5 evidence-based interventions with clear reasoning for you
**C - Check-in Frequency:** Appropriate review cadence for you (daily/weekly/biweekly)
**K - Knowledge of Barriers:** Common obstacles you might face and practical solutions

For each intervention in the Aging Blueprint (A), provide:
- The specific action/item for you
- Why it's recommended for you (scientific reasoning)
- How it relates to your goal
- Any important considerations for you

Return the response in this exact JSON structure:
{
  "title": "Goal title",
  "pillar_category": "brain|body|balance|beauty",
  "related_pillars": ["array of all pillars this goal impacts"],
  "pillar_analysis": "Detailed explanation of which pillars are affected and how this goal relates to each one for you",
  "healthspan_target": {
    "metric": "what you will measure",
    "target_value": "your specific target",
    "timeframe_days": 60,
    "reasoning": "why this target makes sense for you"
  },
  "interventions": [
    {
      "name": "Intervention name",
      "type": "supplement|lifestyle|practice|nutrition",
      "dosage": "specific dosage/frequency for you",
      "reasoning": "why this helps you",
      "timing": "when you should do it",
      "priority": "high|medium|low"
    }
  ],
  "barriers_plan": {
    "common_barriers": ["barrier1 you might face", "barrier2 you might face"],
    "solutions": ["solution1 for you", "solution2 for you"],
    "support_needed": "what kind of support helps you"
  },
  "check_in_frequency": "daily|weekly|biweekly",
  "biological_age_impact_predicted": -0.5,
  "ai_reasoning": "Overall explanation of the plan and why it's personalized for you"
}
`;

    // Call Lovable AI
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
            content: `You are an expert health coach specializing in personalized longevity and wellness planning using the HACK Protocol framework.

HACK Protocol Framework:
- H (Healthspan Target): A specific, measurable health outcome the user wants to achieve within a defined timeframe (typically 30-90 days). This should be concrete and trackable.
- A (Aging Blueprint): The evidence-based interventions and actions that will help achieve the healthspan target. Include 3-5 interventions with scientific reasoning, proper dosing, and timing.
- C (Check-in Frequency): How often the user should review progress and adjust their approach (daily, weekly, or biweekly based on goal complexity).
- K (Knowledge of Barriers): Common obstacles that might prevent success and practical solutions to overcome them.

Health Pillars:
- Body: Physical health, fitness, strength, mobility, cardiovascular health
- Brain: Cognitive function, mental clarity, focus, memory, neuroplasticity
- Balance: Hormonal health, metabolic health, stress management, sleep, recovery
- Beauty: Skin health, aging appearance, cellular health, aesthetic wellness

When generating or refining goals:
1. ALWAYS maintain the HACK structure
2. AUTOMATICALLY DETECT AND ASSIGN the primary pillar based on the goal description
3. ANALYZE and list ALL related pillars (a goal can impact multiple pillars)
4. Provide detailed pillar_analysis explaining which pillars are affected and how
5. If a suggested pillar is provided, verify if it's correct or suggest a better fit
6. Ensure the Healthspan target (H) is specific and measurable
7. Provide evidence-based Aging blueprint interventions (A) with clear reasoning
8. Set appropriate Check-in frequency (C) based on the goal's nature
9. Identify realistic barriers and solutions (K)
10. When users request clarification, explain which pillars are affected and why
11. When users request changes, preserve the HACK framework while incorporating their feedback

CRITICAL: If a goal seems broad or unclear, NEVER just say "this is too broad" or reject it. Instead:
- Make an intelligent interpretation of what the user likely means
- Reframe it into something specific and actionable
- If multiple interpretations are possible, choose the most common/beneficial one
- Focus on creating a practical, evidence-based plan they can actually follow

For reframe requests: Return simplified JSON with just title, description, pillar, and healthspanTarget.
For full plans: Return complete JSON with all HACK elements.

Always respond with valid JSON only, no markdown formatting.`
          },
          { role: 'user', content: contextPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limits exceeded, please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add funds to your Lovable AI workspace.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse the JSON response
    let goalSuggestion;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      goalSuggestion = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', aiResponse);
      throw new Error('Failed to parse AI suggestion');
    }

    return new Response(
      JSON.stringify({ suggestion: goalSuggestion }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in generate-goal-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
