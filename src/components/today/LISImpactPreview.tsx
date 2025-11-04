import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { calculate5YearBioAgeImpact, estimateLISFromCompletion } from '@/utils/biologicalAgeCalculation';

interface LISImpactPreviewProps {
  completedCount: number;
  totalCount: number;
  sustainedLIS?: number;
  currentAge?: number;
}

export const LISImpactPreview = ({ 
  completedCount, 
  totalCount, 
  sustainedLIS,
  currentAge = 42 
}: LISImpactPreviewProps) => {
  // Calculate completion rate and estimated LIS
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Calculate biological age projection
  const currentLIS = sustainedLIS || 100;
  const currentPotentialLIS = estimateLISFromCompletion(completionRate, currentLIS);
  
  // Compare current state to optimal 80% completion target
  const optimalCompletionRate = 80;
  const optimalPotentialLIS = estimateLISFromCompletion(optimalCompletionRate, currentLIS);
  
  // Calculate the actual LIS points opportunity (difference between optimal and current)
  const lisPointsOpportunity = Math.round(optimalPotentialLIS - currentPotentialLIS);
  
  const currentBioAgeImpact = calculate5YearBioAgeImpact(currentPotentialLIS);
  const optimalBioAgeImpact = calculate5YearBioAgeImpact(optimalPotentialLIS);
  const opportunityGap = Math.abs(optimalBioAgeImpact - currentBioAgeImpact);

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
            <p className="text-3xl font-bold text-purple-600">+{lisPointsOpportunity}</p>
            <p className="text-sm text-muted-foreground">LIS Points Opportunity</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{Math.round(completionRate)}%</p>
            <p className="text-xs text-muted-foreground">Plan Complete</p>
          </div>
        </div>

        <Progress value={completionRate} className="h-2" />

        {/* Hero Message - Prominent Longevity Benefit Statement */}
        {(
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-foreground leading-relaxed">
                {completionRate === 0 
                  ? `Start completing your daily plan to improve your LIS by ${lisPointsOpportunity} points, which could reduce your biological age by ${opportunityGap.toFixed(1)} years over the next 5 years! 🚀`
                  : `Consistently completing your daily plan can improve your LIS by ${lisPointsOpportunity} points, which could reduce your biological age by ${opportunityGap.toFixed(1)} years over the next 5 years! 🚀`
                }
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
          <p className="text-muted-foreground">{getImpactMessage()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
