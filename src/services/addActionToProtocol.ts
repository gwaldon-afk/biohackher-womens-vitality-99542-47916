import { supabase } from "@/integrations/supabase/client";
import type { ActionItem } from "@/components/profile/ActionPreviewDrawer";

interface AddActionResult {
  success: boolean;
  protocolItemId?: string;
  error?: string;
}

const frequencyMap: Record<string, 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed'> = {
  'daily': 'daily',
  'once daily': 'daily',
  'twice daily': 'twice_daily',
  'twice a day': 'twice_daily',
  'three times daily': 'three_times_daily',
  'weekly': 'weekly',
  'as needed': 'as_needed',
};

function parseFrequency(freq?: string): 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed' {
  if (!freq) return 'daily';
  const lower = freq.toLowerCase();
  return frequencyMap[lower] || 'daily';
}

export async function addActionToProtocol(
  userId: string,
  action: ActionItem
): Promise<AddActionResult> {
  try {
    // Get or create user's active protocol
    const { data: existingProtocol, error: fetchError } = await supabase
      .from('protocols')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching protocol:', fetchError);
      return { success: false, error: fetchError.message };
    }

    let protocolId = existingProtocol?.id;

    // Create new protocol if none exists
    if (!protocolId) {
      const { data: newProtocol, error: createError } = await supabase
        .from('protocols')
        .insert({
          user_id: userId,
          name: 'My 90-Day Plan',
          description: 'Personalised protocol based on your assessments',
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating protocol:', createError);
        return { success: false, error: createError.message };
      }

      protocolId = newProtocol.id;
    }

    // Check if item already exists in protocol
    const { data: existingItem } = await supabase
      .from('protocol_items')
      .select('id')
      .eq('protocol_id', protocolId)
      .eq('name', action.name)
      .eq('item_type', action.itemType)
      .maybeSingle();

    if (existingItem) {
      return { success: false, error: 'Item already exists in your protocol' };
    }

    // Add item to protocol
    const { data: newItem, error: insertError } = await supabase
      .from('protocol_items')
      .insert({
        protocol_id: protocolId,
        name: action.name,
        description: action.description,
        item_type: action.itemType,
        dosage: action.dosage || null,
        frequency: parseFrequency(action.frequency),
        time_of_day: action.timeOfDay || null,
        is_active: true,
        included_in_plan: true,
        notes: action.expectedImpact 
          ? `Expected impact: ${action.expectedImpact}. Priority: ${action.priorityTier}. Source: ${action.sourceAssessment}`
          : `Priority: ${action.priorityTier}. Source: ${action.sourceAssessment}`,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error adding protocol item:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, protocolItemId: newItem.id };
  } catch (error) {
    console.error('Error in addActionToProtocol:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
