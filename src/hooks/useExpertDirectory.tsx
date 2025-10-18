import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExpertProfile } from "@/types/experts";

interface DirectoryFilters {
  specialty?: string;
  location?: string;
  minRating?: number;
  acceptsInsurance?: boolean;
  tier?: string;
}

export const useExpertDirectory = () => {
  const [experts, setExperts] = useState<ExpertProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DirectoryFilters>({});

  useEffect(() => {
    fetchExperts();
  }, [filters]);

  const fetchExperts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('expert_profiles')
        .select('*')
        .eq('verification_status', 'approved')
        .eq('listing_status', 'active');

      if (filters.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.minRating) {
        query = query.gte('average_rating', filters.minRating);
      }

      if (filters.acceptsInsurance !== undefined) {
        query = query.eq('accepts_insurance', filters.acceptsInsurance);
      }

      if (filters.tier) {
        query = query.eq('tier', filters.tier as any);
      }

      const { data, error } = await query
        .order('featured', { ascending: false })
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setExperts(data || []);
    } catch (error) {
      console.error('Error fetching experts:', error);
      setExperts([]);
    } finally {
      setLoading(false);
    }
  };

  const getExpertById = async (id: string): Promise<ExpertProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('expert_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching expert:', error);
      return null;
    }
  };

  return {
    experts,
    loading,
    filters,
    setFilters,
    fetchExperts,
    getExpertById,
  };
};