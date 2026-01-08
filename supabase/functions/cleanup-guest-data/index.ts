/**
 * Cleanup Guest Data Edge Function
 * 
 * Deletes expired guest assessment data (unclaimed for 30+ days).
 * Should be called daily via a cron job or manually.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const now = new Date().toISOString();
    const results = {
      guest_lis_assessments: 0,
      guest_symptom_assessments: 0,
      longevity_nutrition_assessments: 0,
    };

    // Delete expired guest LIS assessments
    const { data: lisDeleted, error: lisError } = await supabaseAdmin
      .from('guest_lis_assessments')
      .delete()
      .is('claimed_by_user_id', null)
      .lt('expires_at', now)
      .select('id');

    if (lisError) {
      console.error('Error deleting guest LIS assessments:', lisError);
    } else {
      results.guest_lis_assessments = lisDeleted?.length || 0;
    }

    // Delete expired guest symptom assessments
    const { data: symptomDeleted, error: symptomError } = await supabaseAdmin
      .from('guest_symptom_assessments')
      .delete()
      .is('claimed_by_user_id', null)
      .lt('expires_at', now)
      .select('id');

    if (symptomError) {
      console.error('Error deleting guest symptom assessments:', symptomError);
    } else {
      results.guest_symptom_assessments = symptomDeleted?.length || 0;
    }

    // Delete expired guest nutrition assessments
    const { data: nutritionDeleted, error: nutritionError } = await supabaseAdmin
      .from('longevity_nutrition_assessments')
      .delete()
      .is('user_id', null)
      .not('session_id', 'is', null)
      .lt('expires_at', now)
      .select('id');

    if (nutritionError) {
      console.error('Error deleting guest nutrition assessments:', nutritionError);
    } else {
      results.longevity_nutrition_assessments = nutritionDeleted?.length || 0;
    }

    const totalDeleted = 
      results.guest_lis_assessments + 
      results.guest_symptom_assessments + 
      results.longevity_nutrition_assessments;

    console.log(`Cleanup complete: ${totalDeleted} expired guest records deleted`, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${totalDeleted} expired guest records`,
        details: results,
        cleaned_at: now,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in cleanup-guest-data:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
