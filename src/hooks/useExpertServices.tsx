import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExpertService, ExpertAvailability } from "@/types/experts";
import { toast } from "sonner";

export const useExpertServices = (expertId: string | null) => {
  const [services, setServices] = useState<ExpertService[]>([]);
  const [availability, setAvailability] = useState<ExpertAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expertId) {
      fetchServices();
      fetchAvailability();
    }
  }, [expertId]);

  const fetchServices = async () => {
    if (!expertId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expert_services')
        .select('*')
        .eq('expert_id', expertId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!expertId) return;
    
    try {
      const { data, error } = await supabase
        .from('expert_availability')
        .select('*')
        .eq('expert_id', expertId)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const addService = async (service: Omit<ExpertService, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expert_services')
        .insert(service)
        .select()
        .single();

      if (error) throw error;
      await fetchServices();
      toast.success('Service added successfully!');
      return data;
    } catch (error: any) {
      console.error('Error adding service:', error);
      toast.error(error?.message || 'Failed to add service');
      return null;
    }
  };

  const updateService = async (id: string, updates: Partial<ExpertService>) => {
    try {
      const { error } = await supabase
        .from('expert_services')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchServices();
      toast.success('Service updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expert_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchServices();
      toast.success('Service deleted successfully!');
      return true;
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
      return false;
    }
  };

  const setAvailabilitySlot = async (slot: Omit<ExpertAvailability, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('expert_availability')
        .upsert(slot, { onConflict: 'expert_id,day_of_week,start_time' })
        .select()
        .single();

      if (error) throw error;
      await fetchAvailability();
      toast.success('Availability updated!');
      return data;
    } catch (error: any) {
      console.error('Error setting availability:', error);
      toast.error(error?.message || 'Failed to update availability');
      return null;
    }
  };

  const deleteAvailabilitySlot = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expert_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAvailability();
      toast.success('Availability slot removed!');
      return true;
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast.error('Failed to remove availability');
      return false;
    }
  };

  return {
    services,
    availability,
    loading,
    fetchServices,
    addService,
    updateService,
    deleteService,
    setAvailabilitySlot,
    deleteAvailabilitySlot,
  };
};