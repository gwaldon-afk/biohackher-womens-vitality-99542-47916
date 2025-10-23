import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useGoalCheckIns } from "@/hooks/useGoalCheckIns";
import { useGoalInsights } from "@/hooks/useGoalInsights";
import { GoalProtocolSync } from "@/components/goals/GoalProtocolSync";
import { GoalDataIntegration } from "@/components/goals/GoalDataIntegration";
import { GoalInsightsFeed } from "@/components/goals/GoalInsightsFeed";
import { QuickCheckInDialog } from "@/components/goals/QuickCheckInDialog";
import { CheckInHistory } from "@/components/goals/CheckInHistory";
import { GoalStreakTracker } from "@/components/goals/GoalStreakTracker";
import { GoalAchievements } from "@/components/goals/GoalAchievements";
import { MotivationalCard } from "@/components/goals/MotivationalCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, ArrowLeft, Calendar, TrendingUp, Clock, 
  Edit, Archive, CheckCircle2, AlertCircle, Plus 
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import Navigation from "@/components/Navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const { goals, updateGoal, archiveGoal, completeGoal, loading: goalsLoading, fetchGoals } = useGoals();
  const { checkIns, fetchCheckIns, loading: checkInsLoading } = useGoalCheckIns();
  const { unacknowledgedCount } = useGoalInsights(goalId);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  
  const goal = goals.find((g) => g.id === goalId);

  useEffect(() => {
    if (goalId) {
      fetchCheckIns(goalId);
    }
  }, [goalId]);

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Goal not found</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => navigate("/my-goals")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>
        </div>
      </div>
    );
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

  const isOverdue = goal.next_check_in_due && new Date(goal.next_check_in_due) < new Date();
  const daysSinceLastCheckIn = goal.last_check_in_date 
    ? differenceInDays(new Date(), new Date(goal.last_check_in_date))
    : null;

  const handleComplete = async () => {
    if (confirm("Mark this goal as completed?")) {
      await completeGoal(goal.id);
      navigate("/my-goals");
    }
  };

  const handleArchive = async () => {
    if (confirm("Archive this goal? You can view it later in archived goals.")) {
      await archiveGoal(goal.id);
      navigate("/my-goals");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/my-goals")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Goals
          </Button>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge className={getPillarColor(goal.pillar_category)}>
                  {getPillarIcon(goal.pillar_category)}
                </Badge>
                <Badge variant="outline">
                  {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{goal.title}</h1>
              <p className="text-muted-foreground">
                Created {format(new Date(goal.created_at), 'MMM d, yyyy')}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setShowQuickCheckIn(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                Quick Check-In
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              {goal.status === 'active' && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleComplete}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleArchive}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Check-in alert */}
        {isOverdue && (
          <Alert variant="destructive" className="mb-6">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              This goal is overdue for a check-in. Schedule a progress review to stay on track.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-primary mb-2">
                  {Math.round(goal.current_progress)}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <Progress value={goal.current_progress} className="mt-3" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold mb-2">
                  {checkIns?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Check-ins Completed</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {daysSinceLastCheckIn !== null 
                    ? `Last: ${daysSinceLastCheckIn} days ago`
                    : 'No check-ins yet'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-semibold mb-2">
                  {goal.check_in_frequency || 'Weekly'}
                </div>
                <p className="text-sm text-muted-foreground">Check-in Frequency</p>
                {goal.next_check_in_due && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Next: {format(new Date(goal.next_check_in_due), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <MotivationalCard 
          goalProgress={goal.current_progress}
          streakDays={0}
          recentCheckIn={daysSinceLastCheckIn !== null && daysSinceLastCheckIn <= 1}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="plan">Action Plan</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="insights">
              AI Insights
              {unacknowledgedCount > 0 && (
                <Badge className="ml-2 h-4 w-4 p-0 flex items-center justify-center text-xs" variant="destructive">
                  {unacknowledgedCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="integrations">Data</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Healthspan Target */}
            {goal.healthspan_target && Object.keys(goal.healthspan_target).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Healthspan Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(goal.healthspan_target).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aging Blueprint */}
            {goal.aging_blueprint && Object.keys(goal.aging_blueprint).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Aging Blueprint</CardTitle>
                  <CardDescription>
                    Your personalized plan for achieving this goal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(goal.aging_blueprint).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Optimization Plan */}
            {goal.ai_optimization_plan && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Optimization Insights</CardTitle>
                  <CardDescription>
                    Generated {goal.ai_generated_at 
                      ? format(new Date(goal.ai_generated_at), 'MMM d, yyyy')
                      : 'recently'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{goal.ai_optimization_plan}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Check-ins Tab */}
          <TabsContent value="checkins" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Progress Check-ins</h3>
              <Button size="sm" onClick={() => setShowQuickCheckIn(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Quick Check-in
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                {checkInsLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading check-ins...</p>
                ) : (
                  <CheckInHistory checkIns={checkIns || []} />
                )}
              </div>
              <div>
                <GoalStreakTracker goalId={goalId} />
              </div>
            </div>
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="plan" className="space-y-6 mt-6">
            {/* Barriers Plan */}
            {goal.barriers_plan && Object.keys(goal.barriers_plan).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Barriers & Solutions</CardTitle>
                  <CardDescription>
                    Anticipated challenges and how to overcome them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(goal.barriers_plan).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Adaptive Recommendations */}
            {goal.adaptive_recommendations && Object.keys(goal.adaptive_recommendations).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Adaptive Recommendations</CardTitle>
                  <CardDescription>
                    Personalized suggestions based on your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(goal.adaptive_recommendations).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-sm font-medium">{key}</p>
                        <p className="text-sm text-muted-foreground">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Biological Age Impact */}
            {goal.biological_age_impact_predicted !== null && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Biological Age Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Predicted Impact</p>
                      <p className="text-2xl font-bold">
                        {goal.biological_age_impact_predicted > 0 ? '-' : '+'}
                        {Math.abs(goal.biological_age_impact_predicted)} years
                      </p>
                    </div>
                    {goal.biological_age_impact_actual !== null && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Actual Impact</p>
                        <p className="text-2xl font-bold">
                          {goal.biological_age_impact_actual > 0 ? '-' : '+'}
                          {Math.abs(goal.biological_age_impact_actual)} years
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 mt-6">
            <GoalAchievements goalId={goalId} />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <GoalInsightsFeed goalId={goalId} />
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <GoalDataIntegration goal={goal} />
              </div>
              <div>
                <GoalProtocolSync goal={goal} onSync={() => fetchGoals()} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Quick Check-In Dialog */}
      {goal && (
        <QuickCheckInDialog
          goal={goal}
          open={showQuickCheckIn}
          onOpenChange={setShowQuickCheckIn}
          onSuccess={() => {
            fetchCheckIns(goal.id);
            fetchGoals();
            setShowQuickCheckIn(false);
          }}
        />
      )}
    </div>
  );
};

export default GoalDetail;
