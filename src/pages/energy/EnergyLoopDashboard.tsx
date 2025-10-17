import { useNavigate } from "react-router-dom";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnergyLoopCircle } from "@/components/energy/EnergyLoopCircle";
import { EnergyInsightCard } from "@/components/energy/EnergyInsightCard";
import { Zap, Plus, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EnergyLoopDashboard() {
  const navigate = useNavigate();
  const {
    isEnabled,
    currentScore,
    insights,
    loading,
    acknowledgeInsight,
    dismissInsight
  } = useEnergyLoop();

  if (!isEnabled) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center space-y-4">
          <Zap className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-3xl font-bold">Energy Loop</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Close the loop. Power your day. Track your daily energy using real-time biometrics and AI insights.
          </p>
          <Button size="lg" onClick={() => navigate('/energy-loop/onboarding')}>
            Get Started
          </Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!currentScore) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-3xl font-bold">Start Your First Check-In</h1>
          <p className="text-muted-foreground">
            Tell us how you're feeling today to begin tracking your energy loop.
          </p>
          <Button size="lg" onClick={() => navigate('/energy-loop/check-in')}>
            <Plus className="mr-2 h-5 w-5" />
            Daily Check-In
          </Button>
        </Card>
      </div>
    );
  }

  const segments = [
    { name: "Sleep Recovery", score: currentScore.sleep_recovery_score, color: "#4A90E2", icon: "🌙" },
    { name: "Stress Load", score: currentScore.stress_load_score, color: "#F5A623", icon: "💨" },
    { name: "Fuel & Nutrition", score: currentScore.nutrition_score, color: "#7ED321", icon: "🩸" },
    { name: "Movement Quality", score: currentScore.movement_quality_score, color: "#E94B8E", icon: "🏃‍♀️" },
    { name: "Hormonal Rhythm", score: currentScore.hormonal_rhythm_score, color: "#9B51E0", icon: "🌸" }
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Energy Loop</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/energy-loop/progress')}>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Progress
          </Button>
          <Button onClick={() => navigate('/energy-loop/check-in')}>
            <Plus className="mr-2 h-4 w-4" />
            Daily Check-In
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 flex flex-col items-center justify-center">
          <EnergyLoopCircle
            segments={segments}
            compositeScore={currentScore.composite_score}
            size={320}
          />
          <p className="text-sm text-muted-foreground mt-6">
            Loop Completion: {Math.round(currentScore.loop_completion_percent)}%
          </p>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => navigate('/energy-loop/actions')}>
              View Biohacks
            </Button>
            <Button onClick={() => navigate('/energy-loop/progress')}>
              View Progress
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Insights</h2>
          {insights.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              Keep tracking to unlock personalized insights!
            </Card>
          ) : (
            insights.map(insight => (
              <EnergyInsightCard
                key={insight.id}
                insight={insight}
                onAcknowledge={() => acknowledgeInsight(insight.id)}
                onDismiss={() => dismissInsight(insight.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
