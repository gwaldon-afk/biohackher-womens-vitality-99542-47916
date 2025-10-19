import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Flame } from "lucide-react";

interface SimpleProgressTrackerProps {
  completedCount: number;
  totalCount: number;
  estimatedMinutesRemaining: number;
  dailyStreak: number;
}

export const SimpleProgressTracker = ({ 
  completedCount, 
  totalCount, 
  estimatedMinutesRemaining,
  dailyStreak 
}: SimpleProgressTrackerProps) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="text-lg">Today's Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-bold text-primary">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedCount} of {totalCount} completed</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Time Left</p>
              <p className="text-sm font-medium">{estimatedMinutesRemaining} min</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Streak</p>
              <p className="text-sm font-medium">{dailyStreak} days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
