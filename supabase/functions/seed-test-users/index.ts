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
  protocolFocus: string[]; // Areas to focus protocol items on
}

interface ProtocolItemConfig {
  name: string;
  description: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[];
  dosage?: string;
  notes?: string;
}

// Protocol items library by focus area
const PROTOCOL_ITEMS_LIBRARY: Record<string, ProtocolItemConfig[]> = {
  sleep: [
    { name: 'Magnesium Glycinate', description: 'Supports relaxation and sleep quality', item_type: 'supplement', frequency: 'daily', time_of_day: ['evening'], dosage: '300-400mg' },
    { name: 'Sleep Hygiene Routine', description: 'Wind down 1 hour before bed, no screens', item_type: 'habit', frequency: 'daily', time_of_day: ['evening'] },
  ],
  stress: [
    { name: 'Ashwagandha', description: 'Adaptogenic support for stress resilience', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '300mg' },
    { name: 'Morning Meditation', description: '10-minute guided meditation or breathwork', item_type: 'habit', frequency: 'daily', time_of_day: ['morning'] },
  ],
  cognitive: [
    { name: 'Omega-3 Fish Oil', description: 'EPA/DHA for brain health and cognition', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '1000mg EPA+DHA' },
    { name: 'Brain Training', description: '15-minute cognitive exercises or learning', item_type: 'habit', frequency: 'daily', time_of_day: ['morning'] },
  ],
  activity: [
    { name: 'Daily Movement', description: '30 minutes of moderate activity', item_type: 'exercise', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
    { name: 'Strength Training', description: 'Resistance exercises for muscle and bone health', item_type: 'exercise', frequency: 'weekly', time_of_day: ['morning'], notes: '2-3 sessions per week' },
  ],
  nutrition: [
    { name: 'Whole Foods Focus', description: 'Prioritise unprocessed, nutrient-dense foods', item_type: 'diet', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
    { name: 'Vitamin D3 + K2', description: 'Supports bone health and immune function', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '2000 IU D3 + 100mcg K2' },
  ],
  energy: [
    { name: 'CoQ10', description: 'Cellular energy production support', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '100-200mg' },
    { name: 'B-Complex', description: 'Essential B vitamins for energy metabolism', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'] },
  ],
  recovery: [
    { name: 'Curcumin', description: 'Anti-inflammatory support for joint health', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '500mg with piperine' },
    { name: 'Collagen Peptides', description: 'Supports connective tissue and skin health', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '10g' },
    { name: 'Gentle Movement', description: 'Low-impact stretching or yoga', item_type: 'exercise', frequency: 'daily', time_of_day: ['morning'] },
  ],
  metabolic: [
    { name: 'Berberine', description: 'Supports healthy blood sugar metabolism', item_type: 'supplement', frequency: 'twice_daily', time_of_day: ['morning', 'evening'], dosage: '500mg' },
    { name: 'Post-Meal Walk', description: '10-15 minute walk after main meals', item_type: 'habit', frequency: 'daily', time_of_day: ['afternoon', 'evening'] },
  ],
  advanced: [
    { name: 'Creatine Monohydrate', description: 'Supports muscle and cognitive function', item_type: 'supplement', frequency: 'daily', time_of_day: ['morning'], dosage: '5g' },
    { name: 'Cold Exposure', description: 'Brief cold shower for stress resilience', item_type: 'therapy', frequency: 'daily', time_of_day: ['morning'], notes: '30-60 seconds cold at end of shower' },
  ],
};

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
    protocolFocus: ['activity', 'energy', 'nutrition'],
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
    protocolFocus: ['stress', 'nutrition', 'sleep'],
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
    protocolFocus: ['sleep', 'stress', 'cognitive', 'activity'],
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
    protocolFocus: ['advanced', 'cognitive', 'recovery'],
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
    protocolFocus: ['recovery', 'activity', 'nutrition'],
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
    protocolFocus: ['advanced', 'stress', 'sleep'],
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
    protocolFocus: ['stress', 'cognitive', 'activity'],
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
    protocolFocus: ['advanced', 'recovery', 'nutrition'],
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
    protocolFocus: ['metabolic', 'energy', 'activity'],
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

        // === PROTOCOL SEEDING ===
        // Check if protocol already exists
        const { data: existingProtocol } = await supabaseAdmin
          .from('protocols')
          .select('id')
          .eq('user_id', userId)
          .eq('name', 'My Longevity Protocol')
          .eq('is_active', true)
          .maybeSingle();

        let protocolId: string;

        if (existingProtocol) {
          protocolId = existingProtocol.id;
          // Delete existing items to replace with fresh ones
          await supabaseAdmin
            .from('protocol_items')
            .delete()
            .eq('protocol_id', protocolId);
        } else {
          // Create new protocol
          const { data: newProtocol, error: protocolError } = await supabaseAdmin
            .from('protocols')
            .insert({
              user_id: userId,
              name: 'My Longevity Protocol',
              description: `Personalised protocol for ${testUser.preferredName}`,
              is_active: true,
              start_date: new Date().toISOString().split('T')[0],
            })
            .select('id')
            .single();

          if (protocolError) {
            console.error(`Protocol creation failed for ${testUser.email}:`, protocolError);
            throw protocolError;
          }
          protocolId = newProtocol.id;
        }

        // Gather protocol items based on focus areas
        const itemsToInsert: any[] = [];
        for (const focus of testUser.protocolFocus) {
          const focusItems = PROTOCOL_ITEMS_LIBRARY[focus] || [];
          for (const item of focusItems) {
            itemsToInsert.push({
              protocol_id: protocolId,
              name: item.name,
              description: item.description,
              item_type: item.item_type,
              frequency: item.frequency,
              time_of_day: item.time_of_day,
              dosage: item.dosage || null,
              notes: item.notes || null,
              is_active: true,
            });
          }
        }

        // Insert protocol items
        if (itemsToInsert.length > 0) {
          const { error: itemsError } = await supabaseAdmin
            .from('protocol_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.error(`Protocol items failed for ${testUser.email}:`, itemsError);
            // Don't throw - continue with other users
          }
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
