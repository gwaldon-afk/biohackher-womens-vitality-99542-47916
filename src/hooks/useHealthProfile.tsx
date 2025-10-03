import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface HealthProfile {
  id?: string;
  user_id: string;
  date_of_birth: string;
  height_cm?: number;
  weight_kg?: number;
  current_bmi?: number;
  is_current_smoker: boolean;
  is_former_smoker: boolean;
  date_quit_smoking?: string;
  initial_subjective_age_delta?: number;
  social_engagement_baseline?: number;
  created_at?: string;
  updated_at?: string;
}

export const useHealthProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_health_profile')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching health profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createOrUpdateProfile = useCallback(async (profileData: Partial<HealthProfile>) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Calculate BMI if height and weight provided
      let bmi = profileData.current_bmi;
      if (profileData.height_cm && profileData.weight_kg) {
        const heightInMeters = profileData.height_cm / 100;
        bmi = profileData.weight_kg / (heightInMeters * heightInMeters);
      }

      const dataToSave: any = {
        ...profileData,
        user_id: user.id,
        current_bmi: bmi,
      };

      const { data, error: upsertError } = await supabase
        .from('user_health_profile')
        .upsert(dataToSave)
        .select()
        .single();

      if (upsertError) throw upsertError;

      setProfile(data);
      return data;
    } catch (err: any) {
      console.error('Error saving health profile:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateBMI = useCallback(async (height_cm: number, weight_kg: number) => {
    if (!user || !profile) return;

    const heightInMeters = height_cm / 100;
    const bmi = weight_kg / (heightInMeters * heightInMeters);

    return createOrUpdateProfile({
      height_cm,
      weight_kg,
      current_bmi: bmi
    });
  }, [user, profile, createOrUpdateProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    createOrUpdateProfile,
    updateBMI,
    hasProfile: !!profile,
  };
};
