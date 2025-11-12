import { useEffect } from "react";
import { useGoals } from "@/hooks/useGoals";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export const HealthGoalsTab = () => {
  const { goals, loading, fetchGoals } = useGoals();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const getPillarColor = (pillar: string) => {
    const colors: Record<string, string> = {
      brain: "bg-purple-500",
      body: "bg-blue-500",
      balance: "bg-green-500",
      beauty: "bg-pink-500",
    };
    return colors[pillar] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No health goals yet</h3>
          <p className="text-muted-foreground mb-4">
            Set your first health goal to start your longevity journey
          </p>
          <Button onClick={() => navigate("/my-goals/wizard")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Goals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Active Goals ({activeGoals.length})</h3>
          <Button size="sm" onClick={() => navigate("/my-goals/wizard")}>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {activeGoals.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No active goals
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <Card
                key={goal.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/my-goals/${goal.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getPillarColor(goal.pillar_category)}>
                          {goal.pillar_category}
                        </Badge>
                        <h4 className="font-semibold">{goal.title}</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${goal.current_progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{goal.current_progress}%</span>
                        </div>
                        {goal.next_check_in_due && (
                          <p className="text-xs text-muted-foreground">
                            Next check-in: {new Date(goal.next_check_in_due).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Completed Goals ({completedGoals.length})</h3>
          <div className="space-y-3">
            {completedGoals.map((goal) => (
              <Card
                key={goal.id}
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getPillarColor(goal.pillar_category)} variant="outline">
                        {goal.pillar_category}
                      </Badge>
                      <span className="font-medium line-through">{goal.title}</span>
                    </div>
                    <Badge className="bg-green-500">Completed</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
