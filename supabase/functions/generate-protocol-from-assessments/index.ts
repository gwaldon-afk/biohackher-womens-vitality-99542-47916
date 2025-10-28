import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Intervention mapping based on assessment results - ALL 23 ASSESSMENTS
const INTERVENTION_MAP: Record<string, any> = {
  'brain': {
    'cognitive-function': {
      poor: [
        { type: 'supplement', name: 'Omega-3 DHA (1000mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Lion\'s Mane Mushroom', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Brain Training Games (15 min)', frequency: 'daily', time_of_day: ['afternoon'] },
        { type: 'therapy', name: 'Mindfulness Meditation', frequency: 'daily', time_of_day: ['morning', 'evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'B-Complex Vitamins', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Memory Practice Exercises', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
    },
    'brain-fog': {
      poor: [
        { type: 'supplement', name: 'CoQ10', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Morning Hydration (500ml)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'exercise', name: '10-min Morning Walk', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Magnesium L-Threonate', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'habit', name: 'Deep Breathing Breaks', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
    },
    'headaches': {
      poor: [
        { type: 'supplement', name: 'Magnesium Glycinate (400mg)', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'supplement', name: 'Riboflavin (B2) 400mg', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Headache Trigger Journal', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'therapy', name: 'Stress Reduction Techniques', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'CoQ10 (100mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Regular Hydration Tracking', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
      ],
    },
    'memory-issues': {
      poor: [
        { type: 'supplement', name: 'Phosphatidylserine (100mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Bacopa Monnieri', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Memory Palace Technique', frequency: 'daily', time_of_day: ['afternoon'] },
        { type: 'exercise', name: 'Aerobic Exercise (30 min)', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Ginkgo Biloba', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Mental Rehearsal Practice', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'menopause-brain-health': {
      poor: [
        { type: 'supplement', name: 'Omega-3 (EPA/DHA)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Black Cohosh', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'therapy', name: 'Cognitive Behavioral Therapy', frequency: 'weekly', time_of_day: ['afternoon'] },
        { type: 'habit', name: 'Brain-Stimulating Activities', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'Vitamin E (400 IU)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Social Engagement Activities', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
    },
  },
  'body': {
    'energy-levels': {
      poor: [
        { type: 'supplement', name: 'Iron + Vitamin C', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'B12 (Methylcobalamin)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'exercise', name: 'Light Morning Movement', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'diet', name: 'Protein-Rich Breakfast', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'CoQ10 (Ubiquinol)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Energy Check-In Breaks', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
    },
    'athletic-performance': {
      poor: [
        { type: 'supplement', name: 'Creatine Monohydrate (5g)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Beta-Alanine (3-5g)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'exercise', name: 'Progressive Strength Training', frequency: 'three_times_weekly', time_of_day: ['morning', 'afternoon'] },
        { type: 'therapy', name: 'Sports Massage', frequency: 'weekly', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Whey Protein (25g)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Performance Tracking', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'physical-performance': {
      poor: [
        { type: 'exercise', name: 'Strength Training (20 min)', frequency: 'three_times_weekly', time_of_day: ['morning', 'afternoon'] },
        { type: 'supplement', name: 'Creatine Monohydrate', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'therapy', name: 'Physical Therapy Exercises', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'exercise', name: 'Mobility Work (10 min)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Collagen Peptides', frequency: 'daily', time_of_day: ['morning'] },
      ],
    },
    'recovery-optimization': {
      poor: [
        { type: 'supplement', name: 'Tart Cherry Extract', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'supplement', name: 'Magnesium Threonate', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'therapy', name: 'Compression Therapy', frequency: 'three_times_weekly', time_of_day: ['evening'] },
        { type: 'habit', name: 'HRV Tracking', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Omega-3 (EPA/DHA)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Active Recovery Sessions', frequency: 'twice_weekly', time_of_day: ['afternoon'] },
      ],
    },
    'body-composition': {
      poor: [
        { type: 'diet', name: 'Protein Optimization (1.6g/kg)', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'exercise', name: 'Resistance Training', frequency: 'four_times_weekly', time_of_day: ['morning', 'afternoon'] },
        { type: 'supplement', name: 'CLA (3g)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Body Composition Tracking', frequency: 'weekly', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Green Tea Extract', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Metabolic Rate Optimization', frequency: 'daily', time_of_day: ['morning'] },
      ],
    },
    'joint-pain': {
      poor: [
        { type: 'supplement', name: 'Glucosamine + Chondroitin', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Curcumin (500mg)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'therapy', name: 'Physical Therapy', frequency: 'twice_weekly', time_of_day: ['afternoon'] },
        { type: 'exercise', name: 'Low-Impact Movement', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Omega-3 (high EPA)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Joint Mobility Routine', frequency: 'daily', time_of_day: ['morning'] },
      ],
    },
    'weight-changes': {
      poor: [
        { type: 'diet', name: 'Metabolic Optimization Plan', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'exercise', name: 'HIIT Training (20 min)', frequency: 'three_times_weekly', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Berberine (500mg)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'habit', name: 'Metabolic Health Tracking', frequency: 'daily', time_of_day: ['morning'] },
      ],
      fair: [
        { type: 'supplement', name: 'Chromium Picolinate', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Mindful Eating Practice', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
      ],
    },
    'gut': {
      poor: [
        { type: 'supplement', name: 'Multi-Strain Probiotic', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'L-Glutamine (5g)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'diet', name: 'Gut-Healing Protocol', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'habit', name: 'Food Symptom Journal', frequency: 'daily', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Digestive Enzymes', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'diet', name: 'Prebiotic Fiber Increase', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
      ],
    },
    'bloating': {
      poor: [
        { type: 'supplement', name: 'Peppermint Oil Capsules', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'supplement', name: 'Digestive Enzymes', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'diet', name: 'Low-FODMAP Elimination', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'habit', name: 'Bloating Trigger Tracking', frequency: 'daily', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Ginger Extract', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
        { type: 'habit', name: 'Mindful Eating & Chewing', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
      ],
    },
  },
  'balance': {
    'anxiety': {
      poor: [
        { type: 'supplement', name: 'L-Theanine (200mg)', frequency: 'twice_daily', time_of_day: ['morning', 'afternoon'] },
        { type: 'supplement', name: 'Magnesium Glycinate', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'therapy', name: 'CBT for Anxiety', frequency: 'weekly', time_of_day: ['afternoon'] },
        { type: 'habit', name: 'Box Breathing (4-4-4-4)', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'Ashwagandha KSM-66', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Progressive Muscle Relaxation', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'mood': {
      poor: [
        { type: 'supplement', name: '5-HTP (100mg)', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'supplement', name: 'Vitamin D3 (2000 IU)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'exercise', name: 'Aerobic Exercise (30 min)', frequency: 'daily', time_of_day: ['morning', 'afternoon'] },
        { type: 'therapy', name: 'Talk Therapy', frequency: 'weekly', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'Omega-3 (EPA 1000mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Gratitude Journaling', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'stress-assessment': {
      poor: [
        { type: 'supplement', name: 'Ashwagandha', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'therapy', name: 'Meditation Practice (10 min)', frequency: 'daily', time_of_day: ['morning', 'evening'] },
        { type: 'habit', name: 'Stress Journal', frequency: 'daily', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'L-Theanine', frequency: 'daily', time_of_day: ['afternoon'] },
        { type: 'habit', name: 'Breathing Exercises', frequency: 'daily', time_of_day: ['afternoon'] },
      ],
    },
    'sleep': {
      poor: [
        { type: 'supplement', name: 'Magnesium Glycinate', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'habit', name: 'Screen-Free Hour Before Bed', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'therapy', name: 'Sleep Hygiene Routine', frequency: 'daily', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Glycine (3g)', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'habit', name: 'Consistent Sleep Schedule', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'hot-flashes': {
      poor: [
        { type: 'supplement', name: 'Black Cohosh (40mg)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'supplement', name: 'Sage Extract (300mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Cooling Breathwork', frequency: 'daily', time_of_day: ['morning', 'afternoon', 'evening'] },
        { type: 'therapy', name: 'Acupuncture for Hot Flashes', frequency: 'weekly', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'Vitamin E (400 IU)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Trigger Identification Journal', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'night-sweats': {
      poor: [
        { type: 'supplement', name: 'Black Cohosh', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'supplement', name: 'Magnesium Glycinate', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'habit', name: 'Bedroom Temperature Optimization', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'therapy', name: 'Sleep Environment Consultation', frequency: 'once', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'Vitamin E', frequency: 'daily', time_of_day: ['evening'] },
        { type: 'habit', name: 'Cooling Sheet Protocol', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'irregular-periods': {
      poor: [
        { type: 'supplement', name: 'Vitex (Chasteberry)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Myo-Inositol (2g)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'habit', name: 'Cycle Tracking App', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'therapy', name: 'Hormone Consultation', frequency: 'monthly', time_of_day: ['afternoon'] },
      ],
      fair: [
        { type: 'supplement', name: 'B-Complex High Potency', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Stress Management for Hormones', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'sexual-function': {
      poor: [
        { type: 'supplement', name: 'Maca Root (1500mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'DHEA (25mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'therapy', name: 'Pelvic Floor Therapy', frequency: 'weekly', time_of_day: ['afternoon'] },
        { type: 'habit', name: 'Intimacy Communication Practice', frequency: 'weekly', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'L-Arginine', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Kegel Exercise Routine', frequency: 'daily', time_of_day: ['morning', 'evening'] },
      ],
    },
  },
  'beauty': {
    'skin-health': {
      poor: [
        { type: 'supplement', name: 'Collagen Peptides (20g)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Vitamin C (2000mg)', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
        { type: 'therapy', name: 'Red Light Therapy', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Advanced Skincare Routine', frequency: 'daily', time_of_day: ['morning', 'evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Hyaluronic Acid (200mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Sun Protection Protocol', frequency: 'daily', time_of_day: ['morning'] },
      ],
    },
    'hair-thinning': {
      poor: [
        { type: 'supplement', name: 'Biotin (5000mcg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Saw Palmetto', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Marine Collagen', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'therapy', name: 'Scalp Massage Therapy', frequency: 'daily', time_of_day: ['evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Zinc (30mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Scalp Health Routine', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
    'appearance-concerns': {
      poor: [
        { type: 'supplement', name: 'NMN (500mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'supplement', name: 'Resveratrol (500mg)', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'therapy', name: 'Cellular Health Consultation', frequency: 'monthly', time_of_day: ['afternoon'] },
        { type: 'habit', name: 'Comprehensive Anti-Aging Protocol', frequency: 'daily', time_of_day: ['morning', 'evening'] },
      ],
      fair: [
        { type: 'supplement', name: 'Antioxidant Complex', frequency: 'daily', time_of_day: ['morning'] },
        { type: 'habit', name: 'Cellular Vitality Tracking', frequency: 'daily', time_of_day: ['evening'] },
      ],
    },
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Generating protocol for user:', user.id);

    // 1. Fetch user's assessment completions (both pillar and symptom assessments)
    const { data: pillarAssessments, error: pillarError } = await supabase
      .from('user_assessment_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (pillarError) throw pillarError;

    // Fetch symptom assessments (including energy-levels)
    const { data: symptomAssessments, error: symptomError } = await supabase
      .from('symptom_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (symptomError) throw symptomError;

    // Combine both assessment types
    const assessments = [
      ...(pillarAssessments || []).map(a => ({
        ...a,
        source: 'pillar'
      })),
      ...(symptomAssessments || []).map(a => ({
        user_id: a.user_id,
        pillar: 'body',
        assessment_id: a.symptom_type,
        score: a.overall_score,
        score_category: a.score_category,
        completed_at: a.completed_at,
        source: 'symptom'
      }))
    ];

    if (!assessments || assessments.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No assessments found. Please complete an assessment first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Analyze assessments to identify focus areas
    const focusAreas: any[] = [];
    const assessmentsByPillar: Record<string, any[]> = {};
    let shouldEnableEnergyLoop = false;

    assessments.forEach(assessment => {
      if (!assessment.pillar || !assessment.score) return;
      
      if (!assessmentsByPillar[assessment.pillar]) {
        assessmentsByPillar[assessment.pillar] = [];
      }
      assessmentsByPillar[assessment.pillar].push(assessment);

      // Identify low-scoring assessments that need attention
      const scoreCategory = assessment.score < 40 ? 'poor' : assessment.score < 65 ? 'fair' : 'good';
      
      // Check if energy levels are critically low
      if (assessment.assessment_id === 'energy-levels' && assessment.score < 60) {
        shouldEnableEnergyLoop = true;
        console.log('Low energy detected, will enable Energy Loop Module');
      }
      
      if (scoreCategory === 'poor' || scoreCategory === 'fair') {
        focusAreas.push({
          pillar: assessment.pillar,
          assessment_id: assessment.assessment_id,
          score: assessment.score,
          severity: scoreCategory,
          source: assessment.source
        });
      }
    });

    // Auto-enable Energy Loop Module if needed
    if (shouldEnableEnergyLoop) {
      await supabase
        .from('profiles')
        .update({ energy_loop_enabled: true })
        .eq('user_id', user.id);
      
      console.log('Auto-enabled Energy Loop Module for user due to low energy score');
    }

    console.log('Focus areas identified:', focusAreas);

    // 3. Generate protocol items based on focus areas
    const protocolItems: any[] = [];
    const addedItems = new Set<string>();

    focusAreas.forEach(area => {
      const pillarInterventions = INTERVENTION_MAP[area.pillar];
      if (!pillarInterventions) return;

      const assessmentInterventions = pillarInterventions[area.assessment_id];
      if (!assessmentInterventions) return;

      const interventions = assessmentInterventions[area.severity] || [];
      
      interventions.forEach((item: any) => {
        const itemKey = `${item.type}-${item.name}`;
        if (!addedItems.has(itemKey)) {
          protocolItems.push({
            ...item,
            reason: `Recommended for ${area.assessment_id} (score: ${area.score})`,
            pillar: area.pillar
          });
          addedItems.add(itemKey);
        }
      });
    });

    console.log('Generated protocol items:', protocolItems.length);

    // 4. Use AI to enhance recommendations with personalization
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (lovableApiKey) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a health optimization expert. Review the protocol items and provide 2-3 additional personalized recommendations based on the user\'s assessment data. Keep each recommendation concise (under 50 words). Return as JSON array with format: [{"type": "supplement|habit|exercise|therapy|diet", "name": "item name", "frequency": "daily|twice_daily|weekly", "time_of_day": ["morning"|"afternoon"|"evening"], "reason": "why this helps"}]'
              },
              {
                role: 'user',
                content: `Assessment data: ${JSON.stringify(focusAreas)}. Current protocol items: ${JSON.stringify(protocolItems)}`
              }
            ],
            temperature: 0.7,
            max_tokens: 500
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiContent = aiData.choices?.[0]?.message?.content;
          if (aiContent) {
            try {
              const aiItems = JSON.parse(aiContent);
              if (Array.isArray(aiItems)) {
                aiItems.forEach((item: any) => {
                  const itemKey = `${item.type}-${item.name}`;
                  if (!addedItems.has(itemKey)) {
                    protocolItems.push(item);
                    addedItems.add(itemKey);
                  }
                });
              }
            } catch (parseError) {
              console.log('Could not parse AI recommendations:', parseError);
            }
          }
        }
      } catch (aiError) {
        console.log('AI enhancement failed, continuing with base recommendations:', aiError);
      }
    }

    // 5. Check for existing active protocol
    const { data: existingProtocols } = await supabase
      .from('protocols')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true);

    let protocolId: string;

    if (existingProtocols && existingProtocols.length > 0) {
      // Update existing protocol
      protocolId = existingProtocols[0].id;
      console.log('Updating existing protocol:', protocolId);
    } else {
      // Create new protocol
      const topPillars = Object.keys(assessmentsByPillar)
        .slice(0, 2)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' & ');
      
      const { data: newProtocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          name: `${topPillars} Optimization Protocol`,
          description: `Personalized protocol based on your assessment results`,
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (protocolError) throw protocolError;
      protocolId = newProtocol.id;
      console.log('Created new protocol:', protocolId);
    }

    // 6. Insert protocol items (deactivate old ones first if updating)
    if (existingProtocols && existingProtocols.length > 0) {
      await supabase
        .from('protocol_items')
        .update({ is_active: false })
        .eq('protocol_id', protocolId);
    }

    const itemsToInsert = protocolItems.map(item => ({
      protocol_id: protocolId,
      item_type: item.type,
      name: item.name,
      description: item.reason,
      frequency: item.frequency,
      time_of_day: item.time_of_day,
      is_active: true,
    }));

    const { error: insertError } = await supabase
      .from('protocol_items')
      .insert(itemsToInsert);

    if (insertError) throw insertError;

    console.log(`Successfully created/updated protocol with ${protocolItems.length} items`);

    return new Response(
      JSON.stringify({
        success: true,
        protocol_id: protocolId,
        items_count: protocolItems.length,
        focus_areas: focusAreas,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating protocol:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});