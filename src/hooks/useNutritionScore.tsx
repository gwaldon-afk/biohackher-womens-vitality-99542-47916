import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface NutritionScoreData {
  baselineScore: number | null;
  latestScore: number | null;
  metabolicAge: number | null;
  completedAt: Date | null;
  loading: boolean;
  proteinScore: number | null;
  fiberScore: number | null;
  hydrationScore: number | null;
  inflammationScore: number | null;
  gutSymptomScore: number | null;
  refetch: () => void;
}

export const useNutritionScore = (): NutritionScoreData => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['nutrition-score', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('longevity_nutrition_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  return {
    baselineScore: data?.longevity_nutrition_score ?? null,
    latestScore: data?.longevity_nutrition_score ?? null,
    metabolicAge: data?.metabolic_age ?? null,
    completedAt: data?.completed_at ? new Date(data.completed_at) : null,
    loading: isLoading,
    proteinScore: data?.protein_score ?? null,
    fiberScore: data?.fiber_score ?? null,
    hydrationScore: data?.hydration_score ?? null,
    inflammationScore: data?.inflammation_score ?? null,
    gutSymptomScore: data?.gut_symptom_score ?? null,
    refetch
  };
};
