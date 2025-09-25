import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyMetrics {
  user_id: string;
  date: string;
  sleep_data?: {
    total_hours: number;
    rem_percentage: number;
  };
  stress_data?: {
    hrv: number;
    stress_level: number; // 1-10 self-reported
  };
  activity_data?: {
    active_minutes: number;
    steps: number;
    exercise_zones: any;
  };
  nutrition_data?: {
    meal_quality_score: number; // 1-10
  };
  social_data?: {
    interaction_quality: number; // 1-10 self-reported
    social_time_minutes: number;
  };
  cognitive_data?: {
    meditation_minutes: number;
    learning_minutes: number;
  };
  self_reported?: {
    loveable_score: number; // 1-10
  };
}

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

    const { data: metrics }: { data: DailyMetrics } = await req.json();
    console.log('Calculating LIS for metrics:', metrics);

    // Calculate individual pillar scores (0-100)
    const sleepScore = calculateSleepScore(metrics.sleep_data);
    const stressScore = calculateStressScore(metrics.stress_data, metrics.self_reported);
    const activityScore = calculateActivityScore(metrics.activity_data);
    const nutritionScore = calculateNutritionScore(metrics.nutrition_data);
    const socialScore = calculateSocialScore(metrics.social_data);
    const cognitiveScore = calculateCognitiveScore(metrics.cognitive_data);

    // Calculate weighted LIS (as per specification)
    const weights = {
      sleep: 0.25,      // 25%
      stress: 0.20,     // 20%
      activity: 0.15,   // 15%
      nutrition: 0.15,  // 15%
      social: 0.15,     // 15%
      cognitive: 0.10   // 10%
    };

    const longevityImpactScore = 
      (sleepScore * weights.sleep) +
      (stressScore * weights.stress) +
      (activityScore * weights.activity) +
      (nutritionScore * weights.nutrition) +
      (socialScore * weights.social) +
      (cognitiveScore * weights.cognitive);

    // Calculate biological age impact
    const biologicalAgeImpact = calculateBiologicalAgeImpact(longevityImpactScore);
    
    // Determine color code
    const colorCode = biologicalAgeImpact >= 0 ? 'green' : 'red';

    // Store in database
    const { data: scoreData, error } = await supabase
      .from('daily_scores')
      .upsert({
        user_id: metrics.user_id,
        date: metrics.date,
        longevity_impact_score: parseFloat(longevityImpactScore.toFixed(2)),
        biological_age_impact: parseFloat(biologicalAgeImpact.toFixed(2)),
        color_code: colorCode,
        sleep_score: parseFloat(sleepScore.toFixed(2)),
        stress_score: parseFloat(stressScore.toFixed(2)),
        physical_activity_score: parseFloat(activityScore.toFixed(2)),
        nutrition_score: parseFloat(nutritionScore.toFixed(2)),
        social_connections_score: parseFloat(socialScore.toFixed(2)),
        cognitive_engagement_score: parseFloat(cognitiveScore.toFixed(2))
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('LIS calculated successfully:', scoreData);

    return new Response(
      JSON.stringify({
        longevity_impact_score: longevityImpactScore,
        biological_age_impact: biologicalAgeImpact,
        color_code: colorCode,
        pillar_scores: {
          sleep: sleepScore,
          stress: stressScore,
          activity: activityScore,
          nutrition: nutritionScore,
          social: socialScore,
          cognitive: cognitiveScore
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error calculating LIS:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Scoring functions for each pillar
function calculateSleepScore(sleepData?: any): number {
  if (!sleepData) return 50; // Default neutral score
  
  const { total_hours = 7, rem_percentage = 20 } = sleepData;
  
  // Optimal sleep: 7-9 hours, 20-25% REM
  const hoursScore = total_hours >= 7 && total_hours <= 9 ? 100 : 
                    total_hours >= 6 && total_hours <= 10 ? 75 : 50;
  
  const remScore = rem_percentage >= 20 && rem_percentage <= 25 ? 100 :
                   rem_percentage >= 15 && rem_percentage <= 30 ? 75 : 50;
  
  return (hoursScore + remScore) / 2;
}

function calculateStressScore(stressData?: any, selfReported?: any): number {
  if (!stressData && !selfReported) return 50;
  
  let score = 0;
  let factors = 0;
  
  if (stressData?.hrv) {
    // Higher HRV is better (normalize to 0-100)
    const hrvScore = Math.min(100, (stressData.hrv / 50) * 100);
    score += hrvScore;
    factors++;
  }
  
  if (stressData?.stress_level) {
    // Lower stress level is better (invert 1-10 scale)
    const stressScore = (11 - stressData.stress_level) * 10;
    score += stressScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 50;
}

function calculateActivityScore(activityData?: any): number {
  if (!activityData) return 50;
  
  const { active_minutes = 0, steps = 0 } = activityData;
  
  // Target: 30+ active minutes, 8000+ steps
  const minutesScore = active_minutes >= 30 ? 100 : (active_minutes / 30) * 100;
  const stepsScore = steps >= 8000 ? 100 : (steps / 8000) * 100;
  
  return Math.min(100, (minutesScore + stepsScore) / 2);
}

function calculateNutritionScore(nutritionData?: any): number {
  if (!nutritionData) return 50;
  
  const { meal_quality_score = 5 } = nutritionData;
  
  // Convert 1-10 scale to 0-100
  return meal_quality_score * 10;
}

function calculateSocialScore(socialData?: any): number {
  if (!socialData) return 50;
  
  let score = 0;
  let factors = 0;
  
  if (socialData.interaction_quality) {
    score += socialData.interaction_quality * 10;
    factors++;
  }
  
  if (socialData.social_time_minutes) {
    // Target: 60+ minutes of social interaction
    const timeScore = Math.min(100, (socialData.social_time_minutes / 60) * 100);
    score += timeScore;
    factors++;
  }
  
  return factors > 0 ? score / factors : 50;
}

function calculateCognitiveScore(cognitiveData?: any): number {
  if (!cognitiveData) return 50;
  
  const { meditation_minutes = 0, learning_minutes = 0 } = cognitiveData;
  
  // Target: 10+ minutes meditation, 30+ minutes learning
  const meditationScore = Math.min(100, (meditation_minutes / 10) * 100);
  const learningScore = Math.min(100, (learning_minutes / 30) * 100);
  
  return (meditationScore + learningScore) / 2;
}

function calculateBiologicalAgeImpact(lisScore: number): number {
  // Convert LIS score to biological age impact (days)
  // Score 50 = neutral (0 days), >50 = positive (subtract days), <50 = negative (add days)
  
  if (lisScore >= 80) return 0.5;   // Excellent day: -0.5 days
  if (lisScore >= 65) return 0.25;  // Good day: -0.25 days
  if (lisScore >= 50) return 0;     // Neutral day: 0 days
  if (lisScore >= 35) return -0.25; // Poor day: +0.25 days
  return -0.5;                      // Very poor day: +0.5 days
}