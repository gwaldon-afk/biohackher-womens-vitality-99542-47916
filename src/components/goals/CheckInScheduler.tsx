import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Bell } from "lucide-react";
import { HealthGoal } from "@/hooks/useGoals";
import { QuickCheckInDialog } from "./QuickCheckInDialog";

interface CheckInSchedulerProps {
  goals: HealthGoal[];
  onCheckInComplete?: () => void;
}

export const CheckInScheduler = ({ goals, onCheckInComplete }: CheckInSchedulerProps) => {
  const [dueGoals, setDueGoals] = useState<HealthGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Calculate which goals are due for check-in
    const today = new Date();
    const due = goals.filter(goal => {
      if (goal.status !== 'active') return false;
      
      if (!goal.last_check_in_date) return true; // Never checked in
      
      const lastCheckIn = new Date(goal.last_check_in_date);
      const daysSince = Math.floor((today.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check based on frequency
      switch (goal.check_in_frequency) {
        case 'daily':
          return daysSince >= 1;
        case 'weekly':
          return daysSince >= 7;
        case 'biweekly':
          return daysSince >= 14;
        case 'monthly':
          return daysSince >= 30;
        default:
          return daysSince >= 7;
      }
    });

    setDueGoals(due);
    setLoading(false);
  }, [goals]);

  if (loading) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (dueGoals.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Check-Ins Due</CardTitle>
            </div>
            <Badge variant="secondary">{dueGoals.length}</Badge>
          </div>
          <CardDescription>
            {dueGoals.length === 1 
              ? "You have 1 goal ready for a check-in"
              : `You have ${dueGoals.length} goals ready for check-ins`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dueGoals.slice(0, 3).map(goal => {
            const daysSince = goal.last_check_in_date 
              ? Math.floor((new Date().getTime() - new Date(goal.last_check_in_date).getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div 
                key={goal.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{goal.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {daysSince !== null ? (
                      <>
                        <Clock className="h-3 w-3" />
                        <span>{daysSince} days since last check-in</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="h-3 w-3" />
                        <span>First check-in</span>
                      </>
                    )}
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setSelectedGoal(goal)}
                >
                  Quick Check-In
                </Button>
              </div>
            );
          })}

          {dueGoals.length > 3 && (
            <p className="text-sm text-muted-foreground text-center pt-2">
              +{dueGoals.length - 3} more goal{dueGoals.length - 3 !== 1 ? 's' : ''} due for check-in
            </p>
          )}
        </CardContent>
      </Card>

      {selectedGoal && (
        <QuickCheckInDialog
          goal={selectedGoal}
          open={!!selectedGoal}
          onOpenChange={(open) => !open && setSelectedGoal(null)}
          onSuccess={() => {
            onCheckInComplete?.();
            setSelectedGoal(null);
          }}
        />
      )}
    </>
  );
};
