// Protocol Package Types
export interface ProtocolPackage {
  id: string;
  user_id: string;
  protocol_id: string;
  package_name: string;
  tier: 'bronze' | 'silver' | 'gold';
  duration_days: number;
  total_items_count: number;
  gold_items_count: number;
  silver_items_count: number;
  bronze_items_count: number;
  base_price: number;
  discount_type: 'percentage' | 'fixed';
  discount_amount: number;
  final_price: number;
  is_active: boolean;
  created_at: string;
  expires_at?: string;
}

export interface PackageProtocolItem {
  id: string;
  package_id: string;
  protocol_item_id: string;
  product_id?: string;
  item_position: number;
  is_customizable: boolean;
  replacement_options: string[];
  created_at: string;
}

export interface PackagePurchase {
  id: string;
  user_id: string;
  package_id: string;
  purchase_type: 'full_90_day' | 'payment_plan_3x';
  total_amount: number;
  discount_applied: number;
  discount_code?: string;
  stripe_payment_intent_id?: string;
  stripe_subscription_id?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  shipment_status: 'pending' | 'processing' | 'shipped' | 'delivered';
  tracking_number?: string;
  purchased_at: string;
  shipped_at?: string;
  delivered_at?: string;
  payment_plan_installment_count: number;
  payment_plan_current_installment: number;
  metadata: Record<string, any>;
}

export interface DiscountRule {
  id: string;
  rule_name: string;
  rule_type: 'package_full_90' | 'package_payment_plan' | 'membership' | 'promo_code' | 'product_bundle';
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  conditions: Record<string, any>;
  applies_to: 'all' | 'packages' | 'products' | 'specific_items';
  specific_item_ids?: string[];
  promo_code?: string;
  is_active: boolean;
  valid_from: string;
  valid_until?: string;
  max_uses?: number;
  current_uses: number;
  created_by?: string;
  created_at: string;
}

export interface GoalMetricTracking {
  id: string;
  user_id: string;
  goal_id: string;
  metric_name: string;
  metric_value?: number;
  metric_unit?: string;
  tracked_date: string;
  notes?: string;
  created_at: string;
}
