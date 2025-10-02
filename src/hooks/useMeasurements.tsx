import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Measurement {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  body_fat_percentage: number | null;
  muscle_mass: number | null;
  waist_circumference: number | null;
  hip_circumference: number | null;
  chest_circumference: number | null;
  custom_measurements: any;
  notes: string | null;
  created_at: string;
}

export const useMeasurements = () => {
  const { user } = useAuth();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeasurements = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeasurement = async (measurement: Omit<Measurement, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('progress_measurements')
        .insert({
          user_id: user.id,
          ...measurement
        })
        .select()
        .single();

      if (error) throw error;
      await fetchMeasurements();
      return data;
    } catch (error) {
      console.error('Error adding measurement:', error);
      throw error;
    }
  };

  const updateMeasurement = async (id: string, updates: Partial<Measurement>) => {
    try {
      const { error } = await supabase
        .from('progress_measurements')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchMeasurements();
    } catch (error) {
      console.error('Error updating measurement:', error);
      throw error;
    }
  };

  const deleteMeasurement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('progress_measurements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchMeasurements();
    }
  }, [user]);

  return {
    measurements,
    loading,
    fetchMeasurements,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    refetch: fetchMeasurements
  };
};
