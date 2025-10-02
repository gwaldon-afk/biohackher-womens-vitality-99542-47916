import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Streak {
  id: string;
  activity_type: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useStreaks = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStreaks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('streak_tracking')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setStreaks(data || []);
    } catch (error) {
      console.error('Error fetching streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async (activityType: string) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get existing streak
      const { data: existingStreak } = await supabase
        .from('streak_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_type', activityType)
        .single();

      if (existingStreak) {
        const lastDate = existingStreak.last_activity_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newCurrentStreak = existingStreak.current_streak;
        
        // Check if last activity was yesterday (continue streak) or today (already logged)
        if (lastDate === yesterdayStr) {
          newCurrentStreak += 1;
        } else if (lastDate !== today) {
          // Streak broken, reset to 1
          newCurrentStreak = 1;
        } else {
          // Already logged today, no update needed
          return;
        }

        const newLongestStreak = Math.max(existingStreak.longest_streak, newCurrentStreak);

        await supabase
          .from('streak_tracking')
          .update({
            current_streak: newCurrentStreak,
            longest_streak: newLongestStreak,
            last_activity_date: today
          })
          .eq('id', existingStreak.id);
      } else {
        // Create new streak
        await supabase
          .from('streak_tracking')
          .insert({
            user_id: user.id,
            activity_type: activityType,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: today
          });
      }

      await fetchStreaks();
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const getStreak = (activityType: string) => {
    return streaks.find(s => s.activity_type === activityType);
  };

  useEffect(() => {
    if (user) {
      fetchStreaks();
    }
  }, [user]);

  return {
    streaks,
    loading,
    updateStreak,
    getStreak,
    refetch: fetchStreaks
  };
};
