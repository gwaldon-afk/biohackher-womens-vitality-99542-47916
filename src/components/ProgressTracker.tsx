import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { useAssessmentCompletions } from "@/hooks/useAssessmentCompletions";

const pillars = [
  { id: 'beauty', name: 'Beauty', color: 'text-pink-500' },
  { id: 'body', name: 'Body', color: 'text-blue-500' },
  { id: 'brain', name: 'Brain', color: 'text-purple-500' },
  { id: 'balance', name: 'Balance', color: 'text-green-500' }
];

export const ProgressTracker = () => {
  const { completions, loading } = useAssessmentCompletions();

  const getPillarProgress = (pillarId: string) => {
    return completions[pillarId]?.completed || false;
  };

  const totalCompleted = pillars.filter(p => getPillarProgress(p.id)).length;
  const progressPercentage = (totalCompleted / pillars.length) * 100;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-2 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Assessment Progress</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalCompleted}/{pillars.length} Complete
          </span>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Track your progress across our four health pillars. Visit the Symptoms page to complete assessments within each pillar and build your personalized 30-day supplement stack.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercentage} className="h-2" />
        
        <div className="grid grid-cols-2 gap-3">
          {pillars.map((pillar) => {
            const isCompleted = getPillarProgress(pillar.id);
            return (
              <div
                key={pillar.id}
                className={`flex items-center gap-2 p-3 rounded-lg border ${
                  isCompleted ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-muted'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`h-5 w-5 ${pillar.color}`} />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {pillar.name}
                </span>
              </div>
            );
          })}
        </div>

        {totalCompleted === 0 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            Visit the Symptoms page to complete assessments from each pillar
          </p>
        )}

        {totalCompleted === pillars.length && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-primary">🎉 All Pillars Complete!</p>
            <p className="text-xs text-muted-foreground mt-1">
              You've completed assessments for all six pillars. Continue to add more assessments or update your supplement stack!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
