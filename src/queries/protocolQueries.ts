// React Query hooks for protocols
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Protocol, ProtocolItem } from '@/types/protocols';
import { useProtocolStore } from '@/stores/protocolStore';

// Query keys
export const protocolKeys = {
  all: ['protocols'] as const,
  lists: () => [...protocolKeys.all, 'list'] as const,
  list: (userId: string) => [...protocolKeys.lists(), userId] as const,
  items: (protocolId: string) => [...protocolKeys.all, 'items', protocolId] as const,
};

// Fetch all protocols for a user
export function useProtocols(userId: string | undefined) {
  const setProtocols = useProtocolStore(state => state.setProtocols);
  
  return useQuery({
    queryKey: protocolKeys.list(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_protocols')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const protocols = data || [];
      setProtocols(protocols);
      return protocols as Protocol[];
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
}

// Fetch protocol items for a specific protocol
export function useProtocolItems(protocolId: string | undefined) {
  const setProtocolItems = useProtocolStore(state => state.setProtocolItems);
  
  return useQuery({
    queryKey: protocolKeys.items(protocolId || ''),
    queryFn: async () => {
      if (!protocolId) return [];
      
      const { data, error } = await supabase
        .from('protocol_items')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const items = data || [];
      setProtocolItems(protocolId, items);
      return items as ProtocolItem[];
    },
    enabled: !!protocolId,
    staleTime: 30000,
  });
}

// Create a new protocol
export function useCreateProtocol(userId: string) {
  const queryClient = useQueryClient();
  const addProtocol = useProtocolStore(state => state.addProtocol);
  
  return useMutation({
    mutationFn: async (protocol: Omit<Protocol, 'id' | 'created_at' | 'updated_at'>) => {
      // Check for existing active protocol with the same name
      if (protocol.is_active) {
        const { data: existing } = await supabase
          .from('user_protocols')
          .select('id')
          .eq('user_id', userId)
          .eq('name', protocol.name)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          throw new Error(`An active protocol named "${protocol.name}" already exists`);
        }
      }

      const { data, error } = await supabase
        .from('user_protocols')
        .insert({ ...protocol, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as Protocol;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.list(userId) });
      addProtocol(data);
    },
  });
}

// Update a protocol
export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  const updateProtocol = useProtocolStore(state => state.updateProtocol);
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Protocol> }) => {
      const { data, error } = await supabase
        .from('user_protocols')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Protocol;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.all });
      updateProtocol(data.id, data);
    },
  });
}

// Delete a protocol
export function useDeleteProtocol() {
  const queryClient = useQueryClient();
  const removeProtocol = useProtocolStore(state => state.removeProtocol);
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_protocols')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.all });
      removeProtocol(id);
    },
  });
}

// Create a protocol item
export function useCreateProtocolItem(protocolId: string) {
  const queryClient = useQueryClient();
  const addProtocolItem = useProtocolStore(state => state.addProtocolItem);
  
  return useMutation({
    mutationFn: async (item: Omit<ProtocolItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('protocol_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data as ProtocolItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.items(protocolId) });
      addProtocolItem(protocolId, data);
    },
  });
}

// Update a protocol item
export function useUpdateProtocolItem(protocolId: string) {
  const queryClient = useQueryClient();
  const updateProtocolItem = useProtocolStore(state => state.updateProtocolItem);
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ProtocolItem> }) => {
      const { data, error } = await supabase
        .from('protocol_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProtocolItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.items(protocolId) });
      updateProtocolItem(protocolId, data.id, data);
    },
  });
}

// Delete a protocol item
export function useDeleteProtocolItem(protocolId: string) {
  const queryClient = useQueryClient();
  const removeProtocolItem = useProtocolStore(state => state.removeProtocolItem);
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('protocol_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.items(protocolId) });
      removeProtocolItem(protocolId, id);
    },
  });
}
