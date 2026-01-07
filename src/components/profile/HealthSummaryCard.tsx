import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sparkles, Calendar, Heart, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { useConsolidatedScores } from "@/hooks/useConsolidatedScores";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { 
  getBioAgeDeltaColor, 
  getConfidenceBadgeClass 
} from "@/utils/compositeBiologicalAgeCalculator";

export const HealthSummaryCard = () => {
  const { t } = useTranslation();
  const {
    lisScore,
    lisBaselineDate,
    nutritionScore,
    nutritionCompletedAt,
    hormoneStage,
    hormoneAge,
    hormoneCalculatedAt,
    chronologicalAge,
    overallBiologicalAge,
    bioAgeDelta,
    bioAgeConfidence,
    bioAgeMissing,
    bioAgeDisplayMessage,
    loading
  } = useConsolidatedScores();

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getHealthLevelInfo = (stage: string | undefined) => {
    if (!stage) return { label: t('healthSummary.notAssessed'), color: "text-muted-foreground" };
    
    const stageMap: Record<string, { label: string; color: string }> = {
      "feeling-great": { label: "Feeling Great", color: "text-green-600 dark:text-green-400" },
      "doing-well": { label: "Doing Well", color: "text-blue-600 dark:text-blue-400" },
      "having-challenges": { label: "Having Challenges", color: "text-yellow-600 dark:text-yellow-400" },
      "really-struggling": { label: "Really Struggling", color: "text-orange-600 dark:text-orange-400" },
      "need-support": { label: "Need Support Now", color: "text-red-600 dark:text-red-400" },
    };
    
    return stageMap[stage] || { label: stage, color: "text-muted-foreground" };
  };

  const healthLevelInfo = getHealthLevelInfo(hormoneStage ?? undefined);

  const getDeltaIcon = (delta: number | null) => {
    if (delta === null) return null;
    if (delta > 0) return <TrendingDown className="h-4 w-4" />;
    if (delta < 0) return <TrendingUp className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const formatDeltaText = (delta: number | null) => {
    if (delta === null) return '';
    if (delta > 0) return t('healthSummary.yearsYounger', { years: Math.abs(delta).toFixed(1) });
    if (delta < 0) return t('healthSummary.yearsOlder', { years: Math.abs(delta).toFixed(1) });
    return t('healthSummary.sameAsChronological');
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {t('healthSummary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {t('healthSummary.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* LIS Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t('healthSummary.lisScore')}</p>
            </div>
            {lisScore !== null ? (
              <>
                <p className={`text-3xl font-bold ${getScoreColor(lisScore)}`}>
                  {lisScore}/100
                </p>
                {lisBaselineDate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('healthSummary.baseline')}: {formatDistanceToNow(lisBaselineDate, { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('healthSummary.noScore')}</p>
            )}
          </div>

          {/* Nutrition Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t('healthSummary.nutritionScore')}</p>
            </div>
            {nutritionScore !== null ? (
              <>
                <p className={`text-3xl font-bold ${getScoreColor(nutritionScore)}`}>
                  {nutritionScore}/100
                </p>
                {nutritionCompletedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('healthSummary.assessed')}: {formatDistanceToNow(nutritionCompletedAt, { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('healthSummary.noScore')}</p>
            )}
          </div>

          {/* Hormone Compass Health Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t('healthSummary.hormoneHealth')}</p>
            </div>
            {hormoneStage ? (
              <>
                <p className={`text-2xl font-bold ${healthLevelInfo.color}`}>
                  {healthLevelInfo.label}
                </p>
                {hormoneAge && (
                  <p className="text-xs text-muted-foreground">
                    {t('healthSummary.hormoneAge')}: {hormoneAge}y
                  </p>
                )}
                {hormoneCalculatedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {t('healthSummary.assessed')}: {formatDistanceToNow(hormoneCalculatedAt, { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('healthSummary.notAssessed')}</p>
            )}
          </div>

          {/* Overall Biological Age */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">{t('healthSummary.overallBiologicalAge')}</p>
            </div>
            {overallBiologicalAge !== null && chronologicalAge !== null ? (
              <>
                <p className="text-3xl font-bold text-primary">
                  {Math.round(overallBiologicalAge)} {t('healthSummary.years')}
                </p>
                <div className={`flex items-center gap-1 text-sm ${getBioAgeDeltaColor(bioAgeDelta ?? 0)}`}>
                  {getDeltaIcon(bioAgeDelta)}
                  <span>{formatDeltaText(bioAgeDelta)}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={`w-fit text-xs ${getConfidenceBadgeClass(bioAgeConfidence)}`}>
                    {t('healthSummary.confidence', { percent: bioAgeConfidence })}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{bioAgeDisplayMessage}</p>
                </div>
                {bioAgeMissing.length > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t('healthSummary.completeForAccuracy', { 
                      assessments: bioAgeMissing.map(d => 
                        d === 'lifestyle' ? 'LIS' : 
                        d === 'metabolic' ? 'Nutrition' : 
                        'Hormone'
                      ).join(', ')
                    })}
                  </p>
                )}
              </>
            ) : chronologicalAge === null ? (
              <p className="text-sm text-muted-foreground">{t('healthSummary.requiresDOB')}</p>
            ) : (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('healthSummary.completeAssessment')}</p>
                <p className="text-xs text-muted-foreground">{t('healthSummary.toCalculateBioAge')}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
