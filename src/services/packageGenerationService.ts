import { supabase } from "@/integrations/supabase/client";
import { ProtocolPackage } from "@/types/packages";
import { addDays } from "date-fns";

interface PackageTierCalculation {
  tier: 'gold' | 'silver' | 'bronze';
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
}

export const generateProtocolPackage = async (
  userId: string,
  protocolId: string
): Promise<ProtocolPackage | null> => {
  try {
    // 1. Fetch protocol items with product mappings
    const { data: items, error: itemsError } = await supabase
      .from('protocol_items')
      .select(`
        *,
        products (
          id,
          name,
          price_gbp,
          evidence_level,
          product_type
        )
      `)
      .eq('protocol_id', protocolId)
      .eq('is_active', true);

    if (itemsError) throw itemsError;
    if (!items || items.length === 0) return null;

    // 2. Calculate tier distribution
    const tierCalc = calculateTierDistribution(items);

    // 3. Calculate pricing
    const basePrice = items.reduce((sum, item) => {
      const product = item.products as any;
      return sum + (product?.price_gbp || 0);
    }, 0);

    // 4. Apply discount rules
    const { finalPrice, discountAmount } = await calculatePackagePrice(
      basePrice,
      'package_full_90',
      userId
    );

    // 5. Create package record
    const { data: pkg, error: pkgError } = await supabase
      .from('protocol_packages')
      .insert({
        user_id: userId,
        protocol_id: protocolId,
        package_name: `90-Day ${tierCalc.tier.toUpperCase()} Protocol Package`,
        tier: tierCalc.tier,
        duration_days: 90,
        total_items_count: items.length,
        gold_items_count: tierCalc.goldCount,
        silver_items_count: tierCalc.silverCount,
        bronze_items_count: tierCalc.bronzeCount,
        base_price: basePrice,
        discount_type: 'percentage',
        discount_amount: discountAmount,
        final_price: finalPrice,
        is_active: true,
        expires_at: addDays(new Date(), 30).toISOString() // 30-day offer expiry
      })
      .select()
      .single();

    if (pkgError) throw pkgError;

    // 6. Link items to package
    const packageItems = items.map((item, idx) => {
      const product = item.products as any;
      return {
        package_id: pkg.id,
        protocol_item_id: item.id,
        product_id: product?.id,
        item_position: idx,
        is_customizable: true
      };
    });

    const { error: itemsInsertError } = await supabase
      .from('package_protocol_items')
      .insert(packageItems);

    if (itemsInsertError) throw itemsInsertError;

    return pkg;
  } catch (error) {
    console.error('Error generating protocol package:', error);
    return null;
  }
};

function calculateTierDistribution(items: any[]): PackageTierCalculation {
  const goldCount = items.filter(i => {
    const product = i.products as any;
    return product?.evidence_level === 'gold';
  }).length;

  const silverCount = items.filter(i => {
    const product = i.products as any;
    return product?.evidence_level === 'silver';
  }).length;

  const bronzeCount = items.filter(i => {
    const product = i.products as any;
    return product?.evidence_level === 'bronze';
  }).length;

  const total = goldCount + silverCount + bronzeCount;
  
  if (total === 0) {
    return { tier: 'bronze', goldCount: 0, silverCount: 0, bronzeCount: 0 };
  }

  const goldPercent = (goldCount / total) * 100;
  const goldSilverPercent = ((goldCount + silverCount) / total) * 100;

  let tier: 'gold' | 'silver' | 'bronze' = 'bronze';
  if (goldPercent >= 70) {
    tier = 'gold';
  } else if (goldSilverPercent >= 50) {
    tier = 'silver';
  }

  return { tier, goldCount, silverCount, bronzeCount };
}

async function calculatePackagePrice(
  basePrice: number,
  ruleType: string,
  userId: string
): Promise<{ finalPrice: number; discountAmount: number }> {
  try {
    // Fetch applicable discount rules
    const { data: rules, error } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('is_active', true)
      .eq('rule_type', ruleType)
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`);

    if (error) throw error;

    let totalDiscount = 0;

    if (rules && rules.length > 0) {
      const rule = rules[0];
      if (rule.discount_type === 'percentage') {
        totalDiscount = (basePrice * rule.discount_value) / 100;
      } else {
        totalDiscount = rule.discount_value;
      }
    }

    // Apply membership discount if applicable
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    if (subscription && subscription.subscription_tier === 'premium') {
      const { data: membershipRule } = await supabase
        .from('discount_rules')
        .select('*')
        .eq('is_active', true)
        .eq('rule_type', 'membership')
        .single();

      if (membershipRule) {
        const discountedPrice = basePrice - totalDiscount;
        if (membershipRule.discount_type === 'percentage') {
          totalDiscount += (discountedPrice * membershipRule.discount_value) / 100;
        } else {
          totalDiscount += membershipRule.discount_value;
        }
      }
    }

    return {
      finalPrice: Math.max(0, basePrice - totalDiscount),
      discountAmount: totalDiscount
    };
  } catch (error) {
    console.error('Error calculating package price:', error);
    return { finalPrice: basePrice, discountAmount: 0 };
  }
}
