import { supabase } from "@/integrations/supabase/client";

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingItemId?: string;
}

interface ProtocolItemToCheck {
  name: string;
  item_type: string;
}

/**
 * Normalizes item name for comparison
 * - Lowercase
 * - Trim whitespace
 * - Normalize multiple spaces to single space
 */
export const normalizeItemName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
};

/**
 * Check if a single item already exists in user's protocols
 */
export const checkDuplicateItem = async (
  userId: string,
  item: ProtocolItemToCheck
): Promise<DuplicateCheckResult> => {
  // Fetch all active protocol IDs for user
  const { data: protocols } = await supabase
    .from('protocols')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!protocols || protocols.length === 0) {
    return { isDuplicate: false };
  }

  const protocolIds = protocols.map(p => p.id);
  const normalizedName = normalizeItemName(item.name);

  // Check for existing item with same name AND type
  const { data: existing } = await supabase
    .from('protocol_items')
    .select('id, name, item_type')
    .in('protocol_id', protocolIds)
    .eq('is_active', true);

  if (existing) {
    const match = existing.find(e => 
      normalizeItemName(e.name) === normalizedName && e.item_type === item.item_type
    );
    if (match) {
      return { isDuplicate: true, existingItemId: match.id };
    }
  }

  return { isDuplicate: false };
};

/**
 * Filter out duplicates from a batch of items
 * Returns only the items that don't already exist
 */
export const filterDuplicateItems = async <T extends ProtocolItemToCheck>(
  userId: string,
  items: T[]
): Promise<{ uniqueItems: T[]; duplicateItems: T[] }> => {
  if (items.length === 0) {
    return { uniqueItems: [], duplicateItems: [] };
  }

  // Fetch all active protocol IDs for user
  const { data: protocols } = await supabase
    .from('protocols')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!protocols || protocols.length === 0) {
    return { uniqueItems: items, duplicateItems: [] };
  }

  const protocolIds = protocols.map(p => p.id);

  // Fetch all existing items
  const { data: existingItems } = await supabase
    .from('protocol_items')
    .select('name, item_type')
    .in('protocol_id', protocolIds)
    .eq('is_active', true);

  if (!existingItems || existingItems.length === 0) {
    return { uniqueItems: items, duplicateItems: [] };
  }

  // Create lookup set for O(1) duplicate detection
  const existingSet = new Set(
    existingItems.map(e => 
      `${normalizeItemName(e.name)}|${e.item_type}`
    )
  );

  const uniqueItems: T[] = [];
  const duplicateItems: T[] = [];

  for (const item of items) {
    const key = `${normalizeItemName(item.name)}|${item.item_type}`;
    if (existingSet.has(key)) {
      duplicateItems.push(item);
    } else {
      uniqueItems.push(item);
      // Add to set to prevent duplicates within the batch itself
      existingSet.add(key);
    }
  }

  return { uniqueItems, duplicateItems };
};

/**
 * Fetch existing items as a Set for quick lookup (name|type format)
 * Used for UI components that need to check duplicates without making repeated API calls
 */
export const fetchExistingItemsSet = async (
  userId: string
): Promise<Set<string>> => {
  const { data: protocols } = await supabase
    .from('protocols')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (!protocols || protocols.length === 0) {
    return new Set();
  }

  const protocolIds = protocols.map(p => p.id);

  const { data: existingItems } = await supabase
    .from('protocol_items')
    .select('name, item_type')
    .in('protocol_id', protocolIds)
    .eq('is_active', true);

  if (!existingItems || existingItems.length === 0) {
    return new Set();
  }

  return new Set(
    existingItems.map(e => `${normalizeItemName(e.name)}|${e.item_type}`)
  );
};
