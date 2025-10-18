import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Calendar, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Streak {
  current: number;
  longest: number;
  lastCheckIn: string | null;
}

interface GoalStreakTrackerProps {
  goalId?: string;
}

export const GoalStreakTracker = ({ goalId }: GoalStreakTrackerProps) => {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0, lastCheckIn: null });
  const [loading, setLoading] = useState(true);
  const [recentDays, setRecentDays] = useState<{ date: string; hasCheckIn: boolean }[]>([]);

  useEffect(() => {
    fetchStreak();
  }, [user, goalId]);

  const fetchStreak = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('goal_check_ins')
        .select('check_in_date')
        .eq('user_id', user.id)
        .order('check_in_date', { ascending: false });

      if (goalId) {
        query = query.eq('goal_id', goalId);
      }

      const { data: checkIns } = await query;

      if (!checkIns || checkIns.length === 0) {
        setLoading(false);
        return;
      }

      const dates = checkIns.map(c => c.check_in_date).sort().reverse();
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < dates.length; i++) {
        const checkInDate = new Date(dates[i]);
        checkInDate.setHours(0, 0, 0, 0);
        
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - currentStreak);
        
        const diffDays = Math.floor((expectedDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          currentStreak++;
        } else if (diffDays > 0 && currentStreak === 0) {
          // No streak if we haven't checked in recently
          break;
        } else {
          break;
        }
      }

      // Calculate longest streak
      let longestStreak = 0;
      let tempStreak = 1;

      for (let i = 0; i < dates.length - 1; i++) {
        const current = new Date(dates[i]);
        const next = new Date(dates[i + 1]);
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      // Create recent days calendar
      const recent: { date: string; hasCheckIn: boolean }[] = [];
      const checkInSet = new Set(dates);
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        recent.push({
          date: dateStr,
          hasCheckIn: checkInSet.has(dateStr),
        });
      }

      setStreak({
        current: currentStreak,
        longest: longestStreak,
        lastCheckIn: dates[0],
      });
      setRecentDays(recent);
    } catch (error) {
      console.error('Error fetching streak:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${streak.current > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <CardTitle>Check-In Streak</CardTitle>
          </div>
          {streak.current >= 7 && (
            <Badge variant="default" className="gap-1">
              <Flame className="h-3 w-3" />
              On Fire!
            </Badge>
          )}
        </div>
        <CardDescription>
          {goalId ? 'Track your consistency for this goal' : 'Track your consistency across all goals'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-4xl font-bold text-primary mb-1">
              {streak.current}
            </div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
            <p className="text-xs text-muted-foreground mt-1">
              {streak.current === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted">
            <div className="text-4xl font-bold mb-1 flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6" />
              {streak.longest}
            </div>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
            <p className="text-xs text-muted-foreground mt-1">
              Personal Record
            </p>
          </div>
        </div>

        {/* Recent Days Calendar */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Last 7 Days</p>
          <div className="grid grid-cols-7 gap-2">
            {recentDays.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div key={index} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">{dayName}</p>
                  <div 
                    className={`aspect-square rounded-lg flex items-center justify-center ${
                      day.hasCheckIn 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {day.hasCheckIn ? (
                      <Calendar className="h-4 w-4" />
                    ) : (
                      <div className="h-2 w-2 rounded-full bg-muted-foreground/20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation Message */}
        {streak.current > 0 && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-sm text-green-700 dark:text-green-400">
              {streak.current >= 30 
                ? "🎉 Amazing! You've built a powerful habit!"
                : streak.current >= 14
                ? "💪 Great momentum! Keep it going!"
                : streak.current >= 7
                ? "🔥 You're on fire! One week strong!"
                : "✨ Great start! Keep the momentum!"}
            </p>
          </div>
        )}

        {streak.current === 0 && (
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Start your streak today by completing a check-in!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
