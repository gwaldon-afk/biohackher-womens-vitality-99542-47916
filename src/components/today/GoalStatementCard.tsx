import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

export const GoalStatementCard = () => {
  const { goals } = useGoals();
  const primaryGoal = goals.find(g => g.status === 'active');

  if (!primaryGoal) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>Set a goal to get started</p>
        </CardContent>
      </Card>
    );
  }

  const daysSinceStart = Math.floor((new Date().getTime() - new Date(primaryGoal.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = primaryGoal.timeframe_days || 90;
  const progress = Math.min(Math.round((daysSinceStart / totalDays) * 100), 100);

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Your Goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-lg font-medium">{primaryGoal.title}</p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Day {daysSinceStart} of {totalDays}</span>
          <span className="font-medium text-primary">{progress}% Complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
