import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Sparkles, Clock, AlertCircle, Calendar } from "lucide-react";
import { formatDistanceToNow, differenceInDays, differenceInMonths } from "date-fns";
import { useNavigate } from "react-router-dom";

interface AssessmentReminder {
  type: "lis" | "hormone_compass";
  title: string;
  lastCompleted: Date;
  recommendedInterval: number; // in months
  status: "overdue" | "due_soon" | "ok";
  daysOverdue?: number;
  icon: React.ReactNode;
  color: string;
  retakePath: string;
}

export const AssessmentReminders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reminders, setReminders] = useState<AssessmentReminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkAssessmentDates();
    }
  }, [user]);

  const checkAssessmentDates = async () => {
    if (!user) return;

    try {
      const now = new Date();
      const newReminders: AssessmentReminder[] = [];

      // Check LIS assessments (recommended every 3 months)
      const { data: lisData } = await supabase
        .from("daily_scores")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("is_baseline", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lisData) {
        const lastLISDate = new Date(lisData.created_at);
        const monthsSince = differenceInMonths(now, lastLISDate);
        const daysSince = differenceInDays(now, lastLISDate);
        const recommendedInterval = 3; // 3 months

        let status: "overdue" | "due_soon" | "ok" = "ok";
        let daysOverdue: number | undefined;

        if (monthsSince >= recommendedInterval) {
          status = "overdue";
          daysOverdue = daysSince - recommendedInterval * 30;
        } else if (monthsSince >= recommendedInterval - 0.5) {
          // Within 2 weeks of due date
          status = "due_soon";
        }

        if (status !== "ok") {
          newReminders.push({
            type: "lis",
            title: "Longevity Impact Score Assessment",
            lastCompleted: lastLISDate,
            recommendedInterval,
            status,
            daysOverdue,
            icon: <Activity className="h-5 w-5" />,
            color: status === "overdue" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400",
            retakePath: "/guest-lis-assessment",
          });
        }
      }

      // Check Hormone Compass assessments (recommended every 6 months)
      const { data: hcData } = await supabase
        .from("hormone_compass_stages")
        .select("calculated_at")
        .eq("user_id", user.id)
        .order("calculated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (hcData) {
        const lastHCDate = new Date(hcData.calculated_at);
        const monthsSince = differenceInMonths(now, lastHCDate);
        const daysSince = differenceInDays(now, lastHCDate);
        const recommendedInterval = 6; // 6 months

        let status: "overdue" | "due_soon" | "ok" = "ok";
        let daysOverdue: number | undefined;

        if (monthsSince >= recommendedInterval) {
          status = "overdue";
          daysOverdue = daysSince - recommendedInterval * 30;
        } else if (monthsSince >= recommendedInterval - 0.5) {
          // Within 2 weeks of due date
          status = "due_soon";
        }

        if (status !== "ok") {
          newReminders.push({
            type: "hormone_compass",
            title: "Hormone Compass Assessment",
            lastCompleted: lastHCDate,
            recommendedInterval,
            status,
            daysOverdue,
            icon: <Sparkles className="h-5 w-5" />,
            color: status === "overdue" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400",
            retakePath: "/hormone-compass/assessment",
          });
        }
      }

      setReminders(newReminders);
    } catch (error) {
      console.error("Error checking assessment dates:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || reminders.length === 0) return null;

  // Sort by status priority (overdue first, then due_soon)
  const sortedReminders = [...reminders].sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (a.status !== "overdue" && b.status === "overdue") return 1;
    return 0;
  });

  return (
    <div className="space-y-3">
      {sortedReminders.map((reminder) => (
        <Alert
          key={reminder.type}
          className={`border-2 ${
            reminder.status === "overdue"
              ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
              : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`mt-0.5 ${reminder.color}`}>{reminder.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{reminder.title}</p>
                  {reminder.status === "overdue" ? (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Overdue
                    </Badge>
                  ) : (
                    <Badge variant="default" className="bg-yellow-500 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Due Soon
                    </Badge>
                  )}
                </div>
                <AlertDescription className="text-sm">
                  {reminder.status === "overdue" ? (
                    <>
                      Your {reminder.title.toLowerCase()} is{" "}
                      <span className="font-semibold">{reminder.daysOverdue} days overdue</span>. Last
                      completed {formatDistanceToNow(reminder.lastCompleted, { addSuffix: true })}.
                      <br />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        Recommended every {reminder.recommendedInterval} months to track progress
                      </span>
                    </>
                  ) : (
                    <>
                      Your {reminder.title.toLowerCase()} is due for a retake. Last completed{" "}
                      {formatDistanceToNow(reminder.lastCompleted, { addSuffix: true })}.
                      <br />
                      <span className="text-xs text-muted-foreground mt-1 block">
                        Recommended every {reminder.recommendedInterval} months to track progress
                      </span>
                    </>
                  )}
                </AlertDescription>
              </div>
            </div>
            <Button
              size="sm"
              variant={reminder.status === "overdue" ? "default" : "outline"}
              onClick={() => navigate(reminder.retakePath)}
              className="flex-shrink-0 gap-2"
            >
              <Calendar className="h-3 w-3" />
              Retake Now
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
};
