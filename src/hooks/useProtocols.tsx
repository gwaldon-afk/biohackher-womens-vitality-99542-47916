import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Protocol {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  created_from_pillar: string | null;
  created_at: string;
}

interface ProtocolItem {
  id: string;
  protocol_id: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  name: string;
  description: string | null;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[] | null;
  notes: string | null;
  product_link: string | null;
  product_id: string | null;
  is_active: boolean;
  // Phase 4: Protocol tier and impact fields
  priority_tier?: string | null;
  impact_weight?: number | null;
  lis_pillar_contribution?: string[] | null;
}

export const useProtocols = () => {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProtocols = async () => {
    if (!user) return;
    
    console.log('[useProtocols] Fetching protocols for user:', user.id);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('[useProtocols] Fetched protocols:', data);
      console.log('[useProtocols] Active protocols:', data?.filter(p => p.is_active));
      setProtocols(data || []);
    } catch (error) {
      console.error('Error fetching protocols:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProtocol = async (protocol: Omit<Protocol, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;

    try {
      // Check for existing active protocol with the same name
      if (protocol.is_active) {
        const { data: existing } = await supabase
          .from('protocols')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', protocol.name)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          throw new Error(`An active protocol named "${protocol.name}" already exists`);
        }
      }

      const { data, error } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          ...protocol
        })
        .select()
        .single();

      if (error) throw error;
      await fetchProtocols();
      return data;
    } catch (error) {
      console.error('Error creating protocol:', error);
      throw error;
    }
  };

  const updateProtocol = async (id: string, updates: Partial<Protocol>) => {
    try {
      const { error } = await supabase
        .from('protocols')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchProtocols();
    } catch (error) {
      console.error('Error updating protocol:', error);
      throw error;
    }
  };

  const deleteProtocol = async (id: string) => {
    try {
      const { error } = await supabase
        .from('protocols')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchProtocols();
    } catch (error) {
      console.error('Error deleting protocol:', error);
      throw error;
    }
  };

  const fetchProtocolItems = async (protocolId: string): Promise<ProtocolItem[]> => {
    console.log('[useProtocols] Fetching protocol items for protocol:', protocolId);
    try {
      const { data, error } = await supabase
        .from('protocol_items')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      console.log('[useProtocols] Fetched protocol items:', data);
      console.log('[useProtocols] Active protocol items:', data?.filter(item => item.is_active));
      return data || [];
    } catch (error) {
      console.error('Error fetching protocol items:', error);
      return [];
    }
  };

  const addProtocolItem = async (item: Omit<ProtocolItem, 'id' | 'created_at'>) => {
    try {
      // Ensure priority_tier, impact_weight, and lis_pillar_contribution are included
      const itemWithDefaults = {
        ...item,
        priority_tier: item.priority_tier || 'foundation',
        impact_weight: item.impact_weight ?? 5,
        lis_pillar_contribution: item.lis_pillar_contribution || [],
      };

      const { data, error } = await supabase
        .from('protocol_items')
        .insert(itemWithDefaults)
        .select()
        .single();

      if (error) throw error;
      console.log('[useProtocols] Added protocol item with tier/weight:', {
        name: data.name,
        priority_tier: data.priority_tier,
        impact_weight: data.impact_weight,
        lis_pillar_contribution: data.lis_pillar_contribution
      });
      return data;
    } catch (error) {
      console.error('Error adding protocol item:', error);
      throw error;
    }
  };

  const updateProtocolItem = async (id: string, updates: Partial<ProtocolItem>) => {
    try {
      const { error } = await supabase
        .from('protocol_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating protocol item:', error);
      throw error;
    }
  };

  const deleteProtocolItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('protocol_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting protocol item:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProtocols();
    }
  }, [user]);

  const addProtocolFromLibrary = async (
    protocolName: string,
    items: Array<{
      item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
      name: string;
      description?: string;
      dosage?: string;
      frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
      time_of_day?: string[];
      notes?: string;
      priority_tier?: 'immediate' | 'foundation' | 'optimization';
      impact_weight?: number;
      lis_pillar_contribution?: string[];
    }>
  ) => {
    if (!user) return;

    try {
      // Get or create active protocol
      let activeProtocol = protocols.find(p => p.is_active);
      
      if (!activeProtocol) {
        // Create new active protocol
        activeProtocol = await createProtocol({
          name: 'My Protocol',
          description: 'My personalized wellness protocol',
          is_active: true,
          start_date: new Date().toISOString().split('T')[0],
          end_date: null,
          created_from_pillar: null
        });
      }

      if (!activeProtocol) {
        throw new Error('Failed to create protocol');
      }

      // Add all items to the protocol with tier/weight/pillar data
      const promises = items.map(item =>
        addProtocolItem({
          protocol_id: activeProtocol!.id,
          item_type: item.item_type,
          name: item.name,
          description: item.description || null,
          dosage: item.dosage || null,
          frequency: item.frequency,
          time_of_day: item.time_of_day || null,
          notes: item.notes || `Added from ${protocolName}`,
          product_link: null,
          product_id: null,
          is_active: true,
          priority_tier: item.priority_tier || 'foundation',
          impact_weight: item.impact_weight ?? 5,
          lis_pillar_contribution: item.lis_pillar_contribution || []
        })
      );

      await Promise.all(promises);
      await fetchProtocols();
      
      return activeProtocol;
    } catch (error) {
      console.error('Error adding protocol from library:', error);
      throw error;
    }
  };

  return {
    protocols,
    loading,
    fetchProtocols,
    createProtocol,
    updateProtocol,
    deleteProtocol,
    fetchProtocolItems,
    addProtocolItem,
    updateProtocolItem,
    deleteProtocolItem,
    addProtocolFromLibrary
  };
};
