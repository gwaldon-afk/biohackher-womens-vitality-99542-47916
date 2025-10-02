import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface UserProgress {
  id: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  pillars_visited: any; // Using any to handle JSON type from Supabase
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProgress(data as UserProgress);
      } else {
        // Create initial progress record
        const { data: newProgress, error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            onboarding_completed: false,
            onboarding_step: 1,
            pillars_visited: []
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress as UserProgress);
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<UserProgress>) => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('user_progress')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchProgress();
    } catch (error) {
      console.error('Error updating user progress:', error);
    }
  };

  const completeOnboarding = async () => {
    await updateProgress({ onboarding_completed: true });
  };

  const visitPillar = async (pillar: string) => {
    if (!progress) return;
    
    const pillarsVisited = Array.isArray(progress.pillars_visited) ? progress.pillars_visited : [];
    if (!pillarsVisited.includes(pillar)) {
      await updateProgress({
        pillars_visited: [...pillarsVisited, pillar]
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProgress();
    }
  }, [user]);

  return {
    progress,
    loading,
    updateProgress,
    completeOnboarding,
    visitPillar,
    refetch: fetchProgress
  };
};
