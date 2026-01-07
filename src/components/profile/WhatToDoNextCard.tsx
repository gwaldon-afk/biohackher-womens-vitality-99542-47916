import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addActionToProtocol } from "@/services/addActionToProtocol";
import { ActionPreviewDrawer, ActionItem } from "./ActionPreviewDrawer";
import { 
  Sparkles, 
  Eye, 
  Pill, 
  Dumbbell, 
  Brain, 
  Salad, 
  Heart,
  ChevronRight,
  AlertCircle,
  RefreshCw
} from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  supplement: Pill,
  therapy: Brain,
  habit: Heart,
  exercise: Dumbbell,
  diet: Salad,
};

const priorityColors: Record<string, string> = {
  immediate: 'bg-destructive/10 text-destructive',
  foundation: 'bg-primary/10 text-primary',
  optimisation: 'bg-muted text-muted-foreground',
};

interface UserInsight {
  id: string;
  insight_type: string;
  category: string;
  title: string;
  description: string;
  recommendations: any;
  priority: string;
  is_dismissed: boolean;
}

interface ProtocolRecommendation {
  id: string;
  source_type: string;
  protocol_data: any;
  status: string;
}

function inferItemType(name: string, description?: string): ActionItem['itemType'] {
  const text = `${name} ${description || ''}`.toLowerCase();
  
  if (text.includes('supplement') || text.includes('vitamin') || text.includes('magnesium') || 
      text.includes('omega') || text.includes('zinc') || text.includes('iron') || text.includes('mg')) {
    return 'supplement';
  }
  if (text.includes('exercise') || text.includes('walk') || text.includes('run') || 
      text.includes('workout') || text.includes('movement') || text.includes('strength')) {
    return 'exercise';
  }
  if (text.includes('therapy') || text.includes('massage') || text.includes('sauna') ||
      text.includes('cold') || text.includes('meditation')) {
    return 'therapy';
  }
  if (text.includes('eat') || text.includes('food') || text.includes('diet') || 
      text.includes('protein') || text.includes('vegetable') || text.includes('meal')) {
    return 'diet';
  }
  return 'habit';
}

function parseProtocolDataToActions(
  protocolData: any, 
  sourceType: string,
  recommendationId: string
): ActionItem[] {
  const actions: ActionItem[] = [];
  
  // Handle immediate/foundation/optimization structure
  const tiers = ['immediate', 'foundation', 'optimization', 'optimisation'];
  
  for (const tier of tiers) {
    const items = protocolData?.[tier] || [];
    if (Array.isArray(items)) {
      items.forEach((item: any, idx: number) => {
        if (item.name || item.title) {
          actions.push({
            id: `${recommendationId}-${tier}-${idx}`,
            name: item.name || item.title,
            description: item.description || item.reason || '',
            itemType: item.item_type || inferItemType(item.name || item.title, item.description),
            priorityTier: tier === 'optimization' ? 'optimisation' : tier as ActionItem['priorityTier'],
            sourceAssessment: formatSourceType(sourceType),
            evidenceLevel: item.evidence_level,
            frequency: item.frequency,
            timeOfDay: item.time_of_day,
            dosage: item.dosage,
            expectedImpact: item.expected_impact,
            pillars: item.pillars || item.lis_pillar_contribution,
            sourceRecommendationId: recommendationId,
          });
        }
      });
    }
  }
  
  return actions;
}

function formatSourceType(sourceType: string): string {
  const mapping: Record<string, string> = {
    'lis': 'LIS',
    'hormone_compass': 'Hormone',
    'nutrition': 'Nutrition',
    'symptom': 'Symptom',
    'goal': 'Goal',
  };
  return mapping[sourceType] || sourceType;
}

