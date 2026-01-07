import { supabase } from '@/integrations/supabase/client';
import { filterDuplicateItems } from '@/utils/protocolDuplicateCheck';

export interface ProtocolRecommendation {
  immediate: any[];
  foundation: any[];
  optimization: any[];
}

export type SourceType = 'lis' | 'hormone_compass' | 'symptom' | 'goal' | 'nutrition';

/**
 * Save protocol recommendations to the database for user review
 */
export const saveProtocolRecommendation = async (
  userId: string,
  sourceAssessmentId: string,
  sourceType: SourceType,
  protocol: ProtocolRecommendation
): Promise<{ id: string } | null> => {
  try {
    // Check if a recommendation already exists for this assessment
    const { data: existing } = await supabase
      .from('protocol_recommendations')
      .select('id')
      .eq('user_id', userId)
      .eq('source_assessment_id', sourceAssessmentId)
      .eq('source_type', sourceType)
      .maybeSingle();

    if (existing) {
      // Update existing recommendation
      const { data, error } = await supabase
        .from('protocol_recommendations')
        .update({
          protocol_data: protocol as any,
          status: 'pending',
          accepted_at: null,
          dismissed_at: null
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    }

    // Create new recommendation
    const { data, error } = await supabase
      .from('protocol_recommendations')
      .insert({
        user_id: userId,
        source_assessment_id: sourceAssessmentId,
        source_type: sourceType,
        protocol_data: protocol as any,
        status: 'pending'
      })
      .select('id')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error saving protocol recommendation:', error);
    return null;
  }
};

/**
 * Accept selected items from a recommendation and create/update protocols
 */
export const acceptProtocolRecommendation = async (
  userId: string,
  recommendationId: string,
  selectedItems: any[],
  protocolName: string,
  sourceType: SourceType
): Promise<{ protocolId: string; skippedDuplicates?: number } | null> => {
  try {
    // Get or create active protocol
    let { data: existingProtocol } = await supabase
      .from('protocols')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    let protocolId: string;

    if (!existingProtocol) {
      // Create new protocol
      const { data: newProtocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: userId,
          name: protocolName,
          description: `Personalized protocol from ${sourceType} assessment`,
          source_recommendation_id: recommendationId,
          source_type: sourceType,
          is_active: true
        })
        .select('id')
        .single();

      if (protocolError) throw protocolError;
      protocolId = newProtocol.id;
    } else {
      protocolId = existingProtocol.id;
    }

    // Map selected items with item_type for duplicate checking
    const itemsWithType = selectedItems.map(item => ({
      ...item,
      name: item.name,
      item_type: item.item_type || inferItemType(item),
    }));

    // Filter out duplicates
    const { uniqueItems, duplicateItems } = await filterDuplicateItems(userId, itemsWithType);

    if (uniqueItems.length === 0) {
      console.log('All items are duplicates, skipping insert');
      return { protocolId, skippedDuplicates: duplicateItems.length };
    }

    // Map unique items to protocol_items format
    const protocolItems = uniqueItems.map(item => ({
      protocol_id: protocolId,
      name: item.name,
      description: item.description || '',
      dosage: item.dosage || null,
      frequency: item.frequency || 'daily',
      time_of_day: item.time_of_day || ['morning'],
      item_type: item.item_type,
      is_active: true,
      priority_tier: item.priority_tier || 'foundation',
      evidence_level: item.evidence_level || 'moderate',
      lis_pillar_contribution: item.lis_pillar_contribution || [],
      impact_weight: item.impact_weight || 5,
      notes: item.relevance || item.notes || null
    }));

    // Insert protocol items
    const { error: itemsError } = await supabase
      .from('protocol_items')
      .insert(protocolItems);

    if (itemsError) throw itemsError;

    // Update recommendation status
    const { error: updateError } = await supabase
      .from('protocol_recommendations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', recommendationId);

    if (updateError) throw updateError;

    return { protocolId, skippedDuplicates: duplicateItems.length };
  } catch (error) {
    console.error('Error accepting protocol recommendation:', error);
    return null;
  }
};

/**
 * Infer item type from item characteristics
 */
const inferItemType = (item: any): 'supplement' | 'habit' | 'therapy' | 'exercise' | 'diet' => {
  const name = (item.name || '').toLowerCase();
  const desc = (item.description || '').toLowerCase();
  const combined = name + ' ' + desc;

  // Check for supplement indicators
  if (
    combined.includes('mg') ||
    combined.includes('vitamin') ||
    combined.includes('supplement') ||
    combined.includes('omega') ||
    combined.includes('magnesium') ||
    combined.includes('ashwagandha') ||
    combined.includes('probiotic')
  ) {
    return 'supplement';
  }

  // Check for exercise indicators
  if (
    combined.includes('exercise') ||
    combined.includes('workout') ||
    combined.includes('strength') ||
    combined.includes('cardio') ||
    combined.includes('movement')
  ) {
    return 'exercise';
  }

  // Check for therapy indicators
  if (
    combined.includes('therapy') ||
    combined.includes('sauna') ||
    combined.includes('cold') ||
    combined.includes('massage')
  ) {
    return 'therapy';
  }

  // Check for diet indicators
  if (
    combined.includes('diet') ||
    combined.includes('eat') ||
    combined.includes('food') ||
    combined.includes('meal') ||
    combined.includes('protein')
  ) {
    return 'diet';
  }

  // Default to habit
  return 'habit';
};

/**
 * Dismiss a protocol recommendation
 */
export const dismissProtocolRecommendation = async (
  recommendationId: string,
  reason?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('protocol_recommendations')
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString(),
        notes: reason || null
      })
      .eq('id', recommendationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    return false;
  }
};
