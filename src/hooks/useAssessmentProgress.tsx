import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface AssessmentProgress {
  id: string;
  user_id: string;
  lis_completed: boolean;
  nutrition_completed: boolean;
  hormone_completed: boolean;
  lis_completed_at: string | null;
  nutrition_completed_at: string | null;
  hormone_completed_at: string | null;
  master_dashboard_unlocked: boolean;
  created_at: string;
  updated_at: string;
}

export const useAssessmentProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["assessment-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("assessment_progress")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as AssessmentProgress | null;
    },
    enabled: !!user?.id,
  });

  const updateProgress = useMutation({
    mutationFn: async (updates: Partial<AssessmentProgress>) => {
      if (!user?.id) throw new Error("No user");

      const { data, error } = await supabase
        .from("assessment_progress")
        .upsert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assessment-progress", user?.id] });
    },
  });

  const completedCount = progress
    ? [progress.lis_completed, progress.nutrition_completed, progress.hormone_completed].filter(Boolean).length
    : 0;

  const getNextAssessment = (): { nameKey: string; route: string } | null => {
    if (!progress) return { nameKey: "assessments.lis.name", route: "/guest-lis-assessment" };
    if (!progress.lis_completed) return { nameKey: "assessments.lis.name", route: "/guest-lis-assessment" };
    if (!progress.nutrition_completed) return { nameKey: "assessments.nutrition.name", route: "/longevity-nutrition" };
    if (!progress.hormone_completed) return { nameKey: "assessments.hormone.name", route: "/menomap/assessment" };
    return null;
  };

  return {
    progress,
    isLoading,
    updateProgress: updateProgress.mutate,
    completedCount,
    getNextAssessment,
    allComplete: completedCount === 3,
  };
};
