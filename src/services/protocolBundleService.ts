import { supabase } from "@/integrations/supabase/client";
import { getProducts } from "./productService";

export interface BundleItem {
  protocol_item_id: string;
  product_id: string | null;
  name: string;
  price: number;
  dosage: string | null;
  frequency: string;
}

export interface BundleCalculation {
  items: BundleItem[];
  totalItems: number;
  basePrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  eligibleForDiscount: boolean;
}

/**
 * Calculate bundle pricing with automatic discounts
 * - 10% discount for 3-5 items
 * - 15% discount for 6-9 items
 * - 20% discount for 10+ items
 */
export const calculateBundlePrice = async (
  protocolId: string
): Promise<BundleCalculation> => {
  // Fetch protocol items
  const { data: protocolItems, error: itemsError } = await supabase
    .from("protocol_items")
    .select("*")
    .eq("protocol_id", protocolId)
    .eq("is_active", true);

  if (itemsError) throw itemsError;
  if (!protocolItems || protocolItems.length === 0) {
    return {
      items: [],
      totalItems: 0,
      basePrice: 0,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: 0,
      eligibleForDiscount: false,
    };
  }

  // Fetch all products to match with protocol items
  const products = await getProducts();
  const bundleItems: BundleItem[] = [];
  let basePrice = 0;

  // Match protocol items with products
  for (const item of protocolItems) {
    let product = null;
    
    // If product_id exists, use it directly
    if (item.product_id) {
      product = products.find(p => p.id === item.product_id);
    } else {
      // Try to match by name (supplement items only)
      if (item.item_type === 'supplement') {
        const itemNameLower = item.name.toLowerCase();
        product = products.find(p => 
          p.name.toLowerCase().includes(itemNameLower) || 
          itemNameLower.includes(p.name.toLowerCase())
        );
      }
    }

    if (product && product.price_usd) {
      bundleItems.push({
        protocol_item_id: item.id,
        product_id: product.id,
        name: item.name,
        price: product.price_usd,
        dosage: item.dosage,
        frequency: item.frequency,
      });
      basePrice += product.price_usd;
    }
  }

  // Calculate discount based on item count
  const totalItems = bundleItems.length;
  let discountPercentage = 0;

  if (totalItems >= 10) {
    discountPercentage = 20;
  } else if (totalItems >= 6) {
    discountPercentage = 15;
  } else if (totalItems >= 3) {
    discountPercentage = 10;
  }

  const discountAmount = (basePrice * discountPercentage) / 100;
  const finalPrice = basePrice - discountAmount;

  return {
    items: bundleItems,
    totalItems,
    basePrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    eligibleForDiscount: discountPercentage > 0,
  };
};

/**
 * Create a protocol bundle record in the database
 */
export const createProtocolBundle = async (
  userId: string,
  protocolId: string,
  bundleName: string,
  bundleCalculation: BundleCalculation
) => {
  const { data, error } = await supabase
    .from("protocol_bundles")
    .insert([{
      user_id: userId,
      protocol_id: protocolId,
      bundle_name: bundleName,
      total_items: bundleCalculation.totalItems,
      base_price: bundleCalculation.basePrice,
      discount_amount: bundleCalculation.discountAmount,
      final_price: bundleCalculation.finalPrice,
      discount_percentage: bundleCalculation.discountPercentage,
      items_snapshot: bundleCalculation.items as any,
      bundle_status: 'pending',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};
