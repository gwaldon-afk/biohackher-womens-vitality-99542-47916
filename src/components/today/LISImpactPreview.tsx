import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Smart defaults: expanded for first 3 visits, then remember preference
  useEffect(() => {
    const storedPreference = localStorage.getItem('lis-preview-expanded');
    const visitCount = parseInt(localStorage.getItem('lis-preview-visits') || '0');
    
    // Increment visit count
    localStorage.setItem('lis-preview-visits', String(visitCount + 1));
    
    // Use stored preference if exists, otherwise expand for first 3 visits
    if (storedPreference !== null) {
      setIsExpanded(storedPreference === 'true');
    } else if (visitCount < 3) {
      setIsExpanded(true);
    }
  }, []);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    localStorage.setItem('lis-preview-expanded', String(newState));
  };

  // Compact view for regular visitors
  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-3">
          <Target className="w-5 h-5 text-purple-600" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              Today's Impact: <strong className="text-purple-600">+{estimatedLISPoints} LIS points</strong>
            </span>
            <span className="text-xs text-muted-foreground">({Math.round(completionRate)}% complete)</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleToggle}
          className="text-xs hover:text-purple-600"
        >
          See full projection
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Expanded view with full details
  return (
    <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            LIS Impact Prediction
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleToggle}
            className="text-xs hover:text-purple-600"
          >
            Collapse
            <ChevronUp className="ml-1 h-3 w-3" />
          </Button>
        </div>
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
