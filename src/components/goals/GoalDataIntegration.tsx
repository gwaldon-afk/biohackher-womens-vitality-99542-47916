import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HealthGoal } from "@/hooks/useGoals";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { useLISData } from "@/hooks/useLISData";
import { useMenoMap } from "@/hooks/useMenoMap";
import { Activity, Brain, Moon, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface GoalDataIntegrationProps {
  goal: HealthGoal;
}

export const GoalDataIntegration = ({ goal }: GoalDataIntegrationProps) => {
  const { currentScore: energyScore } = useEnergyLoop();
  const { baselineScore: lisScore, currentScore: currentLisScore } = useLISData();
  const { currentStage: menoStage } = useMenoMap();

  // Determine if goal aligns with each data source
  const energyAlignment = goal.pillar_category === 'balance' || goal.pillar_category === 'body';
  const lisAlignment = true; // All goals affect LIS
  const menoAlignment = goal.pillar_category === 'balance' || goal.pillar_category === 'beauty';

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Connected Health Data</h3>
      
      {/* Energy Loop Integration */}
      {energyAlignment && energyScore && energyScore.composite_score !== null && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-base">Energy Loop</CardTitle>
              </div>
              <Badge variant="secondary">
                Score: {Math.round(energyScore.composite_score)}
              </Badge>
            </div>
            <CardDescription>
              Your energy patterns impact this goal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {energyScore.sleep_recovery_score !== null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Sleep Recovery</span>
                  <span className="font-medium">{Math.round(energyScore.sleep_recovery_score)}%</span>
                </div>
                <Progress value={energyScore.sleep_recovery_score} className="h-2" />
              </div>
            )}
            {energyScore.stress_load_score !== null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Stress Load</span>
                  <span className="font-medium">{Math.round(energyScore.stress_load_score)}%</span>
                </div>
                <Progress value={energyScore.stress_load_score} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* LIS Integration */}
      {lisAlignment && lisScore && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-base">Longevity Impact</CardTitle>
              </div>
              {getTrendIcon('stable')}
            </div>
            <CardDescription>
              Your goal contributes to your longevity score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current LIS</span>
              <span className="text-2xl font-bold">{Math.round(currentLisScore || lisScore)}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Goal progress can improve your biological age by an estimated{' '}
              <span className="font-medium text-foreground">
                {goal.biological_age_impact_predicted || 0.5} years
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* MenoMap Integration */}
      {menoAlignment && menoStage && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-pink-600" />
                <CardTitle className="text-base">MenoMap Stage</CardTitle>
              </div>
              <Badge variant="outline">
                {menoStage.stage}
              </Badge>
            </div>
            <CardDescription>
              Your hormonal stage affects goal approach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Currently in <span className="font-medium text-foreground">{menoStage.stage}</span> stage.
              Check-in frequency and interventions are optimized for this phase.
            </p>
            <div className="mt-3 p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round((menoStage.confidence_score || 0) * 100)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!energyAlignment && !menoAlignment && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No specific health data integrations available for this goal type.
              Focus on tracking your check-ins and progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
