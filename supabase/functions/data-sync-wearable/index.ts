import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('User not authenticated');

    const { connectionId } = await req.json();
    console.log(`Syncing data for connection: ${connectionId}`);

    // Fetch connection details
    const { data: connection, error: connError } = await supabase
      .from('wearable_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (connError || !connection) {
      throw new Error('Connection not found');
    }

    console.log(`Syncing ${connection.provider} for user ${user.id}`);

    // This is where you would integrate with actual wearable APIs (Terra, Fitbit, Oura, etc.)
    // For demonstration, simulate data sync with realistic values
    const today = new Date().toISOString().split('T')[0];
    
    const sleepData = {
      user_id: user.id,
      date: today,
      device_type: connection.provider,
      total_sleep_hours: 7.5 + Math.random() * 1.5,
      rem_sleep_percentage: 20 + Math.random() * 10,
      heart_rate_variability: 50 + Math.random() * 30,
      resting_heart_rate: 55 + Math.floor(Math.random() * 15),
      active_minutes: 30 + Math.floor(Math.random() * 60),
      steps: 5000 + Math.floor(Math.random() * 5000),
      exercise_intensity_zones: { light: 20, moderate: 15, vigorous: 5 },
      raw_data: {}
    };

    // Upsert wearable data
    const { error: dataError } = await supabase
      .from('wearable_data')
      .upsert(sleepData, { onConflict: 'user_id,date,device_type' });

    if (dataError) {
      console.error('Error upserting wearable data:', dataError);
      throw dataError;
    }

    // Update last sync time
    await supabase
      .from('wearable_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connectionId);

    // Auto-create daily score if doesn't exist
    const { data: existingScore } = await supabase
      .from('daily_scores')
      .select('id')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (!existingScore) {
      await supabase
        .from('daily_scores')
        .insert({
          user_id: user.id,
          date: today,
          total_sleep_hours: sleepData.total_sleep_hours,
          rem_hours: (sleepData.total_sleep_hours * sleepData.rem_sleep_percentage) / 100,
          hrv: sleepData.heart_rate_variability,
          active_minutes: sleepData.active_minutes,
          steps: sleepData.steps,
          source_type: 'wearable',
          input_mode: 'auto',
          biological_age_impact: 0,
          longevity_impact_score: 6.5 + Math.random() * 2,
          color_code: 'green'
        });
    }

    console.log('Sync completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Data synced successfully',
        syncedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in data-sync-wearable:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});