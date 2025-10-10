import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SymptomTrack {
  id: string;
  user_id: string;
  symptom_id: string;
  severity: number;
  notes: string | null;
  tracked_date: string;
  created_at: string;
}

export const useSymptomTracking = () => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState<SymptomTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async (symptomId?: string, startDate?: string, endDate?: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('symptom_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('tracked_date', { ascending: false });

      if (symptomId) {
        query = query.eq('symptom_id', symptomId);
      }
      
      if (startDate) {
        query = query.gte('tracked_date', startDate);
      }
      
      if (endDate) {
        query = query.lte('tracked_date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTracking(data || []);
    } catch (error) {
      console.error('Error fetching symptom tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSymptom = async (symptomId: string, severity: number, notes?: string, date?: string) => {
    if (!user) return;

    try {
      const trackedDate = date || new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('symptom_tracking')
        .upsert({
          user_id: user.id,
          symptom_id: symptomId,
          severity,
          notes: notes || null,
          tracked_date: trackedDate
        }, {
          onConflict: 'user_id,symptom_id,tracked_date'
        });

      if (error) throw error;
      await fetchTracking();
    } catch (error) {
      console.error('Error logging symptom:', error);
      throw error;
    }
  };

  const deleteTracking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('symptom_tracking')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTracking();
    } catch (error) {
      console.error('Error deleting tracking:', error);
      throw error;
    }
  };

  const getSymptomTrends = async (symptomId: string, days: number = 30) => {
    if (!user) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const { data, error } = await supabase
        .from('symptom_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('symptom_id', symptomId)
        .gte('tracked_date', startDate.toISOString().split('T')[0])
        .lte('tracked_date', endDate.toISOString().split('T')[0])
        .order('tracked_date', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching symptom trends:', error);
      return [];
    }
  };

  const getCorrelationData = async (symptomId: string, days: number = 30) => {
    if (!user) return { symptomData: [], adherenceData: [] };

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      // Fetch symptom tracking data
      const { data: symptomData, error: symptomError } = await supabase
        .from('symptom_tracking')
        .select('tracked_date, severity')
        .eq('user_id', user.id)
        .eq('symptom_id', symptomId)
        .gte('tracked_date', startDateStr)
        .lte('tracked_date', endDateStr)
        .order('tracked_date', { ascending: true });

      if (symptomError) throw symptomError;

      // Fetch adherence data
      const { data: adherenceData, error: adherenceError } = await supabase
        .from('protocol_adherence')
        .select('date, completed')
        .eq('user_id', user.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (adherenceError) throw adherenceError;

      // Calculate daily adherence percentage
      const adherenceByDate: Record<string, { total: number; completed: number }> = {};
      adherenceData?.forEach(item => {
        if (!adherenceByDate[item.date]) {
          adherenceByDate[item.date] = { total: 0, completed: 0 };
        }
        adherenceByDate[item.date].total++;
        if (item.completed) {
          adherenceByDate[item.date].completed++;
        }
      });

      const adherencePercentages = Object.entries(adherenceByDate).map(([date, data]) => ({
        date,
        adherence: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      }));

      return {
        symptomData: symptomData || [],
        adherenceData: adherencePercentages
      };
    } catch (error) {
      console.error('Error fetching correlation data:', error);
      return { symptomData: [], adherenceData: [] };
    }
  };

  useEffect(() => {
    if (user) {
      fetchTracking();
    }
  }, [user]);

  return {
    tracking,
    loading,
    fetchTracking,
    logSymptom,
    deleteTracking,
    getSymptomTrends,
    getCorrelationData
  };
};