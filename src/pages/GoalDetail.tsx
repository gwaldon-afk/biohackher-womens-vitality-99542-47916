import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { useGoalCheckIns } from "@/hooks/useGoalCheckIns";
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
  const { goals, updateGoal, archiveGoal, completeGoal, loading: goalsLoading } = useGoals();
  const { checkIns, fetchCheckIns, loading: checkInsLoading } = useGoalCheckIns();
  
  const [activeTab, setActiveTab] = useState("overview");
  
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="checkins">Check-ins</TabsTrigger>
            <TabsTrigger value="plan">Action Plan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Healthspan Target */}
            {goal.healthspan_target && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Healthspan Target
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(goal.healthspan_target, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Aging Blueprint */}
            {goal.aging_blueprint && (
              <Card>
                <CardHeader>
                  <CardTitle>Aging Blueprint</CardTitle>
                  <CardDescription>
                    Your personalized plan for achieving this goal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(goal.aging_blueprint, null, 2)}
                  </pre>
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
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Check-in
              </Button>
            </div>

            {checkInsLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading check-ins...</p>
            ) : checkIns && checkIns.length > 0 ? (
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <Card key={checkIn.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {format(new Date(checkIn.check_in_date), 'MMMM d, yyyy')}
                        </CardTitle>
                        <Badge variant="outline">
                          {Math.round(checkIn.progress_percentage || 0)}% Complete
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {checkIn.whats_working && (
                        <div>
                          <p className="text-sm font-semibold text-green-600 mb-1">What's Working</p>
                          <p className="text-sm text-muted-foreground">{checkIn.whats_working}</p>
                        </div>
                      )}
                      {checkIn.whats_not_working && (
                        <div>
                          <p className="text-sm font-semibold text-red-600 mb-1">What's Not Working</p>
                          <p className="text-sm text-muted-foreground">{checkIn.whats_not_working}</p>
                        </div>
                      )}
                      {checkIn.barriers_encountered && checkIn.barriers_encountered.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Barriers</p>
                          <div className="flex flex-wrap gap-2">
                            {checkIn.barriers_encountered.map((barrier, idx) => (
                              <Badge key={idx} variant="secondary">{barrier}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {checkIn.confidence_level !== null && (
                        <div className="flex items-center gap-4 text-sm">
                          <span>Confidence: {checkIn.confidence_level}/10</span>
                          <span>Motivation: {checkIn.motivation_level}/10</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No check-ins yet</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Check-in
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Plan Tab */}
          <TabsContent value="plan" className="space-y-6 mt-6">
            {/* Barriers Plan */}
            {goal.barriers_plan && (
              <Card>
                <CardHeader>
                  <CardTitle>Barriers & Solutions</CardTitle>
                  <CardDescription>
                    Anticipated challenges and how to overcome them
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(goal.barriers_plan, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Adaptive Recommendations */}
            {goal.adaptive_recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle>Adaptive Recommendations</CardTitle>
                  <CardDescription>
                    Personalized suggestions based on your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {JSON.stringify(goal.adaptive_recommendations, null, 2)}
                  </pre>
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
        </Tabs>
      </main>
    </div>
  );
};

export default GoalDetail;
