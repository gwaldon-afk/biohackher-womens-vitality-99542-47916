import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { PackagePurchase } from "@/types/packages";

export const usePackagePurchases = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['package-purchases', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('package_purchases')
        .select(`
          *,
          protocol_packages (
            *,
            package_protocol_items (
              *,
              protocol_items (*),
              products (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });

      if (error) throw error;
      return data as PackagePurchase[];
    },
    enabled: !!user
  });

  const createPurchase = useMutation({
    mutationFn: async (purchase: Partial<PackagePurchase>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('package_purchases')
        .insert({
          package_id: purchase.package_id!,
          purchase_type: purchase.purchase_type!,
          total_amount: purchase.total_amount!,
          discount_applied: purchase.discount_applied || 0,
          discount_code: purchase.discount_code,
          stripe_payment_intent_id: purchase.stripe_payment_intent_id,
          stripe_subscription_id: purchase.stripe_subscription_id,
          payment_status: purchase.payment_status || 'pending',
          shipment_status: purchase.shipment_status || 'pending',
          tracking_number: purchase.tracking_number,
          payment_plan_installment_count: purchase.payment_plan_installment_count || 1,
          payment_plan_current_installment: purchase.payment_plan_current_installment || 1,
          metadata: purchase.metadata || {},
          user_id: user.id,
          purchased_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-purchases'] });
    }
  });

  const updatePurchase = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PackagePurchase> }) => {
      const { data, error } = await supabase
        .from('package_purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['package-purchases'] });
    }
  });

  return {
    purchases: purchases || [],
    isLoading,
    createPurchase: createPurchase.mutateAsync,
    updatePurchase: updatePurchase.mutateAsync
  };
};

export const useActivePurchase = () => {
  const { user } = useAuth();

  const { data: activePurchase, isLoading } = useQuery({
    queryKey: ['active-package-purchase', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('package_purchases')
        .select(`
          *,
          protocol_packages (
            *,
            package_protocol_items (
              *,
              protocol_items (*),
              products (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .order('purchased_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as PackagePurchase;
    },
    enabled: !!user
  });

  return {
    activePurchase,
    isLoading,
    hasPurchase: !!activePurchase
  };
};
