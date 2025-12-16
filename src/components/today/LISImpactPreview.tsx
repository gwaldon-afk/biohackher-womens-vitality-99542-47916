import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { calculate5YearBioAgeImpact, estimateLISFromCompletion } from '@/utils/biologicalAgeCalculation';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
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
    if (completionRate >= 75) return t('today.lis.impactExcellent');
    if (completionRate >= 50) return t('today.lis.impactGood');
    if (completionRate >= 25) return t('today.lis.impactBuilding');
    return t('today.lis.impactMore');
  };

  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600" />
          {t('today.lis.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-purple-600">+{lisPointsOpportunity}</p>
            <p className="text-sm text-muted-foreground">{t('today.lis.pointsOpportunity')}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{Math.round(completionRate)}%</p>
            <p className="text-xs text-muted-foreground">{t('today.lis.planComplete')}</p>
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
                  ? t('today.lis.startMessage', { points: lisPointsOpportunity, years: opportunityGap.toFixed(1) })
                  : t('today.lis.continueMessage', { points: lisPointsOpportunity, years: opportunityGap.toFixed(1) })
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
