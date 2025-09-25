import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');
    const days = parseInt(url.searchParams.get('days') || '30', 10);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'user_id parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    console.log(`Fetching ${days} days of score history for user:`, userId);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const { data: scores, error } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Calculate 7-day moving averages
    const scoresWithMovingAverage = scores.map((score, index) => {
      const startIdx = Math.max(0, index - 6);
      const recentScores = scores.slice(startIdx, index + 1);
      const movingAverage = recentScores.reduce((sum, s) => sum + s.longevity_impact_score, 0) / recentScores.length;
      
      return {
        ...score,
        moving_average: parseFloat(movingAverage.toFixed(2))
      };
    });

    // Generate summary statistics
    const avgScore = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s.longevity_impact_score, 0) / scores.length 
      : 0;
    
    const totalBioAgeImpact = scores.reduce((sum, s) => sum + s.biological_age_impact, 0);

    const summary = {
      total_days: scores.length,
      average_score: parseFloat(avgScore.toFixed(2)),
      total_biological_age_impact: parseFloat(totalBioAgeImpact.toFixed(2)),
      green_days: scores.filter(s => s.color_code === 'green').length,
      red_days: scores.filter(s => s.color_code === 'red').length
    };

    console.log('Score history fetched successfully:', summary);

    return new Response(
      JSON.stringify({
        scores: scoresWithMovingAverage,
        summary
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching score history:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});