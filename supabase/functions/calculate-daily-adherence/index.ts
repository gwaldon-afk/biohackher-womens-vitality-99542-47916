import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('[calculate-daily-adherence] Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = user.id
    const today = new Date().toISOString().split('T')[0]
    console.log(`[calculate-daily-adherence] Calculating for user ${userId} on ${today}`)

    // 1. Get protocol items for user
    const { data: protocolItems, error: protocolError } = await supabase
      .from('protocol_items')
      .select(`
        id,
        protocol_id,
        protocols!inner(user_id)
      `)
      .eq('protocols.user_id', userId)
      .eq('is_active', true)

    if (protocolError) {
      console.error('[calculate-daily-adherence] Protocol items error:', protocolError)
    }

    // 2. Get protocol item completions for today
    const { data: protocolCompletions, error: completionError } = await supabase
      .from('protocol_item_completions')
      .select('protocol_item_id')
      .eq('user_id', userId)
      .eq('completed_date', today)

    if (completionError) {
      console.error('[calculate-daily-adherence] Completions error:', completionError)
    }

    // 3. Get meal completions for today (expected: breakfast, lunch, dinner = 3 meals)
    const { data: mealCompletions, error: mealError } = await supabase
      .from('meal_completions')
      .select('meal_type')
      .eq('user_id', userId)
      .eq('completed_date', today)

    if (mealError) {
      console.error('[calculate-daily-adherence] Meal completions error:', mealError)
    }

    // 4. Get active goals for user
    const { data: activeGoals, error: goalsError } = await supabase
      .from('user_health_goals')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (goalsError) {
      console.error('[calculate-daily-adherence] Goals error:', goalsError)
    }

    // 5. Get goal check-ins for today
    const { data: goalCheckIns, error: checkInError } = await supabase
      .from('goal_check_ins')
      .select('goal_id')
      .eq('user_id', userId)
      .eq('check_in_date', today)

    if (checkInError) {
      console.error('[calculate-daily-adherence] Check-ins error:', checkInError)
    }

    // Calculate totals
    const protocolItemCount = protocolItems?.length || 0
    const protocolCompletedCount = protocolCompletions?.length || 0
    
    // Assume 3 meals expected per day (breakfast, lunch, dinner)
    const expectedMeals = 3
    const mealCompletedCount = mealCompletions?.length || 0
    
    const activeGoalCount = activeGoals?.length || 0
    const goalCheckInCount = goalCheckIns?.length || 0

    // Total expected vs completed
    const totalExpected = protocolItemCount + expectedMeals + activeGoalCount
    const totalCompleted = protocolCompletedCount + mealCompletedCount + goalCheckInCount

    // Calculate adherence percentage
    const adherencePercent = totalExpected > 0 
      ? Math.round((totalCompleted / totalExpected) * 100) 
      : 0

    console.log(`[calculate-daily-adherence] Stats: ${totalCompleted}/${totalExpected} = ${adherencePercent}%`)
    console.log(`[calculate-daily-adherence] Breakdown: protocol=${protocolCompletedCount}/${protocolItemCount}, meals=${mealCompletedCount}/${expectedMeals}, goals=${goalCheckInCount}/${activeGoalCount}`)

    // 6. Get existing daily_scores for today (if any)
    const { data: existingScores } = await supabase
      .from('daily_scores')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle()

    // 7. Upsert adherence to daily_scores
    const { error: upsertError } = await supabase
      .from('daily_scores')
      .upsert({
        user_id: userId,
        date: today,
        protocol_adherence_score: adherencePercent,
        // Preserve existing scores or use defaults
        longevity_impact_score: existingScores?.longevity_impact_score ?? 0,
        biological_age_impact: existingScores?.biological_age_impact ?? 0,
        color_code: existingScores?.color_code ?? (adherencePercent >= 80 ? 'green' : adherencePercent >= 50 ? 'yellow' : 'red'),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      })

    if (upsertError) {
      console.error('[calculate-daily-adherence] Upsert error:', upsertError)
      return new Response(
        JSON.stringify({ error: 'Failed to save adherence score', details: upsertError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[calculate-daily-adherence] Successfully saved adherence: ${adherencePercent}%`)

    // 8. Trigger LIS recalculation if we have existing metrics
    let lisRecalculated = false
    if (existingScores && existingScores.total_sleep_hours !== null) {
      console.log('[calculate-daily-adherence] Triggering LIS recalculation with existing metrics')
      
      try {
        const scoreResponse = await fetch(`${supabaseUrl}/functions/v1/score-calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            user_id: userId,
            date: today,
            sleep: {
              total_hours: existingScores.total_sleep_hours,
              rem_hours: existingScores.rem_hours,
              deep_sleep_hours: existingScores.deep_sleep_hours
            },
            stress: {
              hrv: existingScores.hrv,
              self_reported: existingScores.self_reported_stress,
              self_perceived_age: existingScores.self_perceived_age,
              subjective_calmness_rating: existingScores.subjective_calmness_rating
            },
            activity: {
              steps: existingScores.steps,
              active_minutes: existingScores.active_minutes,
              activity_intensity: existingScores.activity_intensity
            },
            nutrition: {
              meal_quality_score: existingScores.meal_quality,
              nutritional_detailed_score: existingScores.nutritional_detailed_score
            },
            social: {
              social_time_minutes: existingScores.social_time_minutes,
              interaction_quality: existingScores.social_interaction_quality
            },
            cognitive: {
              meditation_minutes: existingScores.meditation_minutes,
              learning_minutes: existingScores.learning_minutes
            },
            source_type: 'adherence_update',
            input_mode: existingScores.input_mode || 'manual'
          })
        })

        if (scoreResponse.ok) {
          lisRecalculated = true
          console.log('[calculate-daily-adherence] LIS recalculated successfully')
        } else {
          const errorText = await scoreResponse.text()
          console.warn('[calculate-daily-adherence] LIS recalc returned non-OK:', errorText)
        }
      } catch (lisError) {
        console.warn('[calculate-daily-adherence] LIS recalc failed (non-blocking):', lisError)
      }
    } else {
      console.log('[calculate-daily-adherence] No existing metrics - skipping LIS recalc')
    }

    return new Response(
      JSON.stringify({
        success: true,
        adherencePercent,
        lisRecalculated,
        breakdown: {
          protocol: { completed: protocolCompletedCount, total: protocolItemCount },
          meals: { completed: mealCompletedCount, total: expectedMeals },
          goals: { completed: goalCheckInCount, total: activeGoalCount }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[calculate-daily-adherence] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
