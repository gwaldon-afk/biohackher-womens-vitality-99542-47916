import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const fitbitClientId = Deno.env.get('FITBIT_CLIENT_ID')!;
    const fitbitClientSecret = Deno.env.get('FITBIT_CLIENT_SECRET')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Determine redirect URL (frontend app URL)
    const appUrl = Deno.env.get('APP_URL') || 'https://app.healthspan.com';
    const wearablesUrl = `${appUrl}/wearables`;

    // Handle user cancellation or error
    if (error) {
      console.log('OAuth error:', error);
      return Response.redirect(`${wearablesUrl}?status=cancelled`, 302);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return Response.redirect(`${wearablesUrl}?status=failed&error=missing_params`, 302);
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch (e) {
      console.error('Invalid state parameter');
      return Response.redirect(`${wearablesUrl}?status=failed&error=invalid_state`, 302);
    }

    const { userId, timestamp } = stateData;

    // Validate state timestamp (expire after 10 minutes)
    if (Date.now() - timestamp > 10 * 60 * 1000) {
      console.error('State expired');
      return Response.redirect(`${wearablesUrl}?status=failed&error=state_expired`, 302);
    }

    // Exchange code for tokens
    const callbackUrl = `${supabaseUrl}/functions/v1/fitbit-callback`;
    const tokenResponse = await fetch('https://api.fitbit.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${fitbitClientId}:${fitbitClientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return Response.redirect(`${wearablesUrl}?status=failed&error=token_exchange`, 302);
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully obtained Fitbit tokens for user:', userId);

    // Calculate token expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Store connection in database
    const { error: dbError } = await supabase
      .from('wearable_connections')
      .upsert({
        user_id: userId,
        provider: 'fitbit',
        provider_user_id: tokens.user_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        is_active: true,
        last_sync_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,provider'
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return Response.redirect(`${wearablesUrl}?status=failed&error=database`, 302);
    }

    // Trigger initial data sync
    try {
      await supabase.functions.invoke('fitbit-sync', {
        body: { userId, accessToken: tokens.access_token }
      });
    } catch (syncError) {
      console.error('Initial sync failed (non-blocking):', syncError);
    }

    console.log('Fitbit connection saved successfully');
    return Response.redirect(`${wearablesUrl}?status=success&provider=fitbit`, 302);

  } catch (error: any) {
    console.error('Error in fitbit-callback:', error);
    const appUrl = Deno.env.get('APP_URL') || 'https://app.healthspan.com';
    return Response.redirect(`${appUrl}/wearables?status=failed&error=server`, 302);
  }
});
