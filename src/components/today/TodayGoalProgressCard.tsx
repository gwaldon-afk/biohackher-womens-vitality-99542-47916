import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Calendar, CheckCircle2, TrendingUp } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { calculateGoalProgress } from "@/services/goalProgressService";
import { differenceInDays } from "date-fns";
import { useTranslation } from 'react-i18next';

interface GoalProgressData {
  id: string;
  title: string;
  pillarCategory: string;
  progress: number;
  daysRemaining: number;
  protocolAdherence: number;
}

export const TodayGoalProgressCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { goals, loading } = useGoals();
  const navigate = useNavigate();
  const [goalProgress, setGoalProgress] = useState<GoalProgressData[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const activeGoals = goals.filter(g => g.status === 'active');

  useEffect(() => {
    if (!user || activeGoals.length === 0) {
      setLoadingProgress(false);
      return;
    }

    const loadProgress = async () => {
      setLoadingProgress(true);
      const progressData: GoalProgressData[] = [];

      for (const goal of activeGoals) {
        const progress = await calculateGoalProgress(goal.id, user.id);
        
        // Calculate days remaining (assume 90-day cycle)
        const startDate = new Date(goal.created_at);
        const targetDate = new Date(startDate);
        targetDate.setDate(targetDate.getDate() + 90);
        const daysRemaining = Math.max(0, differenceInDays(targetDate, new Date()));

        // Extract protocol adherence from progress calculation
        // Progress is weighted: 40% time + 40% action + 20% outcome
        // We'll estimate adherence as the action component
        const protocolAdherence = Math.min(100, progress * 1.25); // Rough estimate

        progressData.push({
          id: goal.id,
          title: goal.title,
          pillarCategory: goal.pillar_category || 'General',
          progress,
          daysRemaining,
          protocolAdherence,
        });
      }

      setGoalProgress(progressData);
      setLoadingProgress(false);
    };

    loadProgress();
  }, [user, activeGoals.length]);

  if (loading || loadingProgress) {
    return (
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </Card>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{t('today.goals.setFirst')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('today.goals.setFirstDesc')}
            </p>
            <Button onClick={() => navigate('/my-goals')} size="sm">
              {t('today.goals.createGoal')}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const getPillarColor = (pillar: string) => {
    const colors: Record<string, string> = {
      Beauty: 'bg-pink-500/10 text-pink-700 border-pink-500/20',
      Body: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
      Brain: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
      Balance: 'bg-green-500/10 text-green-700 border-green-500/20',
      General: 'bg-primary/10 text-primary border-primary/20',
    };
    return colors[pillar] || colors.General;
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">{t('today.goals.title')}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/my-goals')}>
          {t('today.goals.viewAll')}
        </Button>
      </div>

      <div className="space-y-4">
        {goalProgress.map((goal) => (
          <div
            key={goal.id}
            className="p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
            onClick={() => navigate(`/goals/${goal.id}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium mb-1">{goal.title}</h4>
                <Badge variant="outline" className={`text-xs ${getPillarColor(goal.pillarCategory)}`}>
                  {goal.pillarCategory}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t('today.goals.overallProgress')}</span>
                <span className="text-sm font-semibold text-primary">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="h-2" />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{t('today.goals.daysLeft')}</div>
                  <div className="font-semibold">{goal.daysRemaining}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">{t('today.goals.protocolAdherence')}</div>
                  <div className="font-semibold">{Math.round(goal.protocolAdherence)}%</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeGoals.length > 2 && (
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/my-goals')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            {t('today.goals.viewAllGoals', { count: activeGoals.length })}
          </Button>
        </div>
      )}
    </Card>
  );
};
