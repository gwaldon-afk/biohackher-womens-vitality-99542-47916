import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { goalId, triggerType } = await req.json();

    // Fetch goal data
    const { data: goal, error: goalError } = await supabase
      .from('user_health_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', user.id)
      .single();

    if (goalError || !goal) {
      throw new Error('Goal not found');
    }

    // Fetch recent check-ins
    const { data: checkIns, error: checkInsError } = await supabase
      .from('goal_check_ins')
      .select('*')
      .eq('goal_id', goalId)
      .order('check_in_date', { ascending: false })
      .limit(5);

    // Fetch energy loop data (if available)
    const { data: energyData } = await supabase
      .from('energy_loop_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    // Fetch recent LIS scores (if available)
    const { data: lisData } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(7);

    // Build context for AI
    const context = {
      goal: {
        title: goal.title,
        pillar: goal.pillar_category,
        status: goal.status,
        progress: goal.current_progress,
        createdDaysAgo: Math.floor((Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        checkInFrequency: goal.check_in_frequency,
      },
      checkIns: checkIns?.map(ci => ({
        date: ci.check_in_date,
        progress: ci.progress_percentage,
        confidence: ci.confidence_level,
        motivation: ci.motivation_level,
        whatsWorking: ci.whats_working,
        whatsNotWorking: ci.whats_not_working,
        barriers: ci.barriers_encountered,
      })),
      energyTrend: energyData?.map(e => ({
        date: e.date,
        score: e.composite_score,
        stress: e.stress_load_score,
      })),
      lisTrend: lisData?.map(l => ({
        date: l.date,
        score: l.longevity_impact_score,
        biologicalAge: l.biological_age_impact,
      })),
      triggerType,
    };

    const systemPrompt = `You are a health coach analyzing a user's longevity goal progress. Generate personalized insights based on their data.

Return insights in this JSON structure:
{
  "insights": [
    {
      "type": "progress|motivation|barrier|optimization|celebration",
      "title": "Brief title",
      "description": "2-3 sentences explaining the insight",
      "severity": "info|warning|celebration",
      "actionSuggestions": ["Specific action 1", "Specific action 2"]
    }
  ]
}

Guidelines:
- Focus on patterns, not single data points
- Be encouraging but honest
- Suggest concrete, actionable next steps
- Celebrate wins when progress is strong
- Identify barriers when progress stalls
- Connect energy/stress patterns to goal progress
- Keep insights concise and motivating`;

    const userPrompt = `Analyze this goal data and generate 1-3 insights:

${JSON.stringify(context, null, 2)}

Focus on:
1. Progress patterns (is user on track?)
2. Barriers mentioned repeatedly
3. Energy/stress correlation with progress
4. Motivation trends
5. What's working vs. not working

Trigger: ${triggerType}`;

    console.log('Calling Lovable AI for insights...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
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
            name: 'generate_insights',
            description: 'Generate goal insights',
            parameters: {
              type: 'object',
              properties: {
                insights: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', enum: ['progress', 'motivation', 'barrier', 'optimization', 'celebration'] },
                      title: { type: 'string' },
                      description: { type: 'string' },
                      severity: { type: 'string', enum: ['info', 'warning', 'celebration'] },
                      actionSuggestions: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['type', 'title', 'description', 'severity', 'actionSuggestions']
                  }
                }
              },
              required: ['insights']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'generate_insights' } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response:', JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const insightsData = JSON.parse(toolCall.function.arguments);
    const insights = insightsData.insights;

    // Insert insights into database
    const insightsToInsert = insights.map((insight: any) => ({
      user_id: user.id,
      goal_id: goalId,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      severity: insight.severity,
      action_suggestions: insight.actionSuggestions,
      trigger_data: { triggerType, timestamp: new Date().toISOString() },
    }));

    const { data: insertedInsights, error: insertError } = await supabase
      .from('goal_insights')
      .insert(insightsToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting insights:', insertError);
      throw insertError;
    }

    console.log(`Generated ${insertedInsights.length} insights for goal ${goalId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: insertedInsights,
        count: insertedInsights.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
