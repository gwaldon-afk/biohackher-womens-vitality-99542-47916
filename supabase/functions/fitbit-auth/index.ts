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

    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID');
    if (!fitbitClientId) {
      throw new Error('Fitbit integration not configured');
    }

    // Build callback URL
    const callbackUrl = `${supabaseUrl}/functions/v1/fitbit-callback`;

    // Generate state parameter with user ID for CSRF protection
    const state = btoa(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    }));

    // Build Fitbit OAuth URL
    const authUrl = new URL('https://www.fitbit.com/oauth2/authorize');
    authUrl.searchParams.set('client_id', fitbitClientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'activity heartrate sleep profile');
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'consent');

    console.log(`Generated Fitbit auth URL for user ${user.id}`);

    return new Response(
      JSON.stringify({
        url: authUrl.toString(),
        state
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in fitbit-auth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
