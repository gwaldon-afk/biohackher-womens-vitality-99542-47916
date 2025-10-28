import { supabase } from "@/integrations/supabase/client";
import { DiscountRule } from "@/types/packages";

interface DiscountContext {
  isPackage?: boolean;
  isPaymentPlan?: boolean;
  itemIds?: string[];
  promoCode?: string;
}

interface DiscountResult {
  originalPrice: number;
  totalDiscount: number;
  finalPrice: number;
  appliedRules: DiscountRule[];
}

/**
 * Calculate final price with all applicable discounts
 * - Package discounts
 * - Payment plan adjustments
 * - Membership discounts (applied on top)
 * - Promo codes
 */
export const calculateFinalPrice = async (
  basePrice: number,
  userId: string,
  context: DiscountContext
): Promise<DiscountResult> => {
  try {
    // Fetch user's membership tier
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('subscription_tier')
      .eq('user_id', userId)
      .single();

    // Fetch applicable discount rules
    const { data: rules } = await supabase
      .from('discount_rules')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`);

    if (!rules) {
      return {
        originalPrice: basePrice,
        totalDiscount: 0,
        finalPrice: basePrice,
        appliedRules: []
      };
    }

    let totalDiscount = 0;
    const appliedRules: DiscountRule[] = [];

    // Apply package discounts
    if (context.isPackage) {
      const packageRule = rules.find(r => r.rule_type === 'package_full_90');
      if (packageRule) {
        const discount = calculateDiscount(basePrice, packageRule as any);
        totalDiscount += discount;
        appliedRules.push(packageRule as any);
      }
    }

    // Apply payment plan fee (negative discount)
    if (context.isPaymentPlan) {
      const planRule = rules.find(r => r.rule_type === 'package_payment_plan');
      if (planRule) {
        // This is a processing fee, so it increases the price
        const fee = calculateDiscount(basePrice, planRule as any);
        totalDiscount -= fee; // Subtract to increase final price
        appliedRules.push(planRule as any);
      }
    }

    // Apply promo code
    if (context.promoCode) {
      const promoRule = rules.find(
        r => r.rule_type === 'promo_code' && 
        r.promo_code === context.promoCode &&
        (r.max_uses === null || (r.max_uses && r.current_uses < r.max_uses))
      );
      
      if (promoRule) {
        const currentPrice = basePrice - totalDiscount;
        const discount = calculateDiscount(currentPrice, promoRule as any);
        totalDiscount += discount;
        appliedRules.push(promoRule as any);
      }
    }

    // Apply membership discount (on top of other discounts)
    if (subscription && subscription.subscription_tier === 'premium') {
      const membershipRule = rules.find(r => r.rule_type === 'membership');
      if (membershipRule) {
        const discountedPrice = basePrice - totalDiscount;
        const memberDiscount = calculateDiscount(discountedPrice, membershipRule as any);
        totalDiscount += memberDiscount;
        appliedRules.push(membershipRule as any);
      }
    }

    return {
      originalPrice: basePrice,
      totalDiscount,
      finalPrice: Math.max(0, basePrice - totalDiscount),
      appliedRules
    };
  } catch (error) {
    console.error('Error calculating final price:', error);
    return {
      originalPrice: basePrice,
      totalDiscount: 0,
      finalPrice: basePrice,
      appliedRules: []
    };
  }
};

function calculateDiscount(price: number, rule: DiscountRule): number {
  if (rule.discount_type === 'percentage') {
    return (price * rule.discount_value) / 100;
  } else {
    return rule.discount_value;
  }
}

/**
 * Increment usage count for a discount rule (e.g., promo code)
 */
export const incrementDiscountUsage = async (ruleId: string) => {
  try {
    const { error } = await supabase
      .rpc('increment', { 
        row_id: ruleId,
        table_name: 'discount_rules',
        column_name: 'current_uses'
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing discount usage:', error);
    return false;
  }
};