export function WhatToDoNextCard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedAction, setSelectedAction] = useState<ActionItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch user insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['user-insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .eq('insight_type', 'cross_assessment')
        .order('generated_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data as UserInsight[];
    },
    enabled: !!user?.id,
  });

  // Fetch pending protocol recommendations
  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ['protocol-recommendations-pending', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('protocol_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProtocolRecommendation[];
    },
    enabled: !!user?.id,
  });

  // Fetch assessment progress
  const { data: assessmentProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['assessment-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Combine and prioritise actions
  const actions = useMemo(() => {
    const allActions: ActionItem[] = [];
    
    // Extract from protocol recommendations
    if (recommendations) {
      recommendations.forEach((rec) => {
        const recActions = parseProtocolDataToActions(rec.protocol_data, rec.source_type, rec.id);
        allActions.push(...recActions);
      });
    }
    
    // Extract priority actions from cross-assessment insights
    if (insights && insights.length > 0) {
      const insight = insights[0];
      const recs = insight.recommendations;
      
      if (recs?.priority_actions && Array.isArray(recs.priority_actions)) {
        recs.priority_actions.forEach((action: any, idx: number) => {
          allActions.push({
            id: `insight-${insight.id}-${idx}`,
            name: action.title || action.action || action,
            description: action.description || action.why || '',
            itemType: inferItemType(action.title || action.action || action, action.description),
            priorityTier: 'immediate',
            sourceAssessment: 'Analysis',
            sourceInsightId: insight.id,
          });
        });
      }
    }
    
    // Sort by priority tier
    const priorityOrder = { immediate: 0, foundation: 1, optimisation: 2 };
    allActions.sort((a, b) => priorityOrder[a.priorityTier] - priorityOrder[b.priorityTier]);
    
    // Return top 5
    return allActions.slice(0, 5);
  }, [insights, recommendations]);

  const isLoading = insightsLoading || recsLoading || progressLoading;
  const hasCompletedAssessment = assessmentProgress?.lis_completed || 
    assessmentProgress?.nutrition_completed || 
    assessmentProgress?.hormone_completed;

  const handlePreview = (action: ActionItem) => {
    setSelectedAction(action);
    setDrawerOpen(true);
  };

  const handleAddToProtocol = async (action: ActionItem) => {
    if (!user?.id) return;
    
    setIsAdding(true);
    try {
      const result = await addActionToProtocol(user.id, action);
      
      if (result.success) {
        toast({
          title: t('whatToDoNext.actionAdded'),
          description: t('whatToDoNext.actionAddedDesc', { name: action.name }),
        });
        queryClient.invalidateQueries({ queryKey: ['protocol-items'] });
        queryClient.invalidateQueries({ queryKey: ['protocols'] });
      } else {
        toast({
          title: t('common.error'),
          description: result.error || t('common.genericError'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('common.genericError'),
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDismiss = async (action: ActionItem) => {
    // For now, just close the drawer
    // Future: could mark recommendations as dismissed
    toast({
      title: t('whatToDoNext.dismissed'),
      description: t('whatToDoNext.dismissedDesc'),
    });
  };

  if (!user) return null;

  // Loading state
  if (isLoading) {
    return (
      <Card className="mt-6 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  // No assessments completed
  if (!hasCompletedAssessment) {
    return (
      <Card className="mt-6 bg-gradient-to-br from-background via-background to-muted/20 border-2 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            {t('whatToDoNext.title')}
          </CardTitle>
          <CardDescription>
            {t('whatToDoNext.completeAssessmentFirst')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <span>{t('whatToDoNext.noActionsYet')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No actions available
  if (actions.length === 0) {
    return (
      <Card className="mt-6 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('whatToDoNext.title')}
          </CardTitle>
          <CardDescription>
            {t('whatToDoNext.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/30 text-center">
            <RefreshCw className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">{t('whatToDoNext.noActionsYet')}</p>
            <p className="text-sm text-muted-foreground">
              {t('whatToDoNext.generateActionsHint')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('whatToDoNext.title')}
          </CardTitle>
          <CardDescription>
            {t('whatToDoNext.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actions.map((action) => {
            const Icon = typeIcons[action.itemType] || Heart;
            
            return (
              <div
                key={action.id}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => handlePreview(action)}
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{action.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {t('whatToDoNext.fromAssessment', { assessment: action.sourceAssessment })}
                    </Badge>
                    <Badge className={`text-xs ${priorityColors[action.priorityTier]}`}>
                      {t(`whatToDoNext.priority.${action.priorityTier}`)}
                    </Badge>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview(action);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {t('whatToDoNext.previewAction')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <ActionPreviewDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        action={selectedAction}
        onAddToProtocol={handleAddToProtocol}
        onDismiss={handleDismiss}
        isAdding={isAdding}
      />
    </>
  );
}
