import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProtocolItem {
  name: string;
  description: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[];
  dosage?: string;
  notes?: string;
}

/**
 * Get user's active protocol or create a new one
 */
export async function getOrCreateUserProtocol(
  userId: string,
  protocolName: string = 'My Health Protocol'
): Promise<string | null> {
  try {
    // Check for existing active protocol
    const { data: existingProtocols, error: fetchError } = await supabase
      .from('protocols')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (existingProtocols && existingProtocols.length > 0) {
      return existingProtocols[0].id;
    }

    // Create new protocol if none exists
    const { data: newProtocol, error: createError } = await supabase
      .from('protocols')
      .insert({
        user_id: userId,
        name: protocolName,
        description: 'Personalized protocol generated from health assessments',
        is_active: true,
        start_date: new Date().toISOString().split('T')[0]
      })
      .select('id')
      .single();

    if (createError) throw createError;

    return newProtocol.id;
  } catch (error) {
    console.error('Error getting/creating protocol:', error);
    return null;
  }
}

/**
 * Generate protocol items from LIS assessment
 */
export async function generateProtocolFromLIS(
  userId: string,
  pillarScores: Record<string, number>
): Promise<boolean> {
  try {
    const protocolId = await getOrCreateUserProtocol(userId, 'Longevity Protocol');
    if (!protocolId) throw new Error('Failed to create protocol');

    const items: ProtocolItem[] = [];

    // Sleep optimization (if score < 60)
    if (pillarScores.sleep < 60) {
      items.push({
        name: 'Sleep Hygiene Routine',
        description: 'Wind down 1 hour before bed: dim lights, no screens, cool room (65-68°F)',
        item_type: 'habit',
        frequency: 'daily',
        time_of_day: ['evening'],
        notes: 'Target: 7-8 hours quality sleep'
      });
      items.push({
        name: 'Magnesium Glycinate',
        description: 'Supports sleep quality and relaxation',
        item_type: 'supplement',
        frequency: 'daily',
        time_of_day: ['evening'],
        dosage: '300-400mg'
      });
    }

    // Stress management (if score < 60)
    if (pillarScores.stress < 60) {
      items.push({
        name: 'Morning Meditation',
        description: '10-minute mindfulness or breathwork practice',
        item_type: 'habit',
        frequency: 'daily',
        time_of_day: ['morning'],
        notes: 'Start with 5 minutes and build up'
      });
      items.push({
        name: 'Adaptogenic Support',
        description: 'Ashwagandha or rhodiola for stress resilience',
        item_type: 'supplement',
        frequency: 'daily',
        time_of_day: ['morning'],
        dosage: 'As directed on product'
      });
    }

    // Physical activity (if score < 60)
    if (pillarScores.activity < 60) {
      items.push({
        name: 'Daily Movement Goal',
        description: '8,000+ steps or 30 minutes moderate exercise',
        item_type: 'exercise',
        frequency: 'daily',
        time_of_day: ['morning', 'afternoon'],
        notes: 'Mix cardio and strength training'
      });
    }

    // Nutrition optimization (if score < 60)
    if (pillarScores.nutrition < 60) {
      items.push({
        name: 'Whole Foods Focus',
        description: '70%+ whole, unprocessed foods at each meal',
        item_type: 'diet',
        frequency: 'daily',
        time_of_day: ['morning', 'afternoon', 'evening'],
        notes: 'Emphasize vegetables, lean protein, healthy fats'
      });
      items.push({
        name: 'Omega-3 Supplement',
        description: 'EPA/DHA for inflammation and brain health',
        item_type: 'supplement',
        frequency: 'daily',
        time_of_day: ['morning'],
        dosage: '1000-2000mg EPA+DHA'
      });
    }

    // Social connection (if score < 60)
    if (pillarScores.social < 60) {
      items.push({
        name: 'Social Connection Time',
        description: 'Meaningful interaction with friends/family',
        item_type: 'habit',
        frequency: 'daily',
        time_of_day: ['afternoon', 'evening'],
        notes: 'Quality over quantity - aim for deep connections'
      });
    }

    // Cognitive engagement (if score < 60)
    if (pillarScores.cognitive < 60) {
      items.push({
        name: 'Brain Training',
        description: '30+ minutes focused cognitive activity (reading, learning, problem-solving)',
        item_type: 'habit',
        frequency: 'daily',
        time_of_day: ['morning', 'afternoon'],
        notes: 'Vary activities to challenge different cognitive domains'
      });
    }

    // Insert all items into database
    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from('protocol_items')
        .insert(
          items.map(item => ({
            protocol_id: protocolId,
            ...item,
            is_active: true
          }))
        );

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error generating LIS protocol:', error);
    throw error;
  }
}

