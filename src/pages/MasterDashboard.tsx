import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { Navigate } from "react-router-dom";
import { Trophy, TrendingUp, Activity, Package, Heart, Home, Sparkles, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MasterDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { progress, isLoading, allComplete } = useAssessmentProgress();

  // Fetch AI-powered cross-assessment insights
  const { data: aiInsights, isLoading: aiLoading } = useQuery({
    queryKey: ['cross-assessment-insights', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-cross-assessments');
      if (error) throw error;
      return data;
    },
    enabled: !!user && allComplete,
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
        <div className="max-w-6xl mx-auto space-y-6 pt-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!allComplete) {
    return <Navigate to="/today" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 pb-16">
        {/* Top Return Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/today')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            {t('masterDashboard.returnToToday')}
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Trophy className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">{t('masterDashboard.title')}</h1>
            <p className="text-muted-foreground">{t('masterDashboard.subtitle')}</p>
          </div>
        </div>

        {/* Unified Health Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('masterDashboard.unifiedOverview')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{t('masterDashboard.lisAssessment')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{t('masterDashboard.completed')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.lis_completed_at && 
                    new Date(progress.lis_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{t('masterDashboard.nutritionScore')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{t('masterDashboard.completed')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.nutrition_completed_at && 
                    new Date(progress.nutrition_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{t('masterDashboard.hormoneCompass')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{t('masterDashboard.completed')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {progress?.hormone_completed_at && 
                    new Date(progress.hormone_completed_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cross-Assessment Insights */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('masterDashboard.crossInsights')}</h2>
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {t('masterDashboard.howScoresConnect')}
              </CardTitle>
              <CardDescription>
                {t('masterDashboard.aiAnalysis')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">{t('masterDashboard.generatingInsights')}</span>
                </div>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    {t('masterDashboard.healthProfileIntro')}
                  </p>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <p className="font-semibold mb-3">{t('masterDashboard.keyConnections')}</p>
                    <ul className="space-y-2">
                      {aiInsights?.insights?.map((insight: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground flex gap-2">
                          <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {aiInsights?.priorities && aiInsights.priorities.length > 0 && (
                    <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4 mt-4">
                      <p className="font-semibold mb-3">{t('masterDashboard.priorityActions')}</p>
                      <ul className="space-y-2">
                        {aiInsights.priorities.map((priority: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex gap-2">
                            <span className="text-secondary font-bold flex-shrink-0">{index + 1}.</span>
                            <span>{priority}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {aiInsights?.synergies && (
                    <div className="bg-muted/30 rounded-lg p-4 mt-4">
                      <p className="text-sm text-muted-foreground italic">
                        {aiInsights.synergies}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Unified Protocol */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('masterDashboard.unifiedProtocolTitle')}</h2>
          <Card>
            <CardHeader>
              <CardTitle>{t('masterDashboard.integratedRecommendations')}</CardTitle>
              <CardDescription>
                {t('masterDashboard.combiningInsights')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('masterDashboard.protocolIntro')}
               </p>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm text-muted-foreground" 
                   dangerouslySetInnerHTML={{ __html: t('masterDashboard.visitProtocol') }} />
              </div>
            </CardContent>
          </Card>
        </section>
        
        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => navigate('/today')} 
            size="lg"
          >
            {t('masterDashboard.returnToToday')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
