import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target, Zap, Star, Award, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface GoalAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface GoalAchievementsProps {
  goalId?: string;
}

export const GoalAchievements = ({ goalId }: GoalAchievementsProps) => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<GoalAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, [user, goalId]);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Get goal-related achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('category', 'goals')
        .eq('is_active', true)
        .order('display_order');

      // Get user's unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', user.id);

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

      // Calculate progress for each achievement
      const achievementsWithProgress = await Promise.all(
        (allAchievements || []).map(async (achievement) => {
          let progress = 0;
          let maxProgress = 100;

          // Calculate progress based on achievement type
          if (achievement.achievement_id === 'first_goal_created') {
            const { count } = await supabase
              .from('user_health_goals')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            progress = count || 0;
            maxProgress = 1;
          } else if (achievement.achievement_id === 'first_check_in') {
            const { count } = await supabase
              .from('goal_check_ins')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);
            progress = count || 0;
            maxProgress = 1;
          } else if (achievement.achievement_id === 'goal_streak_7') {
            // Check for 7-day check-in streak
            const { data: checkIns } = await supabase
              .from('goal_check_ins')
              .select('check_in_date')
              .eq('user_id', user.id)
              .order('check_in_date', { ascending: false })
              .limit(7);
            
            progress = calculateStreak(checkIns?.map(c => c.check_in_date) || []);
            maxProgress = 7;
          } else if (achievement.achievement_id === 'goal_completed') {
            const { count } = await supabase
              .from('user_health_goals')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('status', 'completed');
            progress = count || 0;
            maxProgress = 1;
          } else if (achievement.achievement_id === 'progress_master') {
            const { data: goals } = await supabase
              .from('user_health_goals')
              .select('current_progress')
              .eq('user_id', user.id)
              .eq('status', 'active');
            
            const goalsOver80 = goals?.filter(g => (g.current_progress || 0) >= 80).length || 0;
            progress = goalsOver80;
            maxProgress = 3;
          }

          return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon_name,
            points: achievement.points,
            unlocked: unlockedIds.has(achievement.achievement_id),
            progress,
            maxProgress,
          };
        })
      );

      setAchievements(achievementsWithProgress);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dates: string[]): number => {
    if (dates.length === 0) return 0;
    
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const current = new Date(dates[i]);
      const next = new Date(dates[i + 1]);
      const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      trophy: Trophy,
      target: Target,
      zap: Zap,
      star: Star,
      award: Award,
    };
    return icons[iconName] || Trophy;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements
    .filter(a => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {unlockedCount}/{achievements.length}
              </div>
              <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                <Trophy className="h-8 w-8 inline-block mr-2" />
                {totalPoints}
              </div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {achievements.map((achievement) => {
          const Icon = getIconComponent(achievement.icon);
          const progressPercent = achievement.maxProgress 
            ? Math.min((achievement.progress! / achievement.maxProgress) * 100, 100)
            : 0;

          return (
            <Card 
              key={achievement.id}
              className={achievement.unlocked ? "border-primary/50 bg-primary/5" : "opacity-75"}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                      {achievement.unlocked ? (
                        <Icon className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base">{achievement.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {achievement.points} pts
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                
                {!achievement.unlocked && achievement.maxProgress && achievement.maxProgress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                )}

                {achievement.unlocked && (
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Award className="h-4 w-4" />
                    Unlocked!
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
