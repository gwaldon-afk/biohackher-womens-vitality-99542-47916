import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Target, TrendingUp, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useProtocols } from "@/hooks/useProtocols";
import { useLISData } from "@/hooks/useLISData";
import { format, addDays, differenceInDays, startOfDay } from "date-fns";

export const NinetyDayPlanOverview = () => {
  const { goals, loading: goalsLoading } = useGoals();
  const { protocols, loading: protocolsLoading } = useProtocols();
  const { currentScore } = useLISData();

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const activeProtocols = protocols?.filter(p => p.is_active) || [];

  // Calculate timeline milestones
  const today = startOfDay(new Date());
  const day30 = addDays(today, 30);
  const day60 = addDays(today, 60);
  const day90 = addDays(today, 90);

  // Group goals by next check-in dates
  const upcomingMilestones = activeGoals
    .filter(g => g.next_check_in_due)
    .map(g => ({
      goal: g,
      daysUntil: differenceInDays(new Date(g.next_check_in_due!), today),
      targetDate: new Date(g.next_check_in_due!)
    }))
    .filter(m => m.daysUntil >= 0 && m.daysUntil <= 90)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  // Calculate weekly action plan
  const weeks = Array.from({ length: 13 }, (_, i) => ({
    weekNumber: i + 1,
    startDate: addDays(today, i * 7),
    endDate: addDays(today, (i + 1) * 7 - 1),
    goalsActive: activeGoals.length,
    protocolsActive: activeProtocols.length
  }));

  const loading = goalsLoading || protocolsLoading;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 bg-muted rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
          <div className="h-32 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Your 90-Day Personalised Plan
              </CardTitle>
              <CardDescription className="text-base">
                A comprehensive roadmap to achieve your health goals
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              Day 1 of 90
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Active Goals
              </div>
              <div className="text-3xl font-bold">{activeGoals.length}</div>
              <Progress value={(activeGoals.length / Math.max(activeGoals.length, 1)) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Active Interventions
              </div>
              <div className="text-3xl font-bold">{activeProtocols.length}</div>
              <Progress value={activeProtocols.length > 0 ? 100 : 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Upcoming Milestones
              </div>
              <div className="text-3xl font-bold">{upcomingMilestones.length}</div>
              <Progress value={(upcomingMilestones.length / Math.max(upcomingMilestones.length, 1)) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            90-Day Timeline
          </CardTitle>
          <CardDescription>
            Your weekly progress roadmap with key milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-4 lg:grid-cols-6">
            {weeks.map((week, idx) => {
              const milestonesThisWeek = upcomingMilestones.filter(
                m => m.targetDate >= week.startDate && m.targetDate <= week.endDate
              );
              const isCurrentWeek = idx === 0;

              return (
                <Card 
                  key={week.weekNumber}
                  className={`relative overflow-hidden transition-all hover:shadow-md ${
                    isCurrentWeek ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-medium">Week {week.weekNumber}</div>
                      {isCurrentWeek && <Badge variant="default" className="text-xs">Now</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(week.startDate, 'MMM d')}
                    </div>
                    {milestonesThisWeek.length > 0 && (
                      <div className="space-y-1">
                        {milestonesThisWeek.map((milestone, i) => (
                          <div key={i} className="text-xs truncate text-primary font-medium">
                            <Target className="h-3 w-3 inline mr-1" />
                            {milestone.goal.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestone Details */}
      {upcomingMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Milestones
            </CardTitle>
            <CardDescription>
              Key goal targets within the next 90 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMilestones.slice(0, 5).map((milestone, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="text-2xl font-bold text-primary">{milestone.daysUntil}</div>
                    <div className="text-xs text-muted-foreground">days</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="font-medium">{milestone.goal.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Target: {format(milestone.targetDate, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{milestone.goal.pillar_category}</Badge>
                      {milestone.goal.current_progress !== undefined && (
                        <div className="flex items-center gap-2 text-xs">
                          <Progress value={milestone.goal.current_progress} className="h-1.5 w-24" />
                          <span className="text-muted-foreground">{milestone.goal.current_progress}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day 30 Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              By {format(day30, 'MMM d, yyyy')}:
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Establish consistent daily habits</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Complete initial protocol phase</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>First assessment check-in</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day 60 Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              By {format(day60, 'MMM d, yyyy')}:
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Measurable progress on all goals</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Optimize protocol based on results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Mid-point assessment</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Day 90 Outcomes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              By {format(day90, 'MMM d, yyyy')}:
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Achieve primary goal milestones</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Visible health improvements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Plan next 90-day cycle</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Current Health Status */}
      {currentScore && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Health Analysis</CardTitle>
            <CardDescription>
              Based on your recent activity (30-day average)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-sm font-medium">Longevity Impact Score</span>
                <span className="text-2xl font-bold">{currentScore}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Your plan is designed to improve this score through targeted interventions aligned with your goals.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