/**
 * Generate protocol items from symptom assessment
 */
export async function generateProtocolFromSymptom(
  userId: string,
  symptomType: string,
  score: number,
  category: string
): Promise<boolean> {
  try {
    const protocolId = await getOrCreateUserProtocol(userId, 'Symptom Management Protocol');
    if (!protocolId) throw new Error('Failed to create protocol');

    const items: ProtocolItem[] = [];

    // Only generate items for poor/fair scores
    if (category === 'poor' || category === 'fair') {
      const symptomLower = symptomType.toLowerCase();

      // Energy-related interventions
      if (symptomLower.includes('energy') || symptomLower.includes('fatigue')) {
        items.push({
          name: 'Energy Optimization',
          description: 'CoQ10 + B-Complex for mitochondrial support',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning'],
          dosage: 'CoQ10 100-200mg, B-Complex as directed'
        });
        items.push({
          name: 'Strategic Rest Breaks',
          description: '5-minute breaks every 90 minutes',
          item_type: 'habit',
          frequency: 'daily',
          time_of_day: ['morning', 'afternoon'],
          notes: 'Prevent energy crashes through pacing'
        });
      }

      // Sleep-related interventions
      if (symptomLower.includes('sleep') || symptomLower.includes('insomnia')) {
        items.push({
          name: 'Sleep Protocol',
          description: 'Magnesium + L-Theanine before bed',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['evening'],
          dosage: 'Mag 300mg, L-Theanine 200mg'
        });
      }

      // Mood/anxiety interventions
      if (symptomLower.includes('mood') || symptomLower.includes('anxiety') || symptomLower.includes('stress')) {
        items.push({
          name: 'Stress Resilience',
          description: 'Ashwagandha for cortisol regulation',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning', 'evening'],
          dosage: '300-600mg standardized extract'
        });
        items.push({
          name: 'Breathwork Practice',
          description: '4-7-8 breathing technique',
          item_type: 'therapy',
          frequency: 'daily',
          time_of_day: ['morning', 'evening'],
          notes: 'Inhale 4s, hold 7s, exhale 8s - repeat 4x'
        });
      }

      // Brain fog/cognitive interventions
      if (symptomLower.includes('brain') || symptomLower.includes('cognitive') || symptomLower.includes('fog')) {
        items.push({
          name: 'Cognitive Support',
          description: 'Omega-3 + Lion\'s Mane for brain health',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning'],
          dosage: 'Omega-3 2g, Lion\'s Mane 500-1000mg'
        });
      }

      // Pain/inflammation interventions
      if (symptomLower.includes('pain') || symptomLower.includes('inflammation') || symptomLower.includes('joint')) {
        items.push({
          name: 'Anti-Inflammatory Protocol',
          description: 'Curcumin + Omega-3 for inflammation',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning', 'evening'],
          dosage: 'Curcumin 500mg (w/ black pepper), Omega-3 2g'
        });
      }
    }

    // Insert items if any were generated
    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from('protocol_items')
        .insert(
          items.map(item => ({
            protocol_id: protocolId,
            ...item,
            is_active: true
          }))
        );

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error generating symptom protocol:', error);
    throw error;
  }
}

/**
 * Generate protocol items from hormone compass stage
 */
