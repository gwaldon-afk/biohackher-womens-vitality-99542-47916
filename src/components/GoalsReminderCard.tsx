import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";

export const GoalsReminderCard = () => {
  const navigate = useNavigate();
  const { goals, loading } = useGoals();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const hasGoals = activeGoals.length > 0;

  if (!hasGoals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Set goals to track your health journey and stay motivated.
          </p>
          <Button onClick={() => navigate('/my-goals')} className="w-full">
            Create Your First Goal
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall progress
  const totalProgress = activeGoals.reduce((sum, goal) => sum + (goal.current_progress || 0), 0);
  const avgProgress = Math.round(totalProgress / activeGoals.length);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Goals
          </CardTitle>
          <Badge variant="secondary">
            {activeGoals.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{avgProgress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${avgProgress}%` }}
              />
            </div>
          </div>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>

        {/* Goal Preview List */}
        <div className="space-y-2">
          {activeGoals.slice(0, 3).map((goal) => (
            <div 
              key={goal.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate(`/goals/${goal.id}`)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{goal.title}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {goal.pillar_category}
                </Badge>
              </div>
              <span className="text-sm font-semibold text-primary ml-2">
                {goal.current_progress || 0}%
              </span>
            </div>
          ))}
        </div>

        {activeGoals.length > 3 && (
          <p className="text-xs text-muted-foreground text-center">
            +{activeGoals.length - 3} more goal{activeGoals.length - 3 !== 1 ? 's' : ''}
          </p>
        )}

        {/* CTA to Full Goals Page */}
        <Button 
          onClick={() => navigate('/my-goals')} 
          className="w-full"
          variant="outline"
        >
          Manage All Goals
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
