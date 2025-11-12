import { supabase } from "@/integrations/supabase/client";
import { getProducts, Product } from "./productService";

/**
 * Normalize supplement names for better matching
 * Removes special characters, standardizes spacing, handles common variations
 */
const normalizeSupplementName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    // Remove special characters but keep spaces
    .replace(/[()[\]{}\/\-–—]/g, ' ')
    // Normalize multiple spaces
    .replace(/\s+/g, ' ')
    // Remove common suffixes
    .replace(/\s+(supplement|capsule|tablet|powder|extract|complex|form)$/i, '')
    .trim();
};

/**
 * Common supplement synonyms and variations
 */
const SUPPLEMENT_SYNONYMS: Record<string, string[]> = {
  'omega-3': ['fish oil', 'epa', 'dha', 'omega 3', 'omega3'],
  'vitamin b12': ['cobalamin', 'methylcobalamin', 'cyanocobalamin', 'b12'],
  'vitamin d': ['cholecalciferol', 'd3', 'vitamin d3'],
  'magnesium': ['mag', 'magnesium glycinate', 'magnesium citrate', 'magnesium bisglycinate'],
  'b complex': ['vitamin b complex', 'b vitamins', 'b-complex'],
  'coq10': ['coenzyme q10', 'ubiquinone', 'ubiquinol'],
  'ashwagandha': ['withania', 'ashwaganda'],
  'rhodiola': ['rhodiola rosea', 'golden root'],
  'lions mane': ['lion mane', 'lions mane mushroom', 'hericium'],
  'turmeric': ['curcumin', 'curcuma'],
};

/**
 * Calculate string similarity using simple character overlap
 * Returns score 0-1 (higher is better match)
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const normalized1 = normalizeSupplementName(str1);
  const normalized2 = normalizeSupplementName(str2);
  
  // Exact match after normalization
  if (normalized1 === normalized2) return 1.0;
  
  // Contains match (bidirectional)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    const shorter = Math.min(normalized1.length, normalized2.length);
    const longer = Math.max(normalized1.length, normalized2.length);
    return shorter / longer; // 0.5-0.99 range
  }
  
  // Keyword overlap
  const words1 = normalized1.split(/\s+/);
  const words2 = normalized2.split(/\s+/);
  const commonWords = words1.filter(w => words2.includes(w));
  return commonWords.length / Math.max(words1.length, words2.length);
};

/**
 * Check if two supplement names are synonyms
 */
const areSynonyms = (name1: string, name2: string): boolean => {
  const normalized1 = normalizeSupplementName(name1);
  const normalized2 = normalizeSupplementName(name2);
  
  // Check each synonym group
  for (const [key, synonyms] of Object.entries(SUPPLEMENT_SYNONYMS)) {
    const allVariants = [key, ...synonyms];
    const matches1 = allVariants.some(variant => normalized1.includes(variant));
    const matches2 = allVariants.some(variant => normalized2.includes(variant));
    
    if (matches1 && matches2) return true;
  }
  
  return false;
};

/**
 * Auto-match protocol items to products based on name similarity with fuzzy matching
 */
export const autoMatchProtocolItemToProduct = (
  itemName: string,
  itemType: string,
  products: Product[]
): Product | null => {
  // Only match supplements to products
  if (itemType !== 'supplement') {
    return null;
  }

  const normalizedItemName = normalizeSupplementName(itemName);
  
  // Score all products
  const scoredProducts = products.map(product => {
    const normalizedProductName = normalizeSupplementName(product.name);
    let score = 0;
    
    // Exact match after normalization (highest priority)
    if (normalizedItemName === normalizedProductName) {
      score = 100;
    }
    // Synonym match (very high priority)
    else if (areSynonyms(itemName, product.name)) {
      score = 90;
    }
    // Similarity-based scoring
    else {
      const similarity = calculateSimilarity(itemName, product.name);
      score = similarity * 80; // Scale to 0-80 range
    }
    
    return { product, score };
  });
  
  // Sort by score (highest first)
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // Return best match if score is above threshold (30%)
  const bestMatch = scoredProducts[0];
  if (bestMatch && bestMatch.score >= 30) {
    console.log(`Matched "${itemName}" to "${bestMatch.product.name}" (score: ${bestMatch.score.toFixed(1)})`);
    return bestMatch.product;
  }
  
  console.log(`No match found for "${itemName}" (best score: ${bestMatch?.score.toFixed(1) || 0})`);
  return null;
};

/**
 * Batch auto-match all protocol items without product_id
 */
export const batchAutoMatchProtocolItems = async (): Promise<{
  matched: number;
  unmatched: number;
  details: Array<{ itemId: string; itemName: string; productId: string | null; productName: string | null }>;
}> => {
  try {
    // Fetch all protocol items without product_id
    const { data: items, error: itemsError } = await supabase
      .from('protocol_items')
      .select('id, name, item_type, product_id')
      .is('product_id', null)
      .eq('is_active', true);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) {
      return { matched: 0, unmatched: 0, details: [] };
    }

    // Fetch all products
    const products = await getProducts();

    const results = {
      matched: 0,
      unmatched: 0,
      details: [] as Array<{ itemId: string; itemName: string; productId: string | null; productName: string | null }>,
    };

    // Match each item
    for (const item of items) {
      const matchedProduct = autoMatchProtocolItemToProduct(item.name, item.item_type, products);

      if (matchedProduct) {
        // Update the protocol item with product_id
        const { error: updateError } = await supabase
          .from('protocol_items')
          .update({ product_id: matchedProduct.id })
          .eq('id', item.id);

        if (!updateError) {
          results.matched++;
          results.details.push({
            itemId: item.id,
            itemName: item.name,
            productId: matchedProduct.id,
            productName: matchedProduct.name,
          });
        }
      } else {
        results.unmatched++;
        results.details.push({
          itemId: item.id,
          itemName: item.name,
          productId: null,
          productName: null,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in batch auto-match:', error);
    throw error;
  }
};

/**
 * Manually link a protocol item to a product
 */
export const linkProtocolItemToProduct = async (
  protocolItemId: string,
  productId: string | null
): Promise<void> => {
  const { error } = await supabase
    .from('protocol_items')
    .update({ product_id: productId })
    .eq('id', protocolItemId);

  if (error) throw error;
};

/**
 * Get protocol items that need product linking
 */
export const getUnlinkedProtocolItems = async () => {
  const { data, error } = await supabase
    .from('protocol_items')
    .select('*, protocols!inner(name, user_id)')
    .is('product_id', null)
    .eq('item_type', 'supplement')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get all protocol items with their linked products
 */
export const getProtocolItemsWithProducts = async (userId?: string) => {
  let query = supabase
    .from('protocol_items')
    .select(`
      *,
      protocols!inner(name, user_id, is_active),
      products(id, name, brand, price_usd, price_gbp, image_url)
    `)
    .eq('item_type', 'supplement')
    .eq('is_active', true);

  if (userId) {
    query = query.eq('protocols.user_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};
