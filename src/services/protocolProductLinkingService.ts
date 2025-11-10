import { supabase } from "@/integrations/supabase/client";
import { getProducts, Product } from "./productService";

/**
 * Auto-match protocol items to products based on name similarity
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

  const itemNameLower = itemName.toLowerCase().trim();
  
  // Remove common suffixes to improve matching
  const cleanItemName = itemNameLower
    .replace(/\s+(supplement|capsule|tablet|powder|extract|complex)$/i, '')
    .trim();

  // Try exact match first
  let match = products.find(p => 
    p.name.toLowerCase().trim() === itemNameLower ||
    p.name.toLowerCase().trim() === cleanItemName
  );

  if (match) return match;

  // Try contains match
  match = products.find(p => {
    const productNameLower = p.name.toLowerCase();
    return productNameLower.includes(cleanItemName) || cleanItemName.includes(productNameLower);
  });

  if (match) return match;

  // Try keyword matching for common supplements
  const keywords = cleanItemName.split(/\s+/);
  match = products.find(p => {
    const productNameLower = p.name.toLowerCase();
    return keywords.every(keyword => productNameLower.includes(keyword));
  });

  return match || null;
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
