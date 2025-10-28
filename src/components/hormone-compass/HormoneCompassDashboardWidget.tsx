import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HormoneCompassStageCompass } from "./HormoneCompassStageCompass";
import { HormoneCompassInsightCard } from "./HormoneCompassInsightCard";
import { ArrowRight, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";

export const HormoneCompassDashboardWidget = () => {
  const navigate = useNavigate();
  const { currentStage, insights, symptoms } = useHormoneCompass();

  if (!currentStage) {
    return (
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            Map Your Hormonal Journey
          </CardTitle>
          <CardDescription>
            Get personalized insights and track your hormonal transitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/hormone-compass/assessment')}
            className="w-full gap-2"
          >
            Start HormoneCompass™ Assessment
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const recentSymptoms = symptoms.slice(0, 5);
  const unacknowledgedInsights = insights.filter(i => !i.acknowledged).slice(0, 2);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🧭</span>
          HormoneCompass™
        </CardTitle>
        <CardDescription>Your hormonal journey insights</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Current Stage */}
        <div className="space-y-4">
          <HormoneCompassStageCompass 
            currentStage={currentStage.stage as 'pre' | 'early-peri' | 'mid-peri' | 'late-peri' | 'post'}
            confidenceScore={currentStage.confidence_score || undefined}
            size="sm"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Symptoms Tracked</span>
                </div>
                <p className="text-2xl font-bold">{symptoms.length}</p>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Active Insights</span>
                </div>
                <p className="text-2xl font-bold">{unacknowledgedInsights.length}</p>
                <p className="text-xs text-muted-foreground">Waiting for review</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Insights */}
        {unacknowledgedInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Latest Insights</h4>
            {unacknowledgedInsights.map(insight => (
              <HormoneCompassInsightCard
                key={insight.id}
                insight={insight as any}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate('/hormone-compass/tracker')}
        >
          Track Today's Symptoms
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
