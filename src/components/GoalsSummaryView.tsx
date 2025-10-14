import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";

export const GoalsSummaryView = () => {
  const navigate = useNavigate();
  const { goals, loading, tierFeatures, canUserCreateGoal } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");
  const hasGoals = activeGoals.length > 0;

  const getPillarColor = (pillar: string) => {
    const colors = {
      brain: "bg-primary",
      body: "bg-green-500",
      balance: "bg-blue-500",
      beauty: "bg-pink-500",
    };
    return colors[pillar as keyof typeof colors] || "bg-gray-500";
  };

  const getPillarIcon = (pillar: string) => {
    return pillar.charAt(0).toUpperCase() + pillar.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">Loading goals...</p>
        </CardContent>
      </Card>
    );
  }

  // Empty state for users with no goals
  if (!hasGoals) {
    return (
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
            <Target className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Start Your Health Journey</CardTitle>
          <CardDescription className="text-base">
            Your health journey begins with setting clear, actionable goals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-background/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">The Journey:</h4>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</span>
                Goals
              </span>
              <span>→</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</span>
                Assess
              </span>
              <span>→</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">3</span>
                Plan
              </span>
              <span>→</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">4</span>
                Track
              </span>
              <span>→</span>
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">5</span>
                Improve
              </span>
            </div>
          </div>
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => navigate("/my-goals/wizard")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Goals summary for users with goals
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Your Active Goals
        </h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/my-goals")}
        >
          View All
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {activeGoals.slice(0, 6).map((goal) => (
          <Card 
            key={goal.id} 
            className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
            onClick={() => navigate(`/my-goals/${goal.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <Badge className={getPillarColor(goal.pillar_category)}>
                  {getPillarIcon(goal.pillar_category)}
                </Badge>
                <span className="text-xl font-bold text-primary">{Math.round(goal.current_progress)}%</span>
              </div>
              <CardTitle className="text-base line-clamp-2">{goal.title}</CardTitle>
              {goal.next_check_in_due && (
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Clock className="h-3 w-3" />
                  Check-in: {new Date(goal.next_check_in_due).toLocaleDateString()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <Progress value={goal.current_progress} className="h-1.5" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/my-goals/wizard")}
          disabled={!tierFeatures?.isUnlimited && activeGoals.length >= (tierFeatures?.maxActiveGoals || 0)}
          className="flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Goal
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/my-goals")}
          className="flex-1"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Track Progress
        </Button>
      </div>

      {/* Tier limit indicator */}
      {tierFeatures && !tierFeatures.isUnlimited && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">
                  Active Goals: {activeGoals.length} / {tierFeatures.maxActiveGoals}
                </p>
                <Progress 
                  value={(activeGoals.length / tierFeatures.maxActiveGoals) * 100} 
                  className="h-1.5"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/upgrade")}
                className="ml-4 text-xs"
              >
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
