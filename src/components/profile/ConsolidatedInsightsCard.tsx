import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
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
  Loader2
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        toast.error("Please log in to refresh analysis");
        return;
      }

      const response = await supabase.functions.invoke('analyze-cross-assessments', {
        body: { trigger_assessment: 'manual_refresh' }
      });

      if (response.error) {
        throw response.error;
      }

      toast.success("Analysis refreshed successfully");
      refetch();
    } catch (error: any) {
      console.error("Error refreshing analysis:", error);
      toast.error("Failed to refresh analysis");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Consolidated Health Analysis
          </CardTitle>
          <CardDescription>
            Sign in to view your personalized health insights
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
  const completedCount = recommendations.completed_count || 0;

  // No insights yet
  if (!insights || insights.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Consolidated Insights Yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your first assessment to receive personalized health insights
          </p>
          <Button variant="outline" onClick={handleRefreshAnalysis} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
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
            <CardTitle>Your Consolidated Health Analysis</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshAnalysis}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {completedCount} assessment{completedCount !== 1 ? 's' : ''} analyzed
          </Badge>
          {recommendations.generated_at && (
            <span className="text-xs text-muted-foreground">
              Updated {new Date(recommendations.generated_at).toLocaleDateString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      
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
              Key Insights
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
              Priority Actions
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
              Pillar Breakdown
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
                          <Badge variant="destructive" className="text-xs">Priority</Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 text-sm">
                        <p className="text-muted-foreground">{pillarInsight.description}</p>
                        
                        {pillarRecs.findings && pillarRecs.findings.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Findings:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                              {pillarRecs.findings.map((finding: string, idx: number) => (
                                <li key={idx}>{finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {pillarRecs.actions && pillarRecs.actions.length > 0 && (
                          <div>
                            <p className="font-medium mb-1">Recommended Actions:</p>
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
