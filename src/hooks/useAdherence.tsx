import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Adherence {
  id: string;
  user_id: string;
  protocol_item_id: string;
  date: string;
  completed: boolean;
  notes: string | null;
}

export const useAdherence = () => {
  const { user } = useAuth();
  const [adherence, setAdherence] = useState<Record<string, Adherence>>({});
  const [loading, setLoading] = useState(false);

  const fetchAdherence = async (date?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('protocol_adherence')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate);

      if (error) throw error;
      
      const adherenceMap: Record<string, Adherence> = {};
      data?.forEach(item => {
        adherenceMap[item.protocol_item_id] = item;
      });
      
      setAdherence(adherenceMap);
    } catch (error) {
      console.error('Error fetching adherence:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdherence = async (protocolItemId: string, date?: string) => {
    if (!user) return;

    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const existing = adherence[protocolItemId];

      if (existing) {
        // Toggle existing
        const { error } = await supabase
          .from('protocol_adherence')
          .update({ completed: !existing.completed })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('protocol_adherence')
          .insert({
            user_id: user.id,
            protocol_item_id: protocolItemId,
            date: targetDate,
            completed: true
          });

        if (error) throw error;
      }

      await fetchAdherence(targetDate);
    } catch (error) {
      console.error('Error toggling adherence:', error);
    }
  };

  const getAdherenceStats = async (startDate: string, endDate: string) => {
    if (!user) return { total: 0, completed: 0, percentage: 0 };

    try {
      const { data, error } = await supabase
        .from('protocol_adherence')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate);

      if (error) throw error;

      const total = data?.length || 0;
      const completed = data?.filter(item => item.completed).length || 0;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { total, completed, percentage };
    } catch (error) {
      console.error('Error fetching adherence stats:', error);
      return { total: 0, completed: 0, percentage: 0 };
    }
  };

  useEffect(() => {
    if (user) {
      fetchAdherence();
    }
  }, [user]);

  return {
    adherence,
    loading,
    fetchAdherence,
    toggleAdherence,
    getAdherenceStats,
    refetch: fetchAdherence
  };
};