export async function generateProtocolFromHormoneStage(
  userId: string,
  stage: string,
  confidence: number
): Promise<boolean> {
  try {
    const protocolId = await getOrCreateUserProtocol(userId, 'Hormone Support Protocol');
    if (!protocolId) throw new Error('Failed to create protocol');

    const items: ProtocolItem[] = [];

    // Stage-specific interventions
    switch (stage) {
      case 'early-peri':
        items.push({
          name: 'Adaptogenic Support',
          description: 'Maca root for hormonal balance',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning'],
          dosage: '1500-3000mg'
        });
        items.push({
          name: 'Cycle Tracking',
          description: 'Monitor cycle changes and symptoms',
          item_type: 'habit',
          frequency: 'daily',
          time_of_day: ['evening'],
          notes: 'Establish baseline patterns for comparison'
        });
        break;

      case 'mid-peri':
        items.push({
          name: 'Hot Flash Management',
          description: 'Black cohosh + Sage extract',
          item_type: 'supplement',
          frequency: 'twice_daily',
          time_of_day: ['morning', 'evening'],
          dosage: 'Black cohosh 40-80mg, Sage 300mg'
        });
        items.push({
          name: 'Cooling Breathwork',
          description: 'Sitali breath for temperature regulation',
          item_type: 'therapy',
          frequency: 'as_needed',
          time_of_day: ['morning', 'afternoon', 'evening'],
          notes: 'Use when hot flashes begin'
        });
        items.push({
          name: 'Magnesium for Sleep',
          description: 'Support sleep disrupted by night sweats',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['evening'],
          dosage: '300-400mg glycinate'
        });
        break;

      case 'late-peri':
      case 'post':
        items.push({
          name: 'Bone Health Support',
          description: 'Vitamin D3 + K2 + Calcium',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning'],
          dosage: 'D3 2000-4000 IU, K2 100mcg, Calcium 500mg'
        });
        items.push({
          name: 'Strength Training',
          description: 'Weight-bearing exercise for bone density',
          item_type: 'exercise',
          frequency: 'three_times_daily',
          time_of_day: ['morning', 'afternoon'],
          notes: 'Focus on major muscle groups'
        });
        items.push({
          name: 'Cardiovascular Support',
          description: 'CoQ10 + Omega-3 for heart health',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['morning'],
          dosage: 'CoQ10 100-200mg, Omega-3 2g'
        });
        break;

      default: // pre-menopause
        items.push({
          name: 'Cycle Support',
          description: 'Evening primrose oil for hormonal balance',
          item_type: 'supplement',
          frequency: 'daily',
          time_of_day: ['evening'],
          dosage: '1000-1500mg'
        });
    }

    // Common items for all stages
    items.push({
      name: 'Phytoestrogen Foods',
      description: 'Include flaxseeds, soy, legumes in diet',
      item_type: 'diet',
      frequency: 'daily',
      time_of_day: ['morning', 'afternoon', 'evening'],
      notes: 'Natural hormonal support through nutrition'
    });

    // Insert items
    if (items.length > 0) {
      const { error: insertError } = await supabase
        .from('protocol_items')
        .insert(
          items.map(item => ({
            protocol_id: protocolId,
            ...item,
            is_active: true
          }))
        );

      if (insertError) throw insertError;
    }

    return true;
  } catch (error) {
    console.error('Error generating hormone protocol:', error);
    throw error;
  }
}

/**
 * Update user health profile after assessment completion
 */
export async function updateUserProfileAfterAssessment(
  userId: string,
  assessmentType: 'lis' | 'symptom' | 'hormone',
  data: any
): Promise<void> {
  try {
    const updates: any = {};

    if (assessmentType === 'lis') {
      updates.latest_lis_score = data.score;
      updates.lis_assessment_date = new Date().toISOString().split('T')[0];
      if (data.isBaseline) {
        updates.baseline_lis_score = data.score;
      }
    } else if (assessmentType === 'symptom') {
      const symptomType = data.symptomType.toLowerCase();
      if (symptomType.includes('energy')) {
        updates.latest_energy_score = data.score;
        updates.energy_assessment_date = new Date().toISOString().split('T')[0];
      }
    } else if (assessmentType === 'hormone') {
      updates.menopause_stage = data.stage;
      updates.menopause_stage_confidence = data.confidence;
      updates.hormone_assessment_date = new Date().toISOString().split('T')[0];
    }

    // Upsert to user_health_profile
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('user_health_profile')
        .upsert({
          user_id: userId,
          ...updates
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    }

    // Enable feature flags in profiles table based on assessment type
    if (assessmentType === 'hormone') {
      await supabase
        .from('profiles')
        .update({ hormone_compass_enabled: true })
        .eq('user_id', userId);
    } else if (assessmentType === 'symptom' && data.symptomType?.includes('energy')) {
      await supabase
        .from('profiles')
        .update({ energy_loop_enabled: true })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Don't throw - profile update failure shouldn't block assessment completion
  }
}
