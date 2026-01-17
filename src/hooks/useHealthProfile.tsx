import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { normalizeActivityLevel } from "@/utils/activityLevel";

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
  smoking_cessation_category?: "never" | "current" | "quit_within_1y" | "quit_1_5y" | "quit_over_5y";
  initial_subjective_age_delta?: number;
  social_engagement_baseline?: number;
  latest_energy_score?: number;
  latest_energy_category?: string;
  energy_assessment_date?: string;
  chronic_fatigue_risk?: boolean;
  // Training & Exercise History
  training_experience?: "beginner" | "intermediate" | "advanced";
  exercise_routine_frequency?: number;
  compound_lift_experience?: Record<string, any>;
  previous_injuries?: string;
  exercise_preferences?: string[];
  // Supplement & Nutrition Context
  current_supplements?: string[];
  known_deficiencies?: string[];
  protein_per_meal?: number;
  allergies_sensitivities?: string[];
  medication_list?: string[];
  activity_level?: string;
  // Calculated nutrition targets
  recommended_protein_min?: number;
  recommended_protein_max?: number;
  recommended_daily_calories?: number;
  nutrition_calculation_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface EnergyMetrics {
  latestScore: number | null;
  category: string | null;
  assessmentDate: string | null;
  chronicFatigueRisk: boolean;
  trendDirection?: 'improving' | 'declining' | 'stable';
}

export const useHealthProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedForUserId, setFetchedForUserId] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setFetchedForUserId(null);
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
      
      setProfile(data as HealthProfile);
      setFetchedForUserId(user.id);
    } catch (err: any) {
      console.error('Error fetching health profile:', err);
      setError(err.message);
      setFetchedForUserId(user.id); // Mark as fetched even on error
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
      if (dataToSave.activity_level) {
        dataToSave.activity_level = normalizeActivityLevel(dataToSave.activity_level);
      }

      const { data, error: upsertError } = await supabase
        .from('user_health_profile')
        .upsert(dataToSave, { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertError) throw upsertError;

      setProfile(data as HealthProfile);
      setFetchedForUserId(user.id);
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

  // Calculate user age from date of birth
  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  // Calculate energy metrics
  const energyMetrics: EnergyMetrics = {
    latestScore: profile?.latest_energy_score ?? null,
    category: profile?.latest_energy_category ?? null,
    assessmentDate: profile?.energy_assessment_date ?? null,
    chronicFatigueRisk: profile?.chronic_fatigue_risk ?? false,
    trendDirection: profile?.latest_energy_score 
      ? (profile.latest_energy_score >= 70 ? 'improving' : profile.latest_energy_score < 50 ? 'declining' : 'stable')
      : undefined
  };

  // Compute effective loading state:
  // Loading is true if internal loading OR if we have a user but haven't fetched for that user yet
  const effectiveLoading = loading || (!!user && fetchedForUserId !== user.id);

  return {
    profile,
    loading: effectiveLoading,
    error,
    refetch: fetchProfile,
    createOrUpdateProfile,
    updateBMI,
    hasProfile: !!profile,
    userAge,
    energyMetrics,
  };
};
