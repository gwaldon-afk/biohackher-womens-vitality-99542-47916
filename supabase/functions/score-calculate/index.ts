import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyMetrics {
  user_id: string;
  date: string;
  sleep?: {
    total_hours?: number;
    rem_hours?: number;
    deep_sleep_hours?: number;
  };
  stress?: {
    hrv?: number;
    self_reported?: number;
    self_perceived_age?: number;
    subjective_calmness_rating?: number;
  };
  activity?: {
    steps?: number;
    active_minutes?: number;
    activity_intensity?: number;
  };
  nutrition?: {
    meal_quality_score?: number;
    nutritional_detailed_score?: number;
  };
  social?: {
    social_time_minutes?: number;
    interaction_quality?: number;
  };
  cognitive?: {
    meditation_minutes?: number;
    learning_minutes?: number;
  };
  assessment_type?: string;
  is_baseline?: boolean;
  input_mode?: string;
  source_type?: string;
}

// Input validation function
function validateMetrics(metrics: any): { valid: boolean; error?: string } {
  // Required fields
  if (!metrics.user_id || typeof metrics.user_id !== 'string') {
    return { valid: false, error: 'user_id is required and must be a string' };
  }
  
  if (!metrics.date || typeof metrics.date !== 'string') {
    return { valid: false, error: 'date is required and must be a string' };
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(metrics.date)) {
    return { valid: false, error: 'date must be in YYYY-MM-DD format' };
  }

  // Validate numeric ranges for sleep data
  if (metrics.sleep) {
    if (metrics.sleep.total_hours !== undefined) {
      if (typeof metrics.sleep.total_hours !== 'number' || metrics.sleep.total_hours < 0 || metrics.sleep.total_hours > 24) {
        return { valid: false, error: 'sleep.total_hours must be between 0 and 24' };
      }
    }
    if (metrics.sleep.rem_hours !== undefined && metrics.sleep.rem_hours !== null) {
      if (typeof metrics.sleep.rem_hours !== 'number' || metrics.sleep.rem_hours < 0 || metrics.sleep.rem_hours > 24) {
        return { valid: false, error: 'sleep.rem_hours must be between 0 and 24' };
      }
    }
    if (metrics.sleep.deep_sleep_hours !== undefined && metrics.sleep.deep_sleep_hours !== null) {
      if (typeof metrics.sleep.deep_sleep_hours !== 'number' || metrics.sleep.deep_sleep_hours < 0 || metrics.sleep.deep_sleep_hours > 24) {
        return { valid: false, error: 'sleep.deep_sleep_hours must be between 0 and 24' };
      }
    }
  }

  // Validate stress data
  if (metrics.stress) {
    if (metrics.stress.hrv !== undefined && metrics.stress.hrv !== null) {
      if (typeof metrics.stress.hrv !== 'number' || metrics.stress.hrv < 0 || metrics.stress.hrv > 200) {
        return { valid: false, error: 'stress.hrv must be between 0 and 200' };
      }
    }
    if (metrics.stress.self_reported !== undefined) {
      if (typeof metrics.stress.self_reported !== 'number' || metrics.stress.self_reported < 0 || metrics.stress.self_reported > 10) {
        return { valid: false, error: 'stress.self_reported must be between 0 and 10' };
      }
    }
    if (metrics.stress.self_perceived_age !== undefined && metrics.stress.self_perceived_age !== null) {
      if (typeof metrics.stress.self_perceived_age !== 'number' || metrics.stress.self_perceived_age < 0 || metrics.stress.self_perceived_age > 150) {
        return { valid: false, error: 'stress.self_perceived_age must be between 0 and 150' };
      }
    }
    if (metrics.stress.subjective_calmness_rating !== undefined) {
      if (typeof metrics.stress.subjective_calmness_rating !== 'number' || metrics.stress.subjective_calmness_rating < 0 || metrics.stress.subjective_calmness_rating > 10) {
        return { valid: false, error: 'stress.subjective_calmness_rating must be between 0 and 10' };
      }
    }
  }

  // Validate activity data
  if (metrics.activity) {
    if (metrics.activity.steps !== undefined && metrics.activity.steps !== null) {
      if (typeof metrics.activity.steps !== 'number' || metrics.activity.steps < 0 || metrics.activity.steps > 100000) {
        return { valid: false, error: 'activity.steps must be between 0 and 100000' };
      }
    }
    if (metrics.activity.active_minutes !== undefined && metrics.activity.active_minutes !== null) {
      if (typeof metrics.activity.active_minutes !== 'number' || metrics.activity.active_minutes < 0 || metrics.activity.active_minutes > 1440) {
        return { valid: false, error: 'activity.active_minutes must be between 0 and 1440' };
      }
    }
  }

  // Validate nutrition data
  if (metrics.nutrition) {
    if (metrics.nutrition.meal_quality_score !== undefined && metrics.nutrition.meal_quality_score !== null) {
      if (typeof metrics.nutrition.meal_quality_score !== 'number' || metrics.nutrition.meal_quality_score < 0 || metrics.nutrition.meal_quality_score > 10) {
        return { valid: false, error: 'nutrition.meal_quality_score must be between 0 and 10' };
      }
    }
  }

  // Validate social data
  if (metrics.social) {
    if (metrics.social.social_time_minutes !== undefined && metrics.social.social_time_minutes !== null) {
      if (typeof metrics.social.social_time_minutes !== 'number' || metrics.social.social_time_minutes < 0 || metrics.social.social_time_minutes > 1440) {
        return { valid: false, error: 'social.social_time_minutes must be between 0 and 1440' };
      }
    }
    if (metrics.social.interaction_quality !== undefined && metrics.social.interaction_quality !== null) {
      if (typeof metrics.social.interaction_quality !== 'number' || metrics.social.interaction_quality < 0 || metrics.social.interaction_quality > 10) {
        return { valid: false, error: 'social.interaction_quality must be between 0 and 10' };
      }
    }
  }

  // Validate cognitive data
  if (metrics.cognitive) {
    if (metrics.cognitive.meditation_minutes !== undefined && metrics.cognitive.meditation_minutes !== null) {
      if (typeof metrics.cognitive.meditation_minutes !== 'number' || metrics.cognitive.meditation_minutes < 0 || metrics.cognitive.meditation_minutes > 1440) {
        return { valid: false, error: 'cognitive.meditation_minutes must be between 0 and 1440' };
      }
    }
    if (metrics.cognitive.learning_minutes !== undefined && metrics.cognitive.learning_minutes !== null) {
      if (typeof metrics.cognitive.learning_minutes !== 'number' || metrics.cognitive.learning_minutes < 0 || metrics.cognitive.learning_minutes > 1440) {
        return { valid: false, error: 'cognitive.learning_minutes must be between 0 and 1440' };
      }
    }
  }

  return { valid: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const metrics: DailyMetrics = await req.json();
    console.log('Received metrics:', JSON.stringify(metrics, null, 2));

    // Validate input
    const validation = validateMetrics(metrics);
    if (!validation.valid) {
      console.error('Validation error:', validation.error);
      return new Response(
        JSON.stringify({ error: `Invalid input: ${validation.error}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get user health profile for LIS 2.0
    const { data: healthProfile } = await supabase
      .from('user_health_profile')
      .select('*')
      .eq('user_id', metrics.user_id)
      .maybeSingle();

    // Calculate user's chronological age
    let userAge = 40; // Default fallback
    if (healthProfile?.date_of_birth) {
      const birthDate = new Date(healthProfile.date_of_birth);
      const today = new Date();
      userAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        userAge--;
      }
    }

    // Determine if this is LIS 2.0 (has required fields)
    const isLIS2 = !!(
      healthProfile && 
      metrics.stress?.self_perceived_age !== undefined &&
      metrics.stress?.subjective_calmness_rating !== undefined
    );

    console.log(`Calculating ${isLIS2 ? 'LIS 2.0' : 'LIS 1.0'} score for user age: ${userAge}`);

    // Get 30-day calmness baseline for LIS 2.0
    let calmnessBaseline: number | null = null;
    let daysOfData = 0;
    if (isLIS2) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentScores } = await supabase
        .from('daily_scores')
        .select('subjective_calmness_rating')
        .eq('user_id', metrics.user_id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .not('subjective_calmness_rating', 'is', null);

      if (recentScores && recentScores.length > 0) {
        daysOfData = recentScores.length;
        const sum = recentScores.reduce((acc, s) => acc + (s.subjective_calmness_rating || 0), 0);
        calmnessBaseline = sum / recentScores.length;
        console.log(`Calmness baseline (${daysOfData} days): ${calmnessBaseline}`);
      }
    }

    // Calculate pillar scores
    const sleepScore = calculateSleepScore(metrics.sleep, isLIS2);
    const stressScore = calculateStressScore(metrics.stress, userAge, isLIS2);
    const activityScore = calculateActivityScore(metrics.activity, userAge, isLIS2);
    const nutritionScore = calculateNutritionScore(metrics.nutrition, healthProfile, isLIS2);
    const socialScore = calculateSocialScore(metrics.social, healthProfile, isLIS2);
    const cognitiveScore = await calculateCognitiveScore(
      metrics.cognitive, 
      metrics.stress, 
      calmnessBaseline, 
      daysOfData,
      isLIS2
    );

    console.log('Pillar scores:', {
      sleep: sleepScore,
      stress: stressScore,
      activity: activityScore,
      nutrition: nutritionScore,
      social: socialScore,
      cognitive: cognitiveScore
    });

    // LIS 2.0 weights vs LIS 1.0 weights
    const weights = isLIS2 ? {
      stress: 0.30,
      social: 0.25,
      sleep: 0.20,
      activity: 0.15,
      nutrition: 0.10,
      cognitive: 0.10
    } : {
      sleep: 0.25,
      stress: 0.20,
      activity: 0.15,
      nutrition: 0.15,
      social: 0.15,
      cognitive: 0.10
    };

    const longevityImpactScore = Math.round(
      sleepScore * weights.sleep +
      stressScore * weights.stress +
      activityScore * weights.activity +
      nutritionScore * weights.nutrition +
      socialScore * weights.social +
      cognitiveScore * weights.cognitive
    );

    const biologicalAgeImpact = calculateBiologicalAgeImpact(longevityImpactScore);
    const dailyDeltaBA = isLIS2 ? calculateDailyDeltaBA(longevityImpactScore) : null;

    let colorCode = 'red';
    if (longevityImpactScore >= 80) colorCode = 'green';
    else if (longevityImpactScore >= 60) colorCode = 'yellow';

    // Prepare data for upsert
    const scoreData = {
      user_id: metrics.user_id,
      date: metrics.date,
      longevity_impact_score: longevityImpactScore,
      biological_age_impact: biologicalAgeImpact,
      sleep_score: sleepScore,
      stress_score: stressScore,
      physical_activity_score: activityScore,
      nutrition_score: nutritionScore,
      social_connections_score: socialScore,
      cognitive_engagement_score: cognitiveScore,
      color_code: colorCode,
      is_baseline: metrics.is_baseline || false,
      source_type: metrics.source_type || 'manual_entry',
      input_mode: metrics.input_mode || 'manual',
      assessment_type: metrics.assessment_type || 'daily_tracking',
      lis_version: isLIS2 ? 'LIS 2.0' : 'LIS 1.0',
      user_chronological_age: userAge,
      // LIS 2.0 specific fields
      self_perceived_age: metrics.stress?.self_perceived_age,
      subjective_calmness_rating: metrics.stress?.subjective_calmness_rating,
      daily_delta_ba_lis: dailyDeltaBA,
      // Raw metric data
      total_sleep_hours: metrics.sleep?.total_hours,
      deep_sleep_hours: metrics.sleep?.deep_sleep_hours,
      rem_hours: metrics.sleep?.rem_hours,
      hrv: metrics.stress?.hrv,
      self_reported_stress: metrics.stress?.self_reported,
      steps: metrics.activity?.steps,
      active_minutes: metrics.activity?.active_minutes,
      activity_intensity: metrics.activity?.activity_intensity,
      meal_quality: metrics.nutrition?.meal_quality_score,
      nutritional_detailed_score: metrics.nutrition?.nutritional_detailed_score,
      social_time_minutes: metrics.social?.social_time_minutes,
      social_interaction_quality: metrics.social?.interaction_quality,
      meditation_minutes: metrics.cognitive?.meditation_minutes,
      learning_minutes: metrics.cognitive?.learning_minutes,
    };

    const { data, error } = await supabase
      .from('daily_scores')
      .upsert(scoreData, {
        onConflict: 'user_id,date',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Update calmness baseline if LIS 2.0 and enough data
    if (isLIS2 && daysOfData >= 1 && calmnessBaseline !== null) {
      await supabase
        .from('calmness_baselines')
        .upsert({
          user_id: metrics.user_id,
          date: metrics.date,
          baseline_calmness_30day: calmnessBaseline
        }, {
          onConflict: 'user_id,date'
        });
    }

    console.log('Score calculated successfully:', longevityImpactScore);

    return new Response(
      JSON.stringify({
        success: true,
        score: data,
        version: isLIS2 ? 'LIS 2.0' : 'LIS 1.0'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// LIS 2.0: Linear interpolation sleep scoring
function calculateSleepScore(sleepData?: any, isLIS2: boolean = false): number {
  if (!sleepData?.total_hours) return 50;
  
  const hours = sleepData.total_hours;
  
  if (!isLIS2) {
    // LIS 1.0 logic (kept for backward compatibility)
    if (hours >= 7 && hours <= 9) return 100;
    if (hours >= 6 && hours < 7) return 75;
    if (hours > 9 && hours <= 10) return 75;
    if (hours >= 5 && hours < 6) return 50;
    return 25;
  }

  // LIS 2.0: Linear interpolation with steep penalties
  if (hours >= 7.0 && hours <= 8.0) return 100;
  
  // Near-optimal zones
  if (hours >= 6.5 && hours < 7.0) return 75 + ((hours - 6.5) * (25 / 0.5));
  if (hours > 8.0 && hours <= 8.5) return 100 - ((hours - 8.0) * (25 / 0.5));
  
  // Mid-risk zones
  if (hours >= 6.0 && hours < 6.5) return 50 + ((hours - 6.0) * (25 / 0.5));
  if (hours > 8.5 && hours <= 9.0) return 75 - ((hours - 8.5) * (25 / 0.5));
  
  // High-risk zones
  if (hours >= 5.0 && hours < 6.0) return 25;
  if (hours > 9.0 && hours <= 10.0) return 25;
  
  // Extreme risk
  return 0;
}

// LIS 2.0: Subjective Age Delta scoring
function calculateStressScore(stressData?: any, userAge: number = 40, isLIS2: boolean = false): number {
  if (!stressData) return 50;

  if (!isLIS2) {
    // LIS 1.0 logic
    const hrv = stressData.hrv || 0;
    const selfReported = stressData.self_reported || 5;
    
    let hrvScore = 50;
    if (hrv > 60) hrvScore = 100;
    else if (hrv > 40) hrvScore = 75;
    else if (hrv > 20) hrvScore = 50;
    else hrvScore = 25;
    
    const stressScore = (10 - selfReported) * 10;
    return Math.round((hrvScore + stressScore) / 2);
  }

  // LIS 2.0: Subjective Age Delta
  if (stressData.self_perceived_age === undefined) return 50;
  
  const deltaSA = stressData.self_perceived_age - userAge;
  
  if (deltaSA <= -5) return 100;
  if (deltaSA > -5 && deltaSA <= 0) return 80 - (4 * deltaSA);
  if (deltaSA > 0 && deltaSA < 5) return 80 - (15.8 * deltaSA);
  if (deltaSA >= 5) return 0;
  
  return 50;
}

// LIS 2.0: Age-stratified non-linear activity scoring
function calculateActivityScore(activityData?: any, userAge: number = 40, isLIS2: boolean = false): number {
  if (!activityData) return 50;
  
  const { active_minutes = 0, steps = 0 } = activityData;
  
  if (!isLIS2) {
    // LIS 1.0 logic
    const minutesScore = Math.min(100, (active_minutes / 30) * 100);
    const stepsScore = Math.min(100, (steps / 10000) * 100);
    return Math.round((minutesScore + stepsScore) / 2);
  }

  // LIS 2.0: Activity Minutes Floor (10-30 minutes)
  let minutesScore = 0;
  if (active_minutes >= 30) minutesScore = 100;
  else if (active_minutes >= 10) minutesScore = 20 + ((active_minutes - 10) * (80 / 20));
  else minutesScore = 0;
  
  // Age-stratified steps scoring
  let stepsScore = 0;
  if (userAge >= 60) {
    // Saturates at 8,000 steps
    if (steps >= 8000) stepsScore = 100;
    else if (steps >= 4000) stepsScore = 50 + ((steps - 4000) * (50 / 4000));
    else stepsScore = steps * (50 / 4000);
  } else {
    // Saturates at 10,000 steps
    if (steps >= 10000) stepsScore = 100;
    else if (steps >= 8000) stepsScore = 90 + ((steps - 8000) * (10 / 2000));
    else if (steps >= 4000) stepsScore = 50 + ((steps - 4000) * (40 / 4000));
    else stepsScore = steps * (50 / 4000);
  }
  
  // Return MAX of steps or minutes score
  return Math.round(Math.max(stepsScore, minutesScore));
}

// LIS 2.0: Nutrition with metabolic health penalties
function calculateNutritionScore(nutritionData?: any, healthProfile?: any, isLIS2: boolean = false): number {
  const baseScore = (nutritionData?.meal_quality_score || 5) * 10;
  
  if (!isLIS2 || !healthProfile) {
    return baseScore;
  }

  // LIS 2.0: Apply metabolic penalties
  let penalties = 0;
  
  // Smoking penalties
  if (healthProfile.is_current_smoker) penalties += 60;
  else if (healthProfile.is_former_smoker) penalties += 15;
  
  // BMI penalties
  if (healthProfile.current_bmi) {
    if (healthProfile.current_bmi >= 30 || healthProfile.current_bmi <= 18.5) {
      penalties += 30;
    }
  }
  
  return Math.max(0, baseScore - penalties);
}

// LIS 2.0: Social engagement from initial assessment
function calculateSocialScore(socialData?: any, healthProfile?: any, isLIS2: boolean = false): number {
  if (!isLIS2 || !healthProfile?.social_engagement_baseline) {
    // LIS 1.0 logic
    if (!socialData) return 50;
    const timeScore = Math.min(100, (socialData.social_time_minutes || 0) / 60 * 100);
    const qualityScore = (socialData.interaction_quality || 5) * 20;
    return Math.round((timeScore + qualityScore) / 2);
  }

  // LIS 2.0: Linear conversion from 1-5 scale to 0-100
  return (healthProfile.social_engagement_baseline - 1) * 25;
}

// LIS 2.0: Conditional meditation scoring based on calmness improvement
async function calculateCognitiveScore(
  cognitiveData?: any,
  stressData?: any,
  calmnessBaseline?: number | null,
  daysOfData: number = 0,
  isLIS2: boolean = false
): Promise<number> {
  if (!cognitiveData) return 50;

  const meditationMinutes = cognitiveData.meditation_minutes || 0;
  const learningMinutes = cognitiveData.learning_minutes || 0;

  if (!isLIS2) {
    // LIS 1.0 logic
    const meditationScore = Math.min(100, (meditationMinutes / 20) * 100);
    const learningScore = Math.min(100, (learningMinutes / 30) * 100);
    return Math.round((meditationScore + learningScore) / 2);
  }

  // LIS 2.0: During first 30 days - adherence credit only
  if (daysOfData < 30 || calmnessBaseline === null) {
    if (meditationMinutes >= 10) return 50;
    return 0;
  }
  
  // After 30 days: conditional scoring
  if (meditationMinutes < 10) return 0;
  
  if (!stressData?.subjective_calmness_rating || !calmnessBaseline) return 25;
  
  const percentChange = ((stressData.subjective_calmness_rating - calmnessBaseline) / calmnessBaseline) * 100;
  
  if (percentChange >= 7.0) return 100;
  if (percentChange >= 1.0) return 70;
  return 25; // Adherence credit only
}

function calculateBiologicalAgeImpact(lisScore: number): number {
  const neutralScore = 50;
  const impactFactor = 0.2;
  return Number(((neutralScore - lisScore) * impactFactor).toFixed(2));
}

// LIS 2.0: Daily Delta BA calculation
function calculateDailyDeltaBA(lisScore: number): number {
  const BETA = -0.11; // Years per unit change
  const neutralScore = 50;
  const unitChange = (lisScore - neutralScore) / 10;
  return Number((unitChange * BETA).toFixed(4));
}
