import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    console.log('Generating energy insights for user:', user.id);

    // Fetch energy assessment data
    const { data: energyAssessments, error: assessmentError } = await supabaseClient
      .from('symptom_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('symptom_type', 'energy-levels')
      .order('completed_at', { ascending: false })
      .limit(5);

    if (assessmentError) throw assessmentError;

    // Fetch recent energy check-ins
    const { data: checkIns, error: checkInsError } = await supabaseClient
      .from('energy_check_ins')
      .select('*')
      .eq('user_id', user.id)
      .gte('check_in_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('check_in_date', { ascending: false });

    if (checkInsError) throw checkInsError;

    // Fetch protocol adherence
    const { data: completions, error: completionsError } = await supabaseClient
      .from('protocol_completions')
      .select('*')
      .eq('user_id', user.id)
      .gte('completion_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('completion_date', { ascending: false });

    if (completionsError) throw completionsError;

    // Fetch daily LIS scores
    const { data: lisScores, error: lisError } = await supabaseClient
      .from('daily_scores')
      .select('date, longevity_impact_score, sleep_score, stress_score, physical_activity_score')
      .eq('user_id', user.id)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (lisError) throw lisError;

    // Generate insights
    const insights = [];

    // 1. Energy Trend Analysis
    if (energyAssessments && energyAssessments.length >= 2) {
      const latest = energyAssessments[0].overall_score;
      const previous = energyAssessments[1].overall_score;
      const change = latest - previous;

      if (change < -10) {
        insights.push({
          type: 'energy_declining',
          title: 'Energy Levels Declining',
          description: `Your energy score has dropped by ${Math.abs(change).toFixed(0)} points since your last assessment.`,
          severity: 'high',
          action_suggestions: [
            { action: 'Review sleep quality', priority: 'high' },
            { action: 'Check supplement adherence', priority: 'high' },
            { action: 'Schedule rest day', priority: 'medium' }
          ]
        });
      } else if (change > 10) {
        insights.push({
          type: 'energy_improving',
          title: 'Energy Levels Improving!',
          description: `Great progress! Your energy score has increased by ${change.toFixed(0)} points.`,
          severity: 'info',
          action_suggestions: [
            { action: 'Continue current protocol', priority: 'high' },
            { action: 'Document what\'s working', priority: 'medium' }
          ]
        });
      }
    }

    // 2. Protocol Adherence Correlation
    if (checkIns && completions) {
      const adherenceRate = completions.length > 0 
        ? (completions.filter(c => c.completed).length / completions.length) * 100 
        : 0;
      
      const avgEnergyRating = checkIns.length > 0
        ? checkIns.reduce((sum, c) => sum + (c.energy_rating || 0), 0) / checkIns.length
        : 0;

      if (adherenceRate < 60 && avgEnergyRating < 6) {
        insights.push({
          type: 'low_adherence_low_energy',
          title: 'Protocol Adherence May Be Affecting Energy',
          description: `Your protocol adherence is at ${adherenceRate.toFixed(0)}% and energy levels are low. Consistency may help.`,
          severity: 'medium',
          action_suggestions: [
            { action: 'Set daily protocol reminders', priority: 'high' },
            { action: 'Start with 1-2 key supplements', priority: 'high' },
            { action: 'Track energy after protocol completion', priority: 'medium' }
          ]
        });
      }
    }

    // 3. Sleep-Energy Correlation
    if (lisScores && checkIns) {
      const recentScores = lisScores.slice(0, 7);
      const avgSleepScore = recentScores.reduce((sum, s) => sum + (s.sleep_score || 0), 0) / recentScores.length;
      const avgEnergyRating = checkIns.slice(0, 7).reduce((sum, c) => sum + (c.energy_rating || 0), 0) / Math.min(checkIns.length, 7);

      if (avgSleepScore < 60 && avgEnergyRating < 6) {
        insights.push({
          type: 'sleep_energy_link',
          title: 'Sleep Quality Impacting Energy',
          description: 'Your low energy correlates with poor sleep scores over the past week.',
          severity: 'high',
          action_suggestions: [
            { action: 'Prioritize sleep routine', priority: 'high' },
            { action: 'Review sleep supplements', priority: 'high' },
            { action: 'Reduce evening screen time', priority: 'medium' }
          ]
        });
      }
    }

    // 4. Chronic Fatigue Risk
    if (energyAssessments && energyAssessments.length > 0) {
      const latest = energyAssessments[0];
      if (latest.overall_score < 40) {
        insights.push({
          type: 'chronic_fatigue_risk',
          title: 'Chronic Fatigue Risk Detected',
          description: 'Your energy score is critically low. Consider consulting with a healthcare provider.',
          severity: 'high',
          action_suggestions: [
            { action: 'Schedule healthcare consultation', priority: 'high' },
            { action: 'Complete full blood panel', priority: 'high' },
            { action: 'Review medication side effects', priority: 'medium' }
          ]
        });
      }
    }

    // 5. Consistency Pattern
    if (checkIns && checkIns.length >= 7) {
      const variance = calculateVariance(checkIns.slice(0, 7).map(c => c.energy_rating || 0));
      
      if (variance > 4) {
        insights.push({
          type: 'high_energy_variability',
          title: 'High Energy Variability Detected',
          description: 'Your energy levels fluctuate significantly. Let\'s identify patterns.',
          severity: 'medium',
          action_suggestions: [
            { action: 'Track energy at same time daily', priority: 'high' },
            { action: 'Note cycle day if applicable', priority: 'medium' },
            { action: 'Log stress factors', priority: 'medium' }
          ]
        });
      }
    }

    // Store insights in database
    for (const insight of insights) {
      await supabaseClient
        .from('energy_insights')
        .insert({
          user_id: user.id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          action_suggestions: insight.action_suggestions,
          trigger_data: {
            generated_at: new Date().toISOString(),
            data_points_analyzed: {
              assessments: energyAssessments?.length || 0,
              check_ins: checkIns?.length || 0,
              completions: completions?.length || 0,
              lis_scores: lisScores?.length || 0
            }
          }
        });
    }

    console.log(`Generated ${insights.length} energy insights for user`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        insights_generated: insights.length,
        insights 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )

  } catch (error) {
    console.error('Error generating energy insights:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      },
    )
  }
})

function calculateVariance(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
}
