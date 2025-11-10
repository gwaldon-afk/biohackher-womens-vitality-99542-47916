import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NutritionBreakdown {
  hydration: number;
  vegetables: number;
  protein: number;
  fats_omegas: number;
  sugar_processed: number;
  alcohol: number;
  dairy_gluten?: number;
}

export const useNutritionTracking = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const saveLog = async (
    score: number,
    grade: string,
    breakdown: NutritionBreakdown
  ) => {
    if (!user) {
      console.warn('User not authenticated, skipping nutrition log save');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      // Save to daily_nutrition_scores
      const { error: scoreError } = await supabase
        .from('daily_nutrition_scores')
        .upsert(
          {
            user_id: user.id,
            score_date: today,
            score,
            grade,
            hydration: breakdown.hydration,
            vegetables: breakdown.vegetables,
            protein: breakdown.protein,
            sugar: breakdown.sugar_processed,
            processed_foods: breakdown.sugar_processed,
            dairy_gluten: breakdown.dairy_gluten || 0,
          },
          { onConflict: 'user_id,score_date' }
        );

      if (scoreError) throw scoreError;

      // Update streak
      await updateStreak(today);

      console.log('Nutrition log saved successfully');
    } catch (err) {
      console.error('Error saving nutrition log:', err);
      setError(err as Error);
      toast.error('Failed to save nutrition log');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = async (currentDate: string) => {
    if (!user) return;

    try {
      // Get existing streak data
      const { data: existingStreak, error: fetchError } = await supabase
        .from('nutrition_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const yesterday = new Date(currentDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = 1;
      let newLongestStreak = 1;

      if (existingStreak) {
        // Check if logging consecutively
        if (existingStreak.last_logged_date === yesterdayStr) {
          newCurrentStreak = (existingStreak.current_streak || 0) + 1;
        } else if (existingStreak.last_logged_date !== currentDate) {
          // Streak broken, reset
          newCurrentStreak = 1;
        } else {
          // Same day, don't increment
          newCurrentStreak = existingStreak.current_streak || 1;
        }

        newLongestStreak = Math.max(
          existingStreak.longest_streak || 0,
          newCurrentStreak
        );
      }

      // Upsert streak
      const { error: streakError } = await supabase
        .from('nutrition_streaks')
        .upsert(
          {
            user_id: user.id,
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_logged_date: currentDate,
          },
          { onConflict: 'user_id' }
        );

      if (streakError) throw streakError;

      // Show streak milestone toasts
      if (newCurrentStreak === 3) {
        toast.success('🔥 3-day streak! Keep it going!');
      } else if (newCurrentStreak === 7) {
        toast.success('🎉 7-day streak! Amazing consistency!');
      } else if (newCurrentStreak === 30) {
        toast.success('🏆 30-day streak! You\'re unstoppable!');
      }
    } catch (err) {
      console.error('Error updating streak:', err);
      // Don't throw - streak is secondary to main save
    }
  };

  return {
    saveLog,
    isLoading,
    error,
  };
};
