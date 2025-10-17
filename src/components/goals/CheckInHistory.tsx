import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, TrendingUp, Zap, Target } from "lucide-react";
import { format } from "date-fns";

interface CheckIn {
  id: string;
  check_in_date: string;
  progress_percentage: number;
  motivation_level?: number;
  confidence_level?: number;
  whats_working?: string;
  whats_not_working?: string;
  barriers_encountered?: string[];
}

interface CheckInHistoryProps {
  checkIns: CheckIn[];
}

export const CheckInHistory = ({ checkIns }: CheckInHistoryProps) => {
  if (checkIns.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            No check-ins yet. Complete your first check-in to track your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {checkIns.map((checkIn, index) => {
        const prevCheckIn = checkIns[index + 1];
        const progressChange = prevCheckIn 
          ? checkIn.progress_percentage - prevCheckIn.progress_percentage 
          : 0;

        return (
          <Card key={checkIn.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(checkIn.check_in_date), 'PPP')}
                  </CardTitle>
                  <CardDescription>
                    Check-in #{checkIns.length - index}
                  </CardDescription>
                </div>
                {progressChange !== 0 && (
                  <Badge variant={progressChange > 0 ? "default" : "secondary"}>
                    {progressChange > 0 ? '+' : ''}{progressChange}%
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-medium">
                    <Target className="h-4 w-4" />
                    Progress
                  </span>
                  <span className="font-bold text-primary">{checkIn.progress_percentage}%</span>
                </div>
                <Progress value={checkIn.progress_percentage} className="h-2" />
              </div>

              {(checkIn.motivation_level || checkIn.confidence_level) && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  {checkIn.motivation_level && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Zap className="h-4 w-4 text-orange-500" />
                        Motivation
                      </div>
                      <p className="text-2xl font-bold">{checkIn.motivation_level}/10</p>
                    </div>
                  )}
                  {checkIn.confidence_level && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Confidence
                      </div>
                      <p className="text-2xl font-bold">{checkIn.confidence_level}/10</p>
                    </div>
                  )}
                </div>
              )}

              {checkIn.whats_working && (
                <div className="space-y-1 pt-2 border-t">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    What's Working
                  </p>
                  <p className="text-sm text-muted-foreground">{checkIn.whats_working}</p>
                </div>
              )}

              {checkIn.whats_not_working && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    What's Not Working
                  </p>
                  <p className="text-sm text-muted-foreground">{checkIn.whats_not_working}</p>
                </div>
              )}

              {checkIn.barriers_encountered && checkIn.barriers_encountered.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Barriers Encountered</p>
                  <div className="flex flex-wrap gap-2">
                    {checkIn.barriers_encountered.map((barrier, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {barrier}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
