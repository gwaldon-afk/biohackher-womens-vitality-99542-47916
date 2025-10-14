import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useLISData } from "@/hooks/useLISData";
import { differenceInDays } from "date-fns";

export const GoalInsightsCard = () => {
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { dailyScores, currentScore } = useLISData();

  const activeGoals = goals.filter((g) => g.status === "active");

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Goal Progress Insights
          </CardTitle>
          <CardDescription>
            Track how your daily actions contribute to goal achievement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Set goals to see AI-powered insights on your progress
            </p>
            <Button onClick={() => navigate("/my-goals/wizard")}>
              <Target className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate insights for each goal
  const goalInsights = activeGoals.map((goal) => {
    const daysSinceStart = goal.created_at 
      ? differenceInDays(new Date(), new Date(goal.created_at))
      : 0;
    
    const lastCheckIn = goal.last_check_in_date 
      ? differenceInDays(new Date(), new Date(goal.last_check_in_date))
      : null;

    // Simple correlation: if LIS score improved and goal progress increased
    const progressRate = daysSinceStart > 0 
      ? (goal.current_progress / daysSinceStart).toFixed(2)
      : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let insight = '';

    if (goal.current_progress >= 75) {
      trend = 'up';
      insight = `Excellent progress! You're ${Math.round(goal.current_progress)}% towards your goal.`;
    } else if (goal.current_progress >= 50) {
      trend = 'up';
      insight = `Good momentum! Continue your daily tracking to reach your goal.`;
    } else if (lastCheckIn && lastCheckIn > 14) {
      trend = 'down';
      insight = `No check-in for ${lastCheckIn} days. Schedule a progress review to stay on track.`;
    } else {
      insight = `Keep going! Daily LIS submissions help track your progress.`;
    }

    return {
      goal,
      daysSinceStart,
      lastCheckIn,
      progressRate,
      trend,
      insight
    };
  });

  const getPillarColor = (pillar: string) => {
    const colors = {
      brain: "text-primary",
      body: "text-green-600",
      balance: "text-blue-600",
      beauty: "text-pink-600",
    };
    return colors[pillar as keyof typeof colors] || "text-gray-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Goal Progress Insights
        </CardTitle>
        <CardDescription>
          AI-generated insights on your health goal progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goalInsights.slice(0, 3).map(({ goal, trend, insight, daysSinceStart }) => (
          <div 
            key={goal.id}
            className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/my-goals/${goal.id}`)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-semibold text-sm ${getPillarColor(goal.pillar_category)}`}>
                    {goal.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {goal.pillar_category}
                  </Badge>
                </div>
                <Progress value={goal.current_progress} className="h-1.5 mb-2" />
              </div>
              <div className="ml-4 flex flex-col items-end">
                <span className="text-lg font-bold">{Math.round(goal.current_progress)}%</span>
                {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{insight}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>{daysSinceStart} days active</span>
              {goal.next_check_in_due && (
                <span>Next check-in: {new Date(goal.next_check_in_due).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}

        {goalInsights.length > 3 && (
          <p className="text-xs text-center text-muted-foreground">
            +{goalInsights.length - 3} more goals
          </p>
        )}

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate("/my-goals")}
        >
          View All Goals
        </Button>
      </CardContent>
    </Card>
  );
};
