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
  is_active: boolean;
}

export const useProtocols = () => {
  const { user } = useAuth();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProtocols = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_protocols')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
      const { data, error } = await supabase
        .from('user_protocols')
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
        .from('user_protocols')
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
        .from('user_protocols')
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
    try {
      const { data, error } = await supabase
        .from('protocol_items')
        .select('*')
        .eq('protocol_id', protocolId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching protocol items:', error);
      return [];
    }
  };

  const addProtocolItem = async (item: Omit<ProtocolItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('protocol_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
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
    deleteProtocolItem
  };
};
