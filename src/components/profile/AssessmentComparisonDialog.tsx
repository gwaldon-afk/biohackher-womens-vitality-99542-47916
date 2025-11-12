import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Activity, Sparkles, Minus } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentType: "lis" | "hormone_compass" | "symptom";
  assessmentTitle: string;
}

interface LISComparison {
  baseline: {
    id: string;
    date: Date;
    score: number;
    pillars: {
      sleep: number;
      stress: number;
      activity: number;
      nutrition: number;
      social: number;
      cognitive: number;
    };
  } | null;
  latest: {
    id: string;
    date: Date;
    score: number;
    pillars: {
      sleep: number;
      stress: number;
      activity: number;
      nutrition: number;
      social: number;
      cognitive: number;
    };
  } | null;
}

interface HormoneCompassComparison {
  baseline: {
    id: string;
    date: Date;
    stage: string;
    confidence: number;
  } | null;
  latest: {
    id: string;
    date: Date;
    stage: string;
    confidence: number;
  } | null;
}

export const AssessmentComparisonDialog = ({
  open,
  onOpenChange,
  assessmentType,
  assessmentTitle,
}: ComparisonDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lisComparison, setLisComparison] = useState<LISComparison | null>(null);
  const [hcComparison, setHcComparison] = useState<HormoneCompassComparison | null>(null);

  useEffect(() => {
    if (open && user) {
      fetchComparisonData();
    }
  }, [open, user, assessmentType]);

  const fetchComparisonData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (assessmentType === "lis") {
        // Fetch oldest and newest LIS assessments
        const { data: allScores } = await supabase
          .from("daily_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_baseline", true)
          .order("created_at", { ascending: true });

        if (allScores && allScores.length >= 2) {
          const baseline = allScores[0];
          const latest = allScores[allScores.length - 1];

          setLisComparison({
            baseline: {
              id: baseline.id,
              date: new Date(baseline.created_at),
              score: baseline.longevity_impact_score,
              pillars: {
                sleep: baseline.sleep_score || 0,
                stress: baseline.stress_score || 0,
                activity: baseline.physical_activity_score || 0,
                nutrition: baseline.nutrition_score || 0,
                social: baseline.social_connections_score || 0,
                cognitive: baseline.cognitive_engagement_score || 0,
              },
            },
            latest: {
              id: latest.id,
              date: new Date(latest.created_at),
              score: latest.longevity_impact_score,
              pillars: {
                sleep: latest.sleep_score || 0,
                stress: latest.stress_score || 0,
                activity: latest.physical_activity_score || 0,
                nutrition: latest.nutrition_score || 0,
                social: latest.social_connections_score || 0,
                cognitive: latest.cognitive_engagement_score || 0,
              },
            },
          });
        } else if (allScores && allScores.length === 1) {
          // Only one assessment - show it as both baseline and latest
          const single = allScores[0];
          setLisComparison({
            baseline: {
              id: single.id,
              date: new Date(single.created_at),
              score: single.longevity_impact_score,
              pillars: {
                sleep: single.sleep_score || 0,
                stress: single.stress_score || 0,
                activity: single.physical_activity_score || 0,
                nutrition: single.nutrition_score || 0,
                social: single.social_connections_score || 0,
                cognitive: single.cognitive_engagement_score || 0,
              },
            },
            latest: null,
          });
        }
      } else if (assessmentType === "hormone_compass") {
        // Fetch oldest and newest Hormone Compass assessments
        const { data: allAssessments } = await supabase
          .from("hormone_compass_stages")
          .select("*")
          .eq("user_id", user.id)
          .order("calculated_at", { ascending: true });

        if (allAssessments && allAssessments.length >= 2) {
          const baseline = allAssessments[0];
          const latest = allAssessments[allAssessments.length - 1];

          setHcComparison({
            baseline: {
              id: baseline.id,
              date: new Date(baseline.calculated_at),
              stage: baseline.stage,
              confidence: baseline.confidence_score,
            },
            latest: {
              id: latest.id,
              date: new Date(latest.calculated_at),
              stage: latest.stage,
              confidence: latest.confidence_score,
            },
          });
        } else if (allAssessments && allAssessments.length === 1) {
          const single = allAssessments[0];
          setHcComparison({
            baseline: {
              id: single.id,
              date: new Date(single.calculated_at),
              stage: single.stage,
              confidence: single.confidence_score,
            },
            latest: null,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateImprovement = (baseline: number, latest: number) => {
    const change = latest - baseline;
    const percentage = ((change / baseline) * 100).toFixed(1);
    return { change, percentage };
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getHealthLevelLabel = (stage: string) => {
    const stageMap: Record<string, string> = {
      "feeling-great": "Feeling Great",
      "doing-well": "Doing Well",
      "having-challenges": "Having Challenges",
      "really-struggling": "Really Struggling",
      "need-support": "Need Support Now",
    };
    return stageMap[stage] || stage;
  };

  const renderLISComparison = () => {
    if (!lisComparison?.baseline) {
      return (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No LIS assessments to compare</p>
        </div>
      );
    }

    const hasMultiple = lisComparison.latest !== null;

    return (
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pillars">Pillar-by-Pillar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {!hasMultiple && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">
                  You only have one LIS assessment. Take another assessment to see your progress comparison.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Overall Score Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Overall LIS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                  <p className="text-sm text-muted-foreground">
                    {format(lisComparison.baseline.date, "MMM d, yyyy")}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {lisComparison.baseline.score}
                  </p>
                </div>
                {hasMultiple && lisComparison.latest && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Latest</p>
                    <p className="text-sm text-muted-foreground">
                      {format(lisComparison.latest.date, "MMM d, yyyy")}
                    </p>
                    <p className="text-3xl font-bold text-primary">
                      {lisComparison.latest.score}
                    </p>
                  </div>
                )}
              </div>

              {hasMultiple && lisComparison.latest && (
                <div className="bg-muted/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(lisComparison.latest.score - lisComparison.baseline.score)}
                    <span className="font-semibold">Change</span>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${getTrendColor(
                        lisComparison.latest.score - lisComparison.baseline.score
                      )}`}
                    >
                      {lisComparison.latest.score - lisComparison.baseline.score > 0 ? "+" : ""}
                      {lisComparison.latest.score - lisComparison.baseline.score}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calculateImprovement(lisComparison.baseline.score, lisComparison.latest.score)
                        .percentage}
                      % change
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pillars" className="space-y-3 mt-4">
          {Object.entries(lisComparison.baseline.pillars).map(([pillar, baselineScore]) => {
            const latestScore = hasMultiple && lisComparison.latest ? lisComparison.latest.pillars[pillar as keyof typeof lisComparison.latest.pillars] : baselineScore;
            const change = latestScore - baselineScore;

            return (
              <Card key={pillar}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold capitalize">{pillar}</h4>
                    {hasMultiple && (
                      <div className="flex items-center gap-1">
                        {getTrendIcon(change)}
                        <span className={`text-sm font-medium ${getTrendColor(change)}`}>
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                      <p className="text-xl font-bold">{baselineScore.toFixed(1)}</p>
                    </div>
                    {hasMultiple && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Latest</p>
                        <p className="text-xl font-bold">{latestScore.toFixed(1)}</p>
                      </div>
                    )}
                  </div>
                  {hasMultiple && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{((latestScore / 100) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            change > 0
                              ? "bg-green-500"
                              : change < 0
                              ? "bg-red-500"
                              : "bg-blue-500"
                          }`}
                          style={{ width: `${(latestScore / 100) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    );
  };

  const renderHormoneCompassComparison = () => {
    if (!hcComparison?.baseline) {
      return (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No Hormone Compass assessments to compare</p>
        </div>
      );
    }

    const hasMultiple = hcComparison.latest !== null;

    return (
      <div className="space-y-4">
        {!hasMultiple && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                You only have one Hormone Compass assessment. Take another assessment to see your progress comparison.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Health Level Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hormone Health Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                <p className="text-sm text-muted-foreground">
                  {format(hcComparison.baseline.date, "MMM d, yyyy")}
                </p>
                <Badge className="mt-2">{getHealthLevelLabel(hcComparison.baseline.stage)}</Badge>
              </div>
              {hasMultiple && hcComparison.latest && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Latest</p>
                  <p className="text-sm text-muted-foreground">
                    {format(hcComparison.latest.date, "MMM d, yyyy")}
                  </p>
                  <Badge className="mt-2">{getHealthLevelLabel(hcComparison.latest.stage)}</Badge>
                </div>
              )}
            </div>

            {hasMultiple && hcComparison.latest && hcComparison.baseline.stage !== hcComparison.latest.stage && (
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-1">Progress Status</p>
                <p className="text-sm text-muted-foreground">
                  Your hormone health level has changed from{" "}
                  <span className="font-medium">{getHealthLevelLabel(hcComparison.baseline.stage)}</span> to{" "}
                  <span className="font-medium">{getHealthLevelLabel(hcComparison.latest.stage)}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confidence Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Assessment Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Baseline</p>
                <p className="text-2xl font-bold">{hcComparison.baseline.confidence.toFixed(0)}%</p>
              </div>
              {hasMultiple && hcComparison.latest && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Latest</p>
                  <p className="text-2xl font-bold">{hcComparison.latest.confidence.toFixed(0)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {assessmentType === "lis" ? (
              <Activity className="h-5 w-5 text-primary" />
            ) : (
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            )}
            {assessmentTitle} Comparison
          </DialogTitle>
          <DialogDescription>
            Compare your first and latest assessments to see your progress over time
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {assessmentType === "lis" && renderLISComparison()}
            {assessmentType === "hormone_compass" && renderHormoneCompassComparison()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
