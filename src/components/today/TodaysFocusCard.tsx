import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDailyPlan } from "@/hooks/useDailyPlan";

export const TodaysFocusCard = () => {
  const navigate = useNavigate();
  const { actions, loading, completedCount, totalCount, top3 } = useDailyPlan();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading your daily plan...</p>
        </CardContent>
      </Card>
    );
  }

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Focus</CardTitle>
          <Badge variant="secondary">
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Ring */}
        <div className="flex items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${(completionPercentage / 100) * 251} 251`}
                className="text-primary transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{completionPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Top 3 Priority Actions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Top Priorities</p>
          {top3.length > 0 ? (
            top3.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                {action.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{action.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {action.category}
                    </Badge>
                    {action.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {action.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No actions planned for today</p>
          )}
        </div>

        {/* CTA to Full Today Page */}
        <Button 
          onClick={() => navigate('/today')} 
          className="w-full"
          variant="default"
        >
          View Full Daily Plan
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
