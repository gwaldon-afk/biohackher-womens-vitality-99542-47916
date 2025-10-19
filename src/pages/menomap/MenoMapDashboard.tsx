import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenoMapStageCompass } from "@/components/menomap/MenoMapStageCompass";
import { MenoMapInsightCard } from "@/components/menomap/MenoMapInsightCard";
import { useMenoMap } from "@/hooks/useMenoMap";
import { Activity, TrendingUp, Calendar, Lightbulb, ArrowRight, Home } from "lucide-react";
import { format } from "date-fns";

export default function MenoMapDashboard() {
  const navigate = useNavigate();
  const { 
    currentStage, 
    symptoms, 
    insights, 
    isEnabled,
    acknowledgeInsight, 
    dismissInsight 
  } = useMenoMap();

  if (!isEnabled || !currentStage) {
    return (
      <div className="container max-w-4xl py-8">
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle>Welcome to MenoMap™</CardTitle>
            <CardDescription>
              Map your menopause journey with AI-powered insights and personalized tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              MenoMap helps you understand your hormonal stage, track symptoms, and get 
              biohacks tailored to your body's unique journey.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Back to My Plan
              </Button>
              <Button 
                onClick={() => navigate('/menomap/assessment')}
                className="flex-1 gap-2"
              >
                Start Your Assessment
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentSymptoms = symptoms.slice(0, 7);
  const unacknowledgedInsights = insights.filter(i => !i.acknowledged);

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">MenoMap™ Dashboard</h1>
        <p className="text-muted-foreground">
          Your personalized menopause journey intelligence
        </p>
      </div>

      {/* Stage Overview */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="pt-8">
          <MenoMapStageCompass 
            currentStage={currentStage.stage}
            confidenceScore={currentStage.confidence_score || undefined}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Symptoms Tracked</span>
              </div>
              <p className="text-3xl font-bold">{symptoms.length}</p>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Active Insights</span>
              </div>
              <p className="text-3xl font-bold">{unacknowledgedInsights.length}</p>
              <p className="text-xs text-muted-foreground">Personalized for you</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Stage Progress</span>
              </div>
              <p className="text-3xl font-bold">{currentStage.confidence_score || 0}%</p>
              <p className="text-xs text-muted-foreground">Confidence level</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-lg font-bold">
                {format(new Date(currentStage.calculated_at), 'MMM d')}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(currentStage.calculated_at), 'yyyy')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {unacknowledgedInsights.length > 0 ? (
            unacknowledgedInsights.map(insight => (
              <MenoMapInsightCard
                key={insight.id}
                insight={insight}
                onAcknowledge={acknowledgeInsight}
                onDismiss={dismissInsight}
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No new insights available. Keep tracking to get personalized recommendations!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Symptom Tracking</h3>
            <Button onClick={() => navigate('/menomap/tracker')}>
              Track New Symptom
            </Button>
          </div>

          {recentSymptoms.length > 0 ? (
            <div className="space-y-2">
              {recentSymptoms.map(symptom => (
                <Card key={symptom.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{symptom.symptom_name}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {symptom.symptom_category}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Severity</p>
                          <p className="text-2xl font-bold">{symptom.severity}/5</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(symptom.tracked_date), 'MMM d')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No symptoms tracked yet. Start tracking to see patterns over time!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Journey Timeline</CardTitle>
              <CardDescription>
                Track your progress through menopause stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Progress tracking features coming soon. Continue tracking symptoms to see your journey unfold!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
