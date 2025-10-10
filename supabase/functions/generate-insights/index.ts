import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's recent data (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [dailyScoresResult, wearablesResult, symptomsResult, adherenceResult] = await Promise.all([
      supabaseClient
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      supabaseClient
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      supabaseClient
        .from('symptom_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('tracked_date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('tracked_date', { ascending: false }),
      
      supabaseClient
        .from('protocol_adherence')
        .select('*, protocol_items(*)')
        .eq('user_id', user.id)
        .gte('date', fourteenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
    ]);

    const dailyScores = dailyScoresResult.data || [];
    const wearables = wearablesResult.data || [];
    const symptoms = symptomsResult.data || [];
    const adherence = adherenceResult.data || [];

    // Prepare data summary for AI
    const dataSummary = {
      dailyScores: {
        count: dailyScores.length,
        avgSleepScore: dailyScores.reduce((sum, d) => sum + (d.sleep_score || 0), 0) / (dailyScores.length || 1),
        avgStressScore: dailyScores.reduce((sum, d) => sum + (d.stress_score || 0), 0) / (dailyScores.length || 1),
        avgActivityScore: dailyScores.reduce((sum, d) => sum + (d.physical_activity_score || 0), 0) / (dailyScores.length || 1),
        avgNutritionScore: dailyScores.reduce((sum, d) => sum + (d.nutrition_score || 0), 0) / (dailyScores.length || 1),
        avgLongevityScore: dailyScores.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / (dailyScores.length || 1),
        recent: dailyScores.slice(0, 7)
      },
      wearables: {
        count: wearables.length,
        avgSleepHours: wearables.reduce((sum, w) => sum + (w.sleep_duration_hours || 0), 0) / (wearables.length || 1),
        avgHRV: wearables.reduce((sum, w) => sum + (w.hrv_ms || 0), 0) / (wearables.length || 1),
        avgSteps: wearables.reduce((sum, w) => sum + (w.steps || 0), 0) / (wearables.length || 1),
        recent: wearables.slice(0, 7)
      },
      symptoms: {
        count: symptoms.length,
        types: [...new Set(symptoms.map(s => s.symptom_id))],
        avgSeverity: symptoms.reduce((sum, s) => sum + (s.severity || 0), 0) / (symptoms.length || 1)
      },
      adherence: {
        count: adherence.length,
        completionRate: adherence.filter(a => a.completed).length / (adherence.length || 1) * 100
      }
    };

    // Generate insights using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are a health insights analyst. Analyze the following health data and generate 3-5 actionable insights:

Data Summary:
- Daily Scores (last 14 days): ${dataSummary.dailyScores.count} entries
  * Avg Sleep Score: ${dataSummary.dailyScores.avgSleepScore.toFixed(1)}/100
  * Avg Stress Score: ${dataSummary.dailyScores.avgStressScore.toFixed(1)}/100
  * Avg Activity Score: ${dataSummary.dailyScores.avgActivityScore.toFixed(1)}/100
  * Avg Nutrition Score: ${dataSummary.dailyScores.avgNutritionScore.toFixed(1)}/100
  * Avg Longevity Score: ${dataSummary.dailyScores.avgLongevityScore.toFixed(1)}/100

- Wearable Data: ${dataSummary.wearables.count} entries
  * Avg Sleep: ${dataSummary.wearables.avgSleepHours.toFixed(1)} hours
  * Avg HRV: ${dataSummary.wearables.avgHRV.toFixed(0)} ms
  * Avg Steps: ${dataSummary.wearables.avgSteps.toFixed(0)}

- Symptoms: ${dataSummary.symptoms.count} tracked, types: ${dataSummary.symptoms.types.join(', ')}
- Protocol Adherence: ${dataSummary.adherence.completionRate.toFixed(0)}%

Generate insights in this exact JSON format (no markdown, just raw JSON):
{
  "insights": [
    {
      "type": "trend_analysis|anomaly_detected|protocol_suggestion|weekly_summary",
      "category": "sleep|stress|activity|nutrition|overall",
      "title": "Clear, action-oriented title",
      "description": "2-3 sentences explaining the insight",
      "recommendations": ["Specific action 1", "Specific action 2"],
      "priority": "low|medium|high|urgent"
    }
  ]
}

Focus on:
1. Patterns and trends in the data
2. Correlations between different metrics
3. Areas that need immediate attention
4. Positive changes to acknowledge
5. Specific, actionable recommendations`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a health data analyst. Always respond with valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse the JSON response (remove markdown code blocks if present)
    let parsedContent;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedContent = JSON.parse(cleanContent);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    // Store insights in database
    const insightsToStore = parsedContent.insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      category: insight.category,
      title: insight.title,
      description: insight.description,
      recommendations: insight.recommendations,
      priority: insight.priority,
      data_points: {
        dailyScores: dataSummary.dailyScores.recent,
        wearables: dataSummary.wearables.recent,
        symptoms: dataSummary.symptoms,
        adherence: dataSummary.adherence
      }
    }));

    const { data: insertedInsights, error: insertError } = await supabaseClient
      .from('user_insights')
      .insert(insightsToStore)
      .select();

    if (insertError) {
      console.error('Error storing insights:', insertError);
      throw insertError;
    }

    console.log(`Generated ${insertedInsights?.length || 0} insights for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights: insertedInsights,
        message: `Generated ${insertedInsights?.length || 0} new insights` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
