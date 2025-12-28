import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  RefreshCw, 
  Brain, 
  Heart, 
  Dumbbell, 
  Moon,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ConsolidatedInsight {
  id: string;
  insight_type: string;
  category: string;
  title: string;
  description: string;
  recommendations: any;
  priority: string;
  generated_at: string;
}

const pillarIcons: Record<string, any> = {
  BEAUTY: Sparkles,
  BRAIN: Brain,
  BODY: Dumbbell,
  BALANCE: Moon,
};

const pillarColors: Record<string, string> = {
  BEAUTY: "text-pink-500",
  BRAIN: "text-purple-500",
  BODY: "text-orange-500",
  BALANCE: "text-blue-500",
};

export const ConsolidatedInsightsCard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch actual assessment progress to validate
  const { data: assessmentProgress } = useQuery({
    queryKey: ['assessment-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ['consolidated-insights', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('insight_type', 'cross_assessment')
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      return data as ConsolidatedInsight[];
    },
    enabled: !!user,
  });

  const handleRefreshAnalysis = async () => {
    if (!user) return;
    
    setIsRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('consolidatedInsights.loginRequired'));
        return;
      }

      const response = await supabase.functions.invoke('analyze-cross-assessments', {
        body: { trigger_assessment: 'manual_refresh' }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success(t('consolidatedInsights.refreshSuccess'));
      refetch();
    } catch (error: any) {
      console.error("Error refreshing analysis:", error);
      toast.error(t('consolidatedInsights.refreshError'));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate actual completed count from assessment_progress
  const actualCompletedCount = assessmentProgress ? 
    (assessmentProgress.lis_completed ? 1 : 0) + 
    (assessmentProgress.nutrition_completed ? 1 : 0) + 
    (assessmentProgress.hormone_completed ? 1 : 0) : 0;

  const hasCompletedAssessments = actualCompletedCount > 0;

  if (!user) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('consolidatedInsights.title')}
          </CardTitle>
          <CardDescription>
            {t('consolidatedInsights.signInRequired')}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const consolidatedInsight = insights?.find(i => i.category === 'consolidated');
  const pillarInsights = insights?.filter(i => ['BEAUTY', 'BRAIN', 'BODY', 'BALANCE'].includes(i.category)) || [];
  const recommendations = consolidatedInsight?.recommendations || {};
  const storedCompletedCount = recommendations.completed_count || 0;
  
  // Detect stale data: we have insights but stored count doesn't match actual
  const isDataStale = insights && insights.length > 0 && storedCompletedCount !== actualCompletedCount && hasCompletedAssessments;
  
  // No insights yet but user has completed assessments
  const needsGeneration = (!insights || insights.length === 0) && hasCompletedAssessments;

  // No insights and no assessments completed
  if (!insights || insights.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('consolidatedInsights.noInsightsTitle')}</h3>
          <p className="text-muted-foreground mb-4">
            {hasCompletedAssessments 
              ? t('consolidatedInsights.generatePrompt')
              : t('consolidatedInsights.completeAssessmentFirst')
            }
          </p>
          {hasCompletedAssessments && (
            <Button onClick={handleRefreshAnalysis} disabled={isRefreshing} size="lg">
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('consolidatedInsights.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('consolidatedInsights.generateAnalysis')}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>{t('consolidatedInsights.title')}</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshAnalysis}
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('consolidatedInsights.refreshing')}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                {t('consolidatedInsights.refreshAnalysis')}
              </>
            )}
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {t('consolidatedInsights.assessmentsAnalysed', { count: actualCompletedCount })}
          </Badge>
          {recommendations.generated_at && (
            <span className="text-xs text-muted-foreground">
              {t('consolidatedInsights.updated', { 
                date: new Date(recommendations.generated_at).toLocaleDateString() 
              })}
            </span>
          )}
        </CardDescription>
      </CardHeader>

      {/* Stale data warning */}
      {isDataStale && (
        <div className="px-6 pb-4">
          <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-sm">{t('consolidatedInsights.staleDataWarning')}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAnalysis}
                disabled={isRefreshing}
                className="shrink-0"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t('consolidatedInsights.updateNow')
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <CardContent className="space-y-6">
        {/* Synergies / Overview */}
        {consolidatedInsight?.description && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-sm leading-relaxed">{consolidatedInsight.description}</p>
          </div>
        )}

        {/* Key Insights */}
        {recommendations.insights && recommendations.insights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t('consolidatedInsights.keyInsights')}
            </h4>
            <ul className="space-y-2">
              {recommendations.insights.slice(0, 5).map((insight: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Priority Actions */}
        {recommendations.priorities && recommendations.priorities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              {t('consolidatedInsights.priorityActions')}
            </h4>
            <ul className="space-y-2">
              {recommendations.priorities.slice(0, 3).map((priority: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pillar Breakdown Accordion */}
        {pillarInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              {t('consolidatedInsights.pillarBreakdown')}
            </h4>
            <Accordion type="multiple" className="space-y-2">
              {pillarInsights.map((pillarInsight) => {
                const PillarIcon = pillarIcons[pillarInsight.category] || Sparkles;
                const colorClass = pillarColors[pillarInsight.category] || "text-primary";
                const pillarRecs = pillarInsight.recommendations || {};
                
                return (
                  <AccordionItem 
                    key={pillarInsight.id} 
                    value={pillarInsight.category}
                    className="border rounded-lg px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                        <PillarIcon className={`h-5 w-5 ${colorClass}`} />
                        <span className="font-medium">{pillarInsight.category}</span>
                        {pillarInsight.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">{t('consolidatedInsights.priority')}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">{pillarInsight.description}</p>
                        
                        {pillarRecs.findings && pillarRecs.findings.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">{t('consolidatedInsights.findings')}:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {pillarRecs.findings.map((finding: string, idx: number) => (
                                <li key={idx}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {pillarRecs.actions && pillarRecs.actions.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">{t('consolidatedInsights.recommendedActions')}:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {pillarRecs.actions.map((action: string, idx: number) => (
                                <li key={idx}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
