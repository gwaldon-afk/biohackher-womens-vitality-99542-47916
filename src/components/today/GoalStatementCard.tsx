import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Plus } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";

export const GoalStatementCard = () => {
  const { goals } = useGoals();
  const navigate = useNavigate();
  const primaryGoal = goals.find(g => g.status === 'active');

  if (!primaryGoal) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center">
          <Target className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No active goal yet</p>
          <Button 
            onClick={() => navigate('/my-goals')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Your First Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysSinceStart = Math.floor((new Date().getTime() - new Date(primaryGoal.created_at).getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 90; // Default 90-day goal
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
