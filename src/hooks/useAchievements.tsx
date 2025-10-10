import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Achievement {
  id: string;
  achievement_id: string;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  requirements: any;
  is_active: boolean;
  display_order: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: any;
}

export interface UserPoints {
  total_points: number;
  level: number;
  points_to_next_level: number;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAchievements();
      fetchUserAchievements();
      fetchUserPoints();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setAchievements((data || []) as Achievement[]);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserPoints(data || { total_points: 0, level: 1, points_to_next_level: 100 });
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!user) return;

    // Check if already unlocked
    const alreadyUnlocked = userAchievements.some(
      ua => ua.achievement_id === achievementId
    );

    if (alreadyUnlocked) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId
        });

      if (error) throw error;

      // Refresh data
      await fetchUserAchievements();
      await fetchUserPoints();

      // Find achievement details for toast
      const achievement = achievements.find(a => a.achievement_id === achievementId);
      if (achievement) {
        toast({
          title: '🏆 Achievement Unlocked!',
          description: `${achievement.name} - ${achievement.points} points earned!`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const checkAchievement = async (type: string, data: any) => {
    if (!user) return;

    // Check for matching achievements
    for (const achievement of achievements) {
      const req = achievement.requirements;

      // Skip if already unlocked
      if (userAchievements.some(ua => ua.achievement_id === achievement.achievement_id)) {
        continue;
      }

      let shouldUnlock = false;

      switch (req.type) {
        case 'count':
          if (data.metric === req.metric && data.value >= req.value) {
            shouldUnlock = true;
          }
          break;

        case 'streak':
          if (type === 'streak' && data.days >= req.value) {
            shouldUnlock = true;
          }
          break;

        case 'pillars':
          if (type === 'pillars' && data.completedPillars >= req.value) {
            shouldUnlock = true;
          }
          break;

        case 'adherence':
          if (type === 'adherence' && data.days >= req.days && data.rate >= req.rate) {
            shouldUnlock = true;
          }
          break;

        case 'lis_green':
          if (type === 'lis_green' && data.greenDays >= req.value) {
            shouldUnlock = true;
          }
          break;

        case 'consecutive_logs':
          if (type === 'consecutive_logs' && data.days >= req.value) {
            shouldUnlock = true;
          }
          break;

        case 'measurement_weeks':
          if (type === 'measurement_weeks' && data.weeks >= req.value) {
            shouldUnlock = true;
          }
          break;
      }

      if (shouldUnlock) {
        await unlockAchievement(achievement.achievement_id);
      }
    }
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockedCount = () => {
    return userAchievements.length;
  };

  const getTotalPoints = () => {
    return userPoints?.total_points || 0;
  };

  const getLevel = () => {
    return userPoints?.level || 1;
  };

  const getProgressToNextLevel = () => {
    if (!userPoints) return 0;
    const currentLevelPoints = (userPoints.level - 1) * 100;
    const pointsIntoLevel = userPoints.total_points - currentLevelPoints;
    return (pointsIntoLevel / 100) * 100;
  };

  return {
    achievements,
    userAchievements,
    userPoints,
    loading,
    unlockAchievement,
    checkAchievement,
    isUnlocked,
    getUnlockedCount,
    getTotalPoints,
    getLevel,
    getProgressToNextLevel,
    refetch: () => {
      fetchAchievements();
      fetchUserAchievements();
      fetchUserPoints();
    }
  };
};
