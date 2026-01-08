import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FitbitSleepData {
  sleep: Array<{
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    levels?: {
      summary?: {
        rem?: { minutes: number };
        deep?: { minutes: number };
        light?: { minutes: number };
        wake?: { minutes: number };
      };
    };
  }>;
}

interface FitbitActivityData {
  summary: {
    steps: number;
    veryActiveMinutes: number;
    fairlyActiveMinutes: number;
    lightlyActiveMinutes: number;
    sedentaryMinutes: number;
  };
}

interface FitbitHeartData {
  'activities-heart': Array<{
    dateTime: string;
    value: {
      restingHeartRate?: number;
    };
  }>;
}

async function refreshTokenIfNeeded(
  supabase: any,
  connection: any,
  fitbitClientId: string,
  fitbitClientSecret: string
): Promise<string> {
  const expiresAt = new Date(connection.token_expires_at);
  const now = new Date();
  
  // Refresh if token expires in less than 5 minutes
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return connection.access_token;
  }

  console.log('Refreshing Fitbit token...');
  
  const refreshResponse = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: connection.refresh_token
    })
  });

  if (!refreshResponse.ok) {
    throw new Error('Token refresh failed');
  }

  const tokens = await refreshResponse.json();
  const newExpiresAt = new Date();
  newExpiresAt.setSeconds(newExpiresAt.getSeconds() + tokens.expires_in);

  // Update tokens in database
  await supabase
    .from('wearable_connections')
    .update({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: newExpiresAt.toISOString()
    })
    .eq('id', connection.id);

  return tokens.access_token;
}

async function fetchFitbitData(accessToken: string, endpoint: string) {
  const response = await fetch(`https://api.fitbit.com${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Fitbit API error: ${response.status}`);
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')!;
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header or body
    let userId: string;
    let accessToken: string | undefined;
    
    const body = await req.json().catch(() => ({}));
    
    if (body.userId && body.accessToken) {
      // Called from callback with tokens
      userId = body.userId;
      accessToken = body.accessToken;
    } else {
      // Called from frontend, need to get connection
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error('No authorization header');

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (userError || !user) throw new Error('User not authenticated');
      userId = user.id;
    }

    // Get connection if we don't have access token
    if (!accessToken) {
      const { data: connection, error: connError } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'fitbit')
        .eq('is_active', true)
        .maybeSingle();

      if (connError || !connection) {
        throw new Error('No active Fitbit connection found');
      }

      accessToken = await refreshTokenIfNeeded(
        supabase,
        connection,
        fitbitClientId,
        fitbitClientSecret
      );
    }

    const today = new Date().toISOString().split('T')[0];
    console.log(`Syncing Fitbit data for user ${userId}, date: ${today}`);

    // Fetch data in parallel
    const [sleepData, activityData, heartData] = await Promise.all([
      fetchFitbitData(accessToken, `/1.2/user/-/sleep/date/${today}.json`) as Promise<FitbitSleepData>,
      fetchFitbitData(accessToken, `/1/user/-/activities/date/${today}.json`) as Promise<FitbitActivityData>,
      fetchFitbitData(accessToken, `/1/user/-/activities/heart/date/${today}/1d.json`) as Promise<FitbitHeartData>
    ]);

    // Process sleep data
    const sleepEntry = sleepData.sleep?.[0];
    const totalSleepHours = sleepEntry ? sleepEntry.duration / (1000 * 60 * 60) : null;
    const remMinutes = sleepEntry?.levels?.summary?.rem?.minutes || 0;
    const totalSleepMinutes = sleepEntry ? sleepEntry.duration / (1000 * 60) : 1;
    const remPercentage = totalSleepMinutes > 0 ? (remMinutes / totalSleepMinutes) * 100 : null;

    // Process activity data
    const steps = activityData.summary?.steps || null;
    const activeMinutes = (activityData.summary?.veryActiveMinutes || 0) + 
                          (activityData.summary?.fairlyActiveMinutes || 0);

    // Process heart rate data
    const restingHeartRate = heartData['activities-heart']?.[0]?.value?.restingHeartRate || null;

    // Map to wearable_data schema
    const wearableDataRecord = {
      user_id: userId,
      date: today,
      device_type: 'fitbit',
      total_sleep_hours: totalSleepHours,
      rem_sleep_percentage: remPercentage,
      heart_rate_variability: null, // Fitbit requires premium for HRV
      resting_heart_rate: restingHeartRate,
      active_minutes: activeMinutes,
      steps,
      exercise_intensity_zones: {
        light: activityData.summary?.lightlyActiveMinutes || 0,
        moderate: activityData.summary?.fairlyActiveMinutes || 0,
        vigorous: activityData.summary?.veryActiveMinutes || 0
      },
      raw_data: {
        sleep: sleepData,
        activity: activityData,
        heart: heartData
      }
    };

    // Upsert wearable data
    const { error: dataError } = await supabase
      .from('wearable_data')
      .upsert(wearableDataRecord, { onConflict: 'user_id,date,device_type' });

    if (dataError) {
      console.error('Error upserting wearable data:', dataError);
      throw dataError;
    }

    // Update last sync time
    await supabase
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('provider', 'fitbit');

    console.log('Fitbit sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Fitbit data synced successfully',
        syncedAt: new Date().toISOString(),
        data: {
          steps,
          totalSleepHours,
          activeMinutes,
          restingHeartRate
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in fitbit-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
