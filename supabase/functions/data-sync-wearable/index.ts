import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WearableData {
  user_id: string;
  date: string;
  device_type: 'apple_watch' | 'oura_ring' | 'fitbit' | 'garmin';
  sleep_data?: {
    total_sleep_hours: number;
    rem_sleep_percentage: number;
  };
  heart_data?: {
    heart_rate_variability: number;
    resting_heart_rate: number;
  };
  activity_data?: {
    active_minutes: number;
    steps: number;
    exercise_intensity_zones: any;
  };
  raw_data: any; // Complete API response
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

    const { data: wearableData }: { data: WearableData } = await req.json();
    console.log('Syncing wearable data:', wearableData.device_type, 'for date:', wearableData.date);

    // Validate required fields
    if (!wearableData.user_id || !wearableData.date || !wearableData.device_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, date, device_type' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Store wearable data
    const wearableRecord = {
      user_id: wearableData.user_id,
      date: wearableData.date,
      device_type: wearableData.device_type,
      total_sleep_hours: wearableData.sleep_data?.total_sleep_hours || null,
      rem_sleep_percentage: wearableData.sleep_data?.rem_sleep_percentage || null,
      heart_rate_variability: wearableData.heart_data?.heart_rate_variability || null,
      resting_heart_rate: wearableData.heart_data?.resting_heart_rate || null,
      active_minutes: wearableData.activity_data?.active_minutes || null,
      steps: wearableData.activity_data?.steps || null,
      exercise_intensity_zones: wearableData.activity_data?.exercise_intensity_zones || null,
      raw_data: wearableData.raw_data
    };

    const { data: storedData, error } = await supabase
      .from('wearable_data')
      .upsert(wearableRecord)
      .select()
      .single();

    if (error) {
      console.error('Database error storing wearable data:', error);
      throw error;
    }

    console.log('Wearable data stored successfully');

    // Automatically trigger LIS calculation if we have sufficient data
    const shouldCalculateLIS = await shouldTriggerLISCalculation(
      supabase, 
      wearableData.user_id, 
      wearableData.date
    );

    let lisResult = null;
    if (shouldCalculateLIS) {
      console.log('Triggering automatic LIS calculation');
      
      // Fetch all data for the day
      const dayData = await fetchDayData(supabase, wearableData.user_id, wearableData.date);
      
      // Call score calculation function
      const calculateUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/score-calculate`;
      const response = await fetch(calculateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({ data: dayData })
      });

      if (response.ok) {
        lisResult = await response.json();
        console.log('LIS calculation triggered successfully');
      } else {
        console.error('Failed to trigger LIS calculation:', await response.text());
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Wearable data synced successfully',
        data: storedData,
        lis_calculated: !!lisResult,
        lis_result: lisResult
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error syncing wearable data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function shouldTriggerLISCalculation(supabase: any, userId: string, date: string): Promise<boolean> {
  // Check if we have a mix of data sources for the day
  const { data: wearableData } = await supabase
    .from('wearable_data')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  const { data: selfReported } = await supabase
    .from('self_reported_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  const { data: habits } = await supabase
    .from('habit_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  // Trigger if we have any wearable data + (self-reported or habits)
  return (wearableData?.length > 0) && (selfReported?.length > 0 || habits?.length > 0);
}

async function fetchDayData(supabase: any, userId: string, date: string): Promise<any> {
  // Fetch all data sources for the day
  const { data: wearableData } = await supabase
    .from('wearable_data')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  const { data: selfReported } = await supabase
    .from('self_reported_metrics')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .single();

  const { data: habits } = await supabase
    .from('habit_tracking')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date);

  // Combine and structure data for LIS calculation
  const combinedData = {
    user_id: userId,
    date: date,
    sleep_data: wearableData?.find((w: any) => w.total_sleep_hours) ? {
      total_hours: wearableData.find((w: any) => w.total_sleep_hours)?.total_sleep_hours,
      rem_percentage: wearableData.find((w: any) => w.rem_sleep_percentage)?.rem_sleep_percentage
    } : undefined,
    stress_data: {
      hrv: wearableData?.find((w: any) => w.heart_rate_variability)?.heart_rate_variability,
      stress_level: selfReported?.stress_level
    },
    activity_data: wearableData?.find((w: any) => w.active_minutes) ? {
      active_minutes: wearableData.find((w: any) => w.active_minutes)?.active_minutes,
      steps: wearableData.find((w: any) => w.steps)?.steps,
      exercise_zones: wearableData.find((w: any) => w.exercise_intensity_zones)?.exercise_intensity_zones
    } : undefined,
    social_data: {
      interaction_quality: selfReported?.social_interaction_quality,
      social_time_minutes: habits?.find((h: any) => h.habit_type === 'social_gathering')?.duration_minutes
    },
    cognitive_data: {
      meditation_minutes: habits?.find((h: any) => h.habit_type === 'meditation')?.duration_minutes || 0,
      learning_minutes: habits?.find((h: any) => h.habit_type === 'cognitive_exercise')?.duration_minutes || 0
    },
    self_reported: {
      loveable_score: selfReported?.loveable_score
    }
  };

  return combinedData;
}