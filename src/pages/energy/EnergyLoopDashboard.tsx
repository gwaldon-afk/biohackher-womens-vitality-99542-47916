import { useNavigate } from "react-router-dom";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EnergyLoopCircle } from "@/components/energy/EnergyLoopCircle";
import { EnergyInsightCards } from "@/components/energy/EnergyInsightCards";
import { EnergyLoopLegend } from "@/components/energy/EnergyLoopLegend";
import { EnergyAnalysisCard } from "@/components/energy/EnergyAnalysisCard";
import { Zap, Plus } from "lucide-react";
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
    { name: "Rest", score: currentScore.sleep_recovery_score, color: "#4A90E2", icon: "🌙" },
    { name: "Calm", score: currentScore.stress_load_score, color: "#F5A623", icon: "💨" },
    { name: "Fuel", score: currentScore.nutrition_score, color: "#7ED321", icon: "🩸" },
    { name: "Move", score: currentScore.movement_quality_score, color: "#E94B8E", icon: "🏃‍♀️" },
    { name: "Flow", score: currentScore.hormonal_rhythm_score, color: "#9B51E0", icon: "🌸" }
  ];

  const unacknowledgedInsights = insights.filter(i => !i.acknowledged && !i.dismissed_at);

  const getEnergyMessage = (score: number) => {
    if (score >= 80) return { text: "You're thriving!", color: "text-primary" };
    if (score >= 60) return { text: "You're doing well", color: "text-primary" };
    if (score >= 40) return { text: "Room to optimize", color: "text-warning" };
    return { text: "Let's rebuild together", color: "text-muted-foreground" };
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Energy Loop
            </h1>
            <p className="text-muted-foreground text-lg">
              Your holistic energy tracking system
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/energy-loop/onboarding')}
          >
            How It Works
          </Button>
        </div>

        <Card className="p-8 bg-gradient-to-br from-background to-muted/20 border-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Energy Loop Circle */}
            <div className="flex flex-col items-center">
              <EnergyLoopCircle
                segments={segments}
                compositeScore={currentScore.composite_score}
                size={280}
              />
              <div className="text-center mt-6">
                <p className={`text-2xl font-semibold ${getEnergyMessage(currentScore.composite_score).color}`}>
                  {getEnergyMessage(currentScore.composite_score).text}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Loop Completion: {Math.round(currentScore.loop_completion_percent)}%
                </p>
              </div>
            </div>

            {/* Quick Stats & CTA */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {segments.map((segment) => (
                  <div key={segment.name} className="bg-background/50 rounded-lg p-4 border hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{segment.icon}</span>
                      <span className="text-sm font-medium">{segment.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{Math.round(segment.score)}</span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={() => navigate('/energy-loop/check-in')}
                size="lg"
                className="w-full"
              >
                <Plus className="mr-2 h-5 w-5" />
                Daily Check-In
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/energy-loop/progress')}
                  className="flex-1"
                >
                  View Progress
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/energy-actions')}
                  className="flex-1"
                >
                  Biohacks
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Section */}
      {unacknowledgedInsights.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Insights</h2>
          <EnergyInsightCards
            insights={unacknowledgedInsights}
            onAcknowledge={acknowledgeInsight}
            onDismiss={dismissInsight}
          />
        </div>
      )}

      {/* Analysis & Legend Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EnergyAnalysisCard score={currentScore} />
        </div>
        <div>
          <EnergyLoopLegend />
        </div>
      </div>
    </div>
  );
}
