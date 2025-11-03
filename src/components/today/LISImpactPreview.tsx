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
  const estimatedLISPoints = Math.round((completionRate / 100) * 3);

  // Calculate biological age projection
  const currentLIS = sustainedLIS || 100;
  const potentialLIS = estimateLISFromCompletion(completionRate, currentLIS);
  
  const currentBioAgeImpact = calculate5YearBioAgeImpact(currentLIS);
  const potentialBioAgeImpact = calculate5YearBioAgeImpact(potentialLIS);
  const opportunityGap = Math.abs(potentialBioAgeImpact - currentBioAgeImpact);

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

        {/* 5-Year Biological Age Projection */}
        <div className="pt-3 border-t border-border space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            5-Year Biological Age Projection
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Current path:</span>
              <span className={`font-semibold ${currentBioAgeImpact > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {currentBioAgeImpact > 0 ? '+' : ''}{currentBioAgeImpact.toFixed(1)} years {currentBioAgeImpact > 0 ? 'older' : 'younger'}
              </span>
            </div>
            
            {completionRate > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">With daily plan:</span>
                  <span className={`font-semibold ${potentialBioAgeImpact > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                    {potentialBioAgeImpact > 0 ? '+' : ''}{potentialBioAgeImpact.toFixed(1)} years {potentialBioAgeImpact > 0 ? 'older' : 'younger'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground font-medium">Opportunity:</span>
                  <span className="font-bold text-primary text-base">
                    {opportunityGap.toFixed(1)} years improvement! 🚀
                  </span>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground italic">
            Complete your daily plan consistently to move towards optimal biological age
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
          <p className="font-medium">Daily actions breakdown:</p>
          <p>• Morning sunlight: +0.5 LIS</p>
          <p>• Daily supplements: +0.3 LIS</p>
          <p>• Movement practice: +0.8 LIS</p>
        </div>
      </CardContent>
    </Card>
  );
};
