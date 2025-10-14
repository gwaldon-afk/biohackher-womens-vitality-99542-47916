import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { differenceInDays } from "date-fns";

export const GoalCheckInAlert = () => {
  const navigate = useNavigate();
  const { goals } = useGoals();

  const activeGoals = goals.filter((g) => g.status === "active");
  
  // Find goals that are overdue for check-in
  const overdueGoals = activeGoals.filter((goal) => {
    if (!goal.next_check_in_due) return false;
    const dueDate = new Date(goal.next_check_in_due);
    const today = new Date();
    return dueDate < today;
  });

  // Find goals due soon (within 3 days)
  const dueSoonGoals = activeGoals.filter((goal) => {
    if (!goal.next_check_in_due) return false;
    const dueDate = new Date(goal.next_check_in_due);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    return daysUntilDue >= 0 && daysUntilDue <= 3;
  });

  if (overdueGoals.length === 0 && dueSoonGoals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Overdue check-ins */}
      {overdueGoals.length > 0 && (
        <Alert variant="destructive" className="border-red-500/50 bg-red-50/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2">
            {overdueGoals.length} Goal Check-in{overdueGoals.length > 1 ? 's' : ''} Overdue
            <Badge variant="destructive" className="ml-auto">Action Required</Badge>
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              Your goals need a progress update to stay on track:
            </p>
            <div className="space-y-1">
              {overdueGoals.map((goal) => {
                const daysOverdue = Math.abs(differenceInDays(new Date(), new Date(goal.next_check_in_due!)));
                return (
                  <div key={goal.id} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-xs text-red-700">{daysOverdue} day{daysOverdue > 1 ? 's' : ''} overdue</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-3">
              {overdueGoals.length === 1 && (
                <Button 
                  size="sm" 
                  onClick={() => navigate(`/my-goals/${overdueGoals[0].id}`)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Complete Check-in
                </Button>
              )}
              {overdueGoals.length > 1 && (
                <Button 
                  size="sm" 
                  onClick={() => navigate("/my-goals")}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Review All Check-ins
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Due soon check-ins */}
      {dueSoonGoals.length > 0 && (
        <Alert className="border-amber-500/50 bg-amber-50/50">
          <Clock className="h-4 w-4 text-amber-600" />
          <AlertTitle className="flex items-center gap-2">
            {dueSoonGoals.length} Upcoming Check-in{dueSoonGoals.length > 1 ? 's' : ''}
            <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700">Due Soon</Badge>
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p className="text-sm">
              Prepare to track your progress:
            </p>
            <div className="space-y-1">
              {dueSoonGoals.map((goal) => {
                const daysUntilDue = differenceInDays(new Date(goal.next_check_in_due!), new Date());
                return (
                  <div key={goal.id} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{goal.title}</span>
                    <span className="text-xs text-amber-700">
                      {daysUntilDue === 0 ? 'Today' : `In ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate("/my-goals")}
              className="mt-2 border-amber-600 text-amber-700 hover:bg-amber-100"
            >
              View Goals
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
