import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { ProtocolPackage } from "@/types/packages";
import { generateProtocolPackage } from "@/services/packageGenerationService";

export const useProtocolPackages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['protocol-packages', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('protocol_packages')
        .select(`
          *,
          package_protocol_items (
            *,
            protocol_items (
              *,
              products (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProtocolPackage[];
    },
    enabled: !!user
  });

  const generatePackage = useMutation({
    mutationFn: async (protocolId: string) => {
      if (!user) throw new Error('User not authenticated');
      return await generateProtocolPackage(user.id, protocolId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['protocol-packages'] });
    }
  });

  return {
    packages: packages || [],
    isLoading,
    generatePackage: generatePackage.mutateAsync
  };
};

export const useActivePackage = () => {
  const { user } = useAuth();

  const { data: activePackage, isLoading } = useQuery({
    queryKey: ['active-protocol-package', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get user's active protocol
      const { data: protocols } = await supabase
        .from('protocols')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!protocols) return null;

      // Get active package for this protocol
      const { data, error } = await supabase
        .from('protocol_packages')
        .select(`
          *,
          package_protocol_items (
            *,
            protocol_items (
              *,
              products (*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('protocol_id', protocols.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as ProtocolPackage;
    },
    enabled: !!user
  });

  return {
    activePackage,
    isLoading
  };
};
