import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EnergyLoopCircle } from "./EnergyLoopCircle";
import { EnergyLoopScore } from "@/hooks/useEnergyLoop";
import { Zap, TrendingUp } from "lucide-react";

interface EnergyDashboardWidgetProps {
  score: EnergyLoopScore;
  onCheckIn: () => void;
}

export const EnergyDashboardWidget = ({ score, onCheckIn }: EnergyDashboardWidgetProps) => {
  const segments = [
    { name: "Sleep", score: score.sleep_recovery_score, color: "#4A90E2", icon: "🌙" },
    { name: "Stress", score: score.stress_load_score, color: "#F5A623", icon: "💨" },
    { name: "Fuel", score: score.nutrition_score, color: "#7ED321", icon: "🩸" },
    { name: "Movement", score: score.movement_quality_score, color: "#E94B8E", icon: "🏃‍♀️" },
    { name: "Hormones", score: score.hormonal_rhythm_score, color: "#9B51E0", icon: "🌸" }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Energy Loop</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.location.href = '/energy-loop/progress'}>
          <TrendingUp className="h-4 w-4 mr-2" />
          View Progress
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6">
        <EnergyLoopCircle
          segments={segments}
          compositeScore={score.composite_score}
          size={240}
        />

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Loop Completion: {Math.round(score.loop_completion_percent)}%
          </p>
          <Button onClick={onCheckIn} size="lg" className="w-full">
            Daily Check-In
          </Button>
        </div>
      </div>
    </Card>
  );
};
