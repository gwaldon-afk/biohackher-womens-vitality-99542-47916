import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface WearableConnection {
  id: string;
  provider: string;
  is_active: boolean;
  last_sync_at: string | null;
  created_at: string;
}

interface WearableData {
  id: string;
  date: string;
  device_type: string;
  total_sleep_hours: number | null;
  rem_sleep_percentage: number | null;
  heart_rate_variability: number | null;
  resting_heart_rate: number | null;
  active_minutes: number | null;
  steps: number | null;
}

export const useWearables = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<WearableConnection[]>([]);
  const [wearableData, setWearableData] = useState<WearableData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConnections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wearable_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections(data || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWearableData = async (days: number = 30) => {
    if (!user) return;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('wearable_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      setWearableData(data || []);
    } catch (error) {
      console.error('Error fetching wearable data:', error);
    }
  };

  const disconnectWearable = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('wearable_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
    } catch (error) {
      console.error('Error disconnecting wearable:', error);
      throw error;
    }
  };

  const triggerSync = async (connectionId: string) => {
    try {
      const { error } = await supabase.functions.invoke('data-sync-wearable', {
        body: { connectionId }
      });

      if (error) throw error;
      
      await Promise.all([
        fetchConnections(),
        fetchWearableData()
      ]);
    } catch (error) {
      console.error('Error syncing wearable:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConnections();
      fetchWearableData();
    }
  }, [user]);

  return {
    connections,
    wearableData,
    loading,
    fetchConnections,
    fetchWearableData,
    disconnectWearable,
    triggerSync
  };
};