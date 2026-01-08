/**
 * Seed Test Users Edge Function
 * 
 * Creates 9 test user accounts in Supabase Auth with corresponding profiles
 * and subscriptions. These users are used for realistic end-to-end testing.
 * 
 * This function should only be called once to set up the test accounts.
 * It uses service role to bypass RLS and create users directly.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TestUserConfig {
  email: string;
  password: string;
  preferredName: string;
  fullName: string;
  subscriptionTier: 'registered' | 'premium';
  age: number;
  weightKg: number;
  heightCm: number;
  activityLevel: string;
}

// Normalize activity level to valid database enum values
function normalizeActivityLevel(level: string): string {
  const mapping: Record<string, string> = {
    'sedentary': 'sedentary',
    'light': 'lightly_active',
    'lightly_active': 'lightly_active',
    'moderate': 'moderately_active',
    'moderately_active': 'moderately_active',
    'active': 'very_active',
    'very_active': 'very_active',
    'athlete': 'extremely_active',
    'extremely_active': 'extremely_active',
  };
  return mapping[level.toLowerCase()] || 'moderately_active';
}

const TEST_USERS: TestUserConfig[] = [
  {
    email: 'mia.test@biohackher.dev',
    password: 'TestMia2024!',
    preferredName: 'Mia',
    fullName: 'Mia Chen',
    subscriptionTier: 'registered',
    age: 35,
    weightKg: 85,
    heightCm: 165,
    activityLevel: 'sedentary',
  },
  {
    email: 'jessica.test@biohackher.dev',
    password: 'TestJess2024!',
    preferredName: 'Jess',
    fullName: 'Jessica Nguyen',
    subscriptionTier: 'registered',
    age: 35,
    weightKg: 65,
    heightCm: 168,
    activityLevel: 'lightly_active',
  },
  {
    email: 'karen.test@biohackher.dev',
    password: 'TestKaren2024!',
    preferredName: 'Kaz',
    fullName: 'Karen Mitchell',
    subscriptionTier: 'premium',
    age: 45,
    weightKg: 72,
    heightCm: 162,
    activityLevel: 'moderately_active',
  },
  {
    email: 'priya.test@biohackher.dev',
    password: 'TestPriya2024!',
    preferredName: 'Priya',
    fullName: 'Dr Priya Sharma',
    subscriptionTier: 'premium',
    age: 45,
    weightKg: 68,
    heightCm: 170,
    activityLevel: 'very_active',
  },
  {
    email: 'margaret.test@biohackher.dev',
    password: 'TestMargaret2024!',
    preferredName: 'Marg',
    fullName: 'Margaret Thompson',
    subscriptionTier: 'registered',
    age: 62,
    weightKg: 78,
    heightCm: 160,
    activityLevel: 'lightly_active',
  },
  {
    email: 'christine.test@biohackher.dev',
    password: 'TestChristine2024!',
    preferredName: 'Chris',
    fullName: 'Christine Walsh',
    subscriptionTier: 'premium',
    age: 52,
    weightKg: 65,
    heightCm: 165,
    activityLevel: 'very_active',
  },
  {
    email: 'sarah.test@biohackher.dev',
    password: 'TestSarah2024!',
    preferredName: 'Sarah',
    fullName: "Sarah O'Brien",
    subscriptionTier: 'premium',
    age: 38,
    weightKg: 70,
    heightCm: 172,
    activityLevel: 'moderately_active',
  },
  {
    email: 'elizabeth.test@biohackher.dev',
    password: 'TestElizabeth2024!',
    preferredName: 'Liz',
    fullName: 'Elizabeth Harrison',
    subscriptionTier: 'premium',
    age: 55,
    weightKg: 60,
    heightCm: 165,
    activityLevel: 'very_active',
  },
  {
    email: 'holly.test@biohackher.dev',
    password: 'TestHolly2024!',
    preferredName: 'Holly',
    fullName: 'Holly Brennan',
    subscriptionTier: 'registered',
    age: 48,
    weightKg: 95,
    heightCm: 158,
    activityLevel: 'sedentary',
  },
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const results: { email: string; status: string; userId?: string; error?: string }[] = [];

    for (const testUser of TEST_USERS) {
      try {
        // Check if user already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === testUser.email);

        let userId: string;

        if (existingUser) {
          userId = existingUser.id;
          results.push({
            email: testUser.email,
            status: 'exists',
            userId,
          });
        } else {
          // Create new user
          const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testUser.email,
            password: testUser.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
              preferred_name: testUser.preferredName,
            },
          });

          if (createError) throw createError;
          userId = newUser.user.id;
          
          results.push({
            email: testUser.email,
            status: 'created',
            userId,
          });
        }

        // Ensure profile exists and update it
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .upsert({
            user_id: userId,
            preferred_name: testUser.preferredName,
            email: testUser.email,
            onboarding_completed: true,
            country: 'AU',
            language: 'en-AU',
            currency: 'AUD',
            measurement_system: 'metric',
            timezone: 'Australia/Sydney',
          }, { onConflict: 'user_id' });

        if (profileError) {
          console.error(`Profile upsert failed for ${testUser.email}:`, profileError);
          throw profileError;
        }

        // Set up subscription
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        
        const { error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            subscription_tier: testUser.subscriptionTier,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: futureDate.toISOString(),
            daily_submissions_count: 0,
          }, { onConflict: 'user_id' });

        if (subError) {
          console.error(`Subscription upsert failed for ${testUser.email}:`, subError);
          throw subError;
        }

        // Set up health profile
        const dateOfBirth = new Date();
        dateOfBirth.setFullYear(dateOfBirth.getFullYear() - testUser.age);

        const { error: healthError } = await supabaseAdmin
          .from('user_health_profile')
          .upsert({
            user_id: userId,
            date_of_birth: dateOfBirth.toISOString().split('T')[0],
            weight_kg: testUser.weightKg,
            height_cm: testUser.heightCm,
            activity_level: normalizeActivityLevel(testUser.activityLevel),
          }, { onConflict: 'user_id' });

        if (healthError) {
          console.error(`Health profile upsert failed for ${testUser.email}:`, healthError);
          throw healthError;
        }

        // Small delay to prevent race conditions
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (userError) {
        console.error(`Error creating user ${testUser.email}:`, userError);
        results.push({
          email: testUser.email,
          status: 'error',
          error: userError instanceof Error ? userError.message : 'Unknown error',
        });
      }
    }

    // Check if any users failed
    const hasErrors = results.some(r => r.status === 'error');

    return new Response(
      JSON.stringify({
        success: !hasErrors,
        message: hasErrors ? 'Some test users failed to seed' : 'Test users seeding complete',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error seeding test users:', error);
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
