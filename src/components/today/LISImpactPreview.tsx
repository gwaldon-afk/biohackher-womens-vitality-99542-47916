import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LISImpactPreviewProps {
  completedCount: number;
  totalCount: number;
}

export const LISImpactPreview = ({ completedCount, totalCount }: LISImpactPreviewProps) => {
  // Estimate LIS impact based on completion
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const estimatedLISPoints = Math.round((completionRate / 100) * 3);

  const getImpactMessage = () => {
    if (completionRate >= 75) return "Excellent impact on your longevity!";
    if (completionRate >= 50) return "Good progress toward your goals!";
    if (completionRate >= 25) return "Building positive habits!";
    return "Complete more actions for greater impact!";
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          LIS Impact Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-purple-600">+{estimatedLISPoints}</p>
            <p className="text-sm text-muted-foreground">Estimated LIS Points</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{Math.round(completionRate)}%</p>
            <p className="text-xs text-muted-foreground">Plan Complete</p>
          </div>
        </div>

        <Progress value={completionRate} className="h-2" />

        <div className="flex items-start gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-muted-foreground">{getImpactMessage()}</p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Complete morning sunlight: +0.5 LIS</p>
          <p>• Daily supplements: +0.3 LIS</p>
          <p>• Movement practice: +0.8 LIS</p>
        </div>
      </CardContent>
    </Card>
  );
};
