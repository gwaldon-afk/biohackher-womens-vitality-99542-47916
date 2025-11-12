import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sparkles, Calendar } from "lucide-react";
import { useLISData } from "@/hooks/useLISData";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const HealthSummaryCard = () => {
  const { profile } = useHealthProfile();
  const { currentScore, baselineDate, loading: lisLoading } = useLISData();
  const { currentStage, isLoading: hcLoading } = useHormoneCompass();

  // Calculate biological age (simplified - from birth year)
  const calculateBiologicalAge = () => {
    if (!profile?.date_of_birth) return null;
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  };

  const biologicalAge = calculateBiologicalAge();

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getHealthLevelInfo = (stage: string | undefined) => {
    if (!stage) return { label: "Not assessed", color: "text-muted-foreground" };
    
    const stageMap: Record<string, { label: string; color: string }> = {
      "feeling-great": { label: "Feeling Great", color: "text-green-600 dark:text-green-400" },
      "doing-well": { label: "Doing Well", color: "text-blue-600 dark:text-blue-400" },
      "having-challenges": { label: "Having Challenges", color: "text-yellow-600 dark:text-yellow-400" },
      "really-struggling": { label: "Really Struggling", color: "text-orange-600 dark:text-orange-400" },
      "need-support": { label: "Need Support Now", color: "text-red-600 dark:text-red-400" },
    };
    
    return stageMap[stage] || { label: stage, color: "text-muted-foreground" };
  };

  const healthLevelInfo = getHealthLevelInfo(currentStage?.stage);

  if (lisLoading || hcLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
          Health Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LIS Score */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Longevity Impact Score</p>
            </div>
            {currentScore !== null ? (
              <>
                <p className={`text-3xl font-bold ${getScoreColor(currentScore)}`}>
                  {currentScore}/100
                </p>
                {baselineDate && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Baseline: {formatDistanceToNow(baselineDate, { addSuffix: true })}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No score yet</p>
            )}
          </div>

          {/* Biological Age */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Biological Age</p>
            </div>
            {biologicalAge !== null ? (
              <>
                <p className="text-3xl font-bold text-primary">
                  {biologicalAge}
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on assessment data
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not calculated</p>
            )}
          </div>

          {/* Hormone Compass Health Level */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-muted-foreground">Hormone Health</p>
            </div>
            {currentStage ? (
              <>
                <p className={`text-2xl font-bold ${healthLevelInfo.color}`}>
                  {healthLevelInfo.label}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Assessed: {formatDistanceToNow(new Date(currentStage.calculated_at), { addSuffix: true })}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Not assessed yet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
