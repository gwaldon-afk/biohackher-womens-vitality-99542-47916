import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";

export const GoalWorkingTowards = () => {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");

  if (activeGoals.length === 0) {
    return null;
  }

  const getPillarColor = (pillar: string) => {
    const colors = {
      brain: "bg-primary text-primary-foreground",
      body: "bg-green-500 text-white",
      balance: "bg-blue-500 text-white",
      beauty: "bg-pink-500 text-white",
    };
    return colors[pillar as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const getPillarIcon = (pillar: string) => {
    return pillar.charAt(0).toUpperCase() + pillar.slice(1);
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Working Towards
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/my-goals")}
            className="text-xs h-7"
          >
            View All
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.slice(0, 3).map((goal) => (
          <div 
            key={goal.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={() => navigate(`/my-goals/${goal.id}`)}
          >
            <Badge className={getPillarColor(goal.pillar_category)}>
              {getPillarIcon(goal.pillar_category)}
            </Badge>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{goal.title}</p>
              <Progress value={goal.current_progress} className="h-1 mt-1" />
            </div>
            <span className="text-xs font-semibold text-primary whitespace-nowrap">
              {Math.round(goal.current_progress)}%
            </span>
          </div>
        ))}
        {activeGoals.length > 3 && (
          <p className="text-xs text-center text-muted-foreground pt-1">
            +{activeGoals.length - 3} more goal{activeGoals.length - 3 > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
