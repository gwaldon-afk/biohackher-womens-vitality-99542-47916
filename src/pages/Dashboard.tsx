import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { History, FileText, Activity, Settings, TrendingUp, TrendingDown, Brain, Zap, Bone, Moon, Heart, AlertTriangle, CheckCircle2, Pill, Users, Sparkles, Target, ChevronRight } from "lucide-react";
import Navigation from "@/components/Navigation";
import Reports from "@/pages/Reports";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getOverallHealthAnalysis, getSymptomName, getTopRecommendations } from "@/utils/healthAnalysis";
import { ProgressTracker } from "@/components/ProgressTracker";
import { StreakCard } from "@/components/StreakCard";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { MonthlyReportCard } from "@/components/MonthlyReportCard";
import { BaselineReassessmentPrompt } from "@/components/BaselineReassessmentPrompt";
import { AdherenceCalendar } from "@/components/AdherenceCalendar";
import { useLISData } from "@/hooks/useLISData";
import { format } from "date-fns";
import LISInputForm from "@/components/LISInputForm";
import FirstTimeDailyScoreWelcome from "@/components/FirstTimeDailyScoreWelcome";
import { TodayProtocolWidget } from "@/components/TodayProtocolWidget";
import { MemberProgressCard } from "@/components/MemberProgressCard";
import { useAssessments, useDailyScores, useUserSymptoms } from "@/queries";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GoalsSummaryView } from "@/components/GoalsSummaryView";
import { NinetyDayPlanOverview } from "@/components/NinetyDayPlanOverview";
import { GoalCheckInAlert } from "@/components/GoalCheckInAlert";

import { GoalWorkingTowards } from "@/components/GoalWorkingTowards";
import { useGoals } from "@/hooks/useGoals";
import { GoalInsightsCard } from "@/components/GoalInsightsCard";
import { MenoMapDashboardWidget } from "@/components/menomap/MenoMapDashboardWidget";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { EnergyDashboardWidget } from "@/components/energy/EnergyDashboardWidget";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { useProtocols } from "@/hooks/useProtocols";
import { ProgressiveHealthOverview } from "@/components/ProgressiveHealthOverview";
import { SymptomAssessment as SymptomAssessmentType } from "@/types/assessments";
import { GoalStatementCard } from "@/components/today/GoalStatementCard";
import { DailyEssentialsCard } from "@/components/today/DailyEssentialsCard";
import { NutritionSummaryCard } from "@/components/today/NutritionSummaryCard";
import { MovementCard } from "@/components/today/MovementCard";
import { SupplementsCard } from "@/components/today/SupplementsCard";
import { SimpleProgressTracker } from "@/components/today/SimpleProgressTracker";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { useAssessmentCompletions } from "@/hooks/useAssessmentCompletions";
import { ProtocolGenerationPrompt } from "@/components/ProtocolGenerationPrompt";
import { supabase } from "@/integrations/supabase/client";

interface DashboardData {
  currentScore: number;
  weeklyTrend: 'up' | 'down' | 'stable';
  lastAssessment: string;
  totalAssessments: number;
}

interface SymptomAssessment {
  id: string;
  symptom_type: string;
  overall_score: number;
  score_category: string;
  completed_at: string;
  primary_issues: string[];
}

interface UserSymptom {
  id: string;
  symptom_id: string;
  severity: string;
  frequency: string;
  is_active: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'today');
  const [loading, setLoading] = useState(false);
  
  const lisData = useLISData();
  const { currentStage, isEnabled: hormoneCompassEnabled } = useHormoneCompass();
  const { isEnabled: energyLoopEnabled, currentScore } = useEnergyLoop();

  // Use React Query hooks
  const { data: assessments = [], isLoading: loadingAssessments } = useAssessments(user?.id);
  const { data: dailyScores = [], isLoading: loadingDailyScores } = useDailyScores(user?.id);
  const { data: userSymptoms = [], isLoading: loadingSymptoms } = useUserSymptoms(user?.id);

  // Fetch goals data
  const { goals } = useGoals();
  const { protocols } = useProtocols();
  const activeGoals = goals.filter((g) => g.status === "active");

  // Daily plan hook
  const { 
    actions, 
    loading: dailyPlanLoading, 
    completedCount, 
    totalCount, 
    dailyStreak,
    refetch: refetchDailyPlan 
  } = useDailyPlan();

  // Assessment completions
  const { completions: assessmentCompletions } = useAssessmentCompletions();
  const assessmentCompletedCount = Object.values(assessmentCompletions).filter(p => p.completed).length;

  // Daily plan calculations
  console.log('[Dashboard] All actions:', actions);
  console.log('[Dashboard] Protocols:', protocols);
  console.log('[Dashboard] Active protocols:', protocols.filter(p => p.is_active));
  
  const movements = actions.filter(a => a.category === 'deep_practice');
  const supplements = actions.filter(a => a.category === 'quick_win' && a.type === 'protocol');
  
  console.log('[Dashboard] Filtered supplements:', supplements);
  console.log('[Dashboard] Supplement count:', supplements.length);
  
  const remainingActions = actions.filter(a => !a.completed);
  const estimatedMinutesRemaining = remainingActions.reduce((sum, action) => sum + action.estimatedMinutes, 0);
  const hasNoProtocol = actions.length === 0 && !dailyPlanLoading;
  
  console.log('[Dashboard] hasNoProtocol:', hasNoProtocol);
  console.log('[Dashboard] dailyPlanLoading:', dailyPlanLoading);

  // Check if we should auto-open the daily submission modal
  const shouldAutoOpenModal = searchParams.get('action') === 'submitDaily';

  // Get unique assessments by symptom type (most recent for each type)
  const recentAssessments = assessments?.reduce((acc: SymptomAssessment[], current) => {
    if (!acc.find(item => item.symptom_type === current.symptom_type)) {
      acc.push(current);
    }
    return acc;
  }, []).slice(0, 5) || [];

  const activeSymptoms = userSymptoms?.filter(s => s.is_active) || [];
  const dailyScoreCount = dailyScores?.length || 0;

  const isLoading = authLoading || loadingAssessments || loadingDailyScores || loadingSymptoms;

  const getSymptomIcon = (symptomId: string) => {
    const iconMap: Record<string, any> = {
      'brain-fog': Brain,
      'energy': Zap,
      'joint-pain': Bone,
      'sleep': Moon,
      'gut': Heart,
      'anxiety': AlertTriangle
    };
    return iconMap[symptomId] || Heart;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'text-green-600 border-green-200 bg-green-50';
      case 'good': return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'fair': return 'text-amber-600 border-amber-200 bg-amber-50';
      case 'poor': return 'text-red-600 border-red-200 bg-red-50';
      default: return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getPersonalizedAssessmentStatements = () => {
    if (recentAssessments.length === 0) return {
      primaryStatement: "Your health journey is just beginning. Complete your first symptom assessment to unlock personalised insights and recommendations tailored specifically to your wellness goals.",
      secondaryStatements: [],
      actionStatement: "Take your first assessment to discover your unique health profile and receive targeted guidance for optimal wellbeing."
    };

    const avgScore = recentAssessments.reduce((sum, a) => sum + a.overall_score, 0) / recentAssessments.length;
    const poorSymptoms = recentAssessments.filter(a => a.score_category === 'poor');
    const fairSymptoms = recentAssessments.filter(a => a.score_category === 'fair');
    const goodSymptoms = recentAssessments.filter(a => a.score_category === 'good');
    const excellentSymptoms = recentAssessments.filter(a => a.score_category === 'excellent');

    // Extract common primary issues for pattern analysis
    const allPrimaryIssues = recentAssessments.flatMap(a => a.primary_issues || []);
    const issueFrequency = allPrimaryIssues.reduce((acc: Record<string, number>, issue: string) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonIssues = Object.entries(issueFrequency)
      .filter(([_, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2);

    let primaryStatement = "";
    let secondaryStatements: string[] = [];
    let actionStatement = "";

    // Generate primary assessment statement
    if (avgScore >= 80) {
      primaryStatement = `Your health profile demonstrates exceptional symptom management across ${recentAssessments.length} key areas, with an overall wellness score of ${Math.round(avgScore)}/100. This places you in the top tier of health optimisation, indicating that your current lifestyle and health strategies are highly effective.`;
      
      if (excellentSymptoms.length > 0) {
        secondaryStatements.push(`Your ${excellentSymptoms.map(a => getSymptomName(a.symptom_type)).join(', ')} management is exemplary, serving as a strong foundation for your overall wellness.`);
      }
      
      actionStatement = "Continue your successful health practices and consider sharing your strategies with others. Focus on maintaining these excellent results through consistent routines.";
    } else if (avgScore >= 65) {
      primaryStatement = `Your health profile shows strong overall wellness with a score of ${Math.round(avgScore)}/100 across ${recentAssessments.length} assessed areas. You have ${excellentSymptoms.length + goodSymptoms.length} areas performing well, indicating effective health management strategies in place.`;
      
      if (poorSymptoms.length + fairSymptoms.length > 0) {
        const concerningAreas = [...poorSymptoms, ...fairSymptoms].map(a => getSymptomName(a.symptom_type));
        secondaryStatements.push(`While your foundation is solid, ${concerningAreas.join(', ')} ${concerningAreas.length === 1 ? 'requires' : 'require'} targeted attention to optimise your overall wellbeing.`);
      }
      
      if (commonIssues.length > 0) {
        secondaryStatements.push(`Analysis reveals that ${commonIssues[0][0]} appears as a common factor across multiple symptoms, suggesting this may be a key leverage point for improvement.`);
      }
      
      actionStatement = `Focus on addressing ${poorSymptoms.length + fairSymptoms.length} area${poorSymptoms.length + fairSymptoms.length > 1 ? 's' : ''} while maintaining your current successful strategies.`;
    } else if (avgScore >= 50) {
      primaryStatement = `Your health profile presents a mixed picture with a wellness score of ${Math.round(avgScore)}/100, indicating both areas of strength and opportunities for significant improvement across ${recentAssessments.length} assessed domains.`;
      
      if (excellentSymptoms.length + goodSymptoms.length > 0) {
        secondaryStatements.push(`Your success in managing ${[...excellentSymptoms, ...goodSymptoms].map(a => getSymptomName(a.symptom_type)).join(', ')} demonstrates your capability for effective health management.`);
      }
      
      if (poorSymptoms.length > 0) {
        secondaryStatements.push(`${poorSymptoms.map(a => getSymptomName(a.symptom_type)).join(', ')} ${poorSymptoms.length === 1 ? 'shows' : 'show'} significant concern and should be your primary focus areas for health intervention.`);
      }
      
      if (commonIssues.length > 0) {
        secondaryStatements.push(`Notably, ${commonIssues[0][0]} emerges as a recurring theme across ${commonIssues[0][1]} different symptoms, suggesting addressing this root cause could create meaningful improvements across multiple areas.`);
      }
      
      actionStatement = `Prioritize addressing the ${poorSymptoms.length} most concerning area${poorSymptoms.length > 1 ? 's' : ''} while building upon your existing strengths.`;
    } else {
      primaryStatement = `Your current health profile indicates significant challenges across multiple symptom areas, with a wellness score of ${Math.round(avgScore)}/100. This suggests that comprehensive health intervention and professional guidance may be beneficial for optimal outcomes.`;
      
      if (poorSymptoms.length > 0) {
        secondaryStatements.push(`${poorSymptoms.map(a => getSymptomName(a.symptom_type)).join(', ')} ${poorSymptoms.length === 1 ? 'requires' : 'require'} immediate attention and may benefit from professional medical evaluation.`);
      }
      
      if (excellentSymptoms.length + goodSymptoms.length > 0) {
        secondaryStatements.push(`However, your success with ${[...excellentSymptoms, ...goodSymptoms].map(a => getSymptomName(a.symptom_type)).join(', ')} shows that positive change is achievable with the right approach.`);
      }
      
      if (commonIssues.length > 0) {
        secondaryStatements.push(`The recurring presence of ${commonIssues[0][0]} across multiple symptoms suggests this may be a critical root cause that, when addressed, could lead to significant overall improvement.`);
      }
      
      actionStatement = `Consider comprehensive medical evaluation and focus on systematic intervention for the ${poorSymptoms.length + fairSymptoms.length} areas requiring attention.`;
    }

    return { primaryStatement, secondaryStatements, actionStatement };
  };

  const getOverallHealthStatus = () => {
    if (recentAssessments.length === 0) return { 
      status: 'No Data', 
      color: 'text-gray-600',
      score: 0,
      assessment: 'Complete your first symptom assessment to get your health profile.'
    };
    
    const avgScore = recentAssessments.reduce((sum, a) => sum + a.overall_score, 0) / recentAssessments.length;
    
    if (avgScore >= 80) return { status: 'Excellent', color: 'text-green-600', score: Math.round(avgScore), assessment: '' };
    if (avgScore >= 65) return { status: 'Good', color: 'text-blue-600', score: Math.round(avgScore), assessment: '' };
    if (avgScore >= 50) return { status: 'Fair', color: 'text-amber-600', score: Math.round(avgScore), assessment: '' };
    return { status: 'Needs Attention', color: 'text-red-600', score: Math.round(avgScore), assessment: '' };
  };

  const getPriorityRecommendations = () => {
    const recommendations = [];
    
    if (activeSymptoms.length === 0) {
      recommendations.push({
        title: "Start Your Health Assessment",
        description: "Take your first symptom assessment to get personalised recommendations",
        action: () => navigate('/symptoms'),
        priority: 'high'
      });
    }

    // Add recommendations for ALL poor/fair assessments
    const poorAssessments = recentAssessments.filter(a => a.score_category === 'poor' || a.score_category === 'fair');
    poorAssessments.forEach(assessment => {
      recommendations.push({
        title: `Address ${getSymptomName(assessment.symptom_type)}`,
        description: "Your recent assessment shows this area needs attention",
        action: () => navigate(`/assessment/${assessment.symptom_type}/results`),
        priority: 'high'
      });
    });

    if (recentAssessments.length > 0) {
      recommendations.push({
        title: "View Complete Health Profile",
        description: "See detailed aggregated analysis and comprehensive recommendations",
        action: () => navigate('/reports'),
        priority: 'medium'
      });
    }

    return recommendations.slice(0, 5); // Increased limit to show more priority items
  };
  const primaryActions = [
    {
      title: "View My Data",
      subtitle: "Assessment History & Reports", 
      icon: History,
      variant: "default" as const,
      onClick: () => navigate('/symptoms?from=dashboard'),
      className: "bg-primary text-primary-foreground hover:bg-primary/90"
    },
    {
      title: "Take Symptom Assessment",
      subtitle: "Complete your wellness check",
      icon: FileText,
      variant: "outline" as const,
      onClick: () => navigate('/symptoms'),
      className: "border-primary/20 text-primary hover:bg-primary/5"
    },
    {
      title: "Sync Wearables",
      subtitle: "Update health data",
      icon: Activity,
      variant: "outline" as const,
      onClick: () => handleSyncWearables(),
      className: "border-muted-foreground/20 hover:bg-muted/50"
    },
    {
      title: "Settings",
      subtitle: "Account & preferences",
      icon: Settings,
      variant: "ghost" as const,
      onClick: () => navigate('/settings'),
      className: "hover:bg-muted/50"
    }
  ];

  const handleSyncWearables = () => {
    setLoading(true);
    // Simulate sync process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Sync Complete",
        description: "Health data updated successfully",
      });
    }, 2000);
  };

  const handleToggleAction = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      if (action.type === 'protocol' && action.protocolItemId) {
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          await supabase.from('protocol_item_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('protocol_item_id', action.protocolItemId)
            .eq('completed_date', today);
        } else {
          await supabase.from('protocol_item_completions')
            .insert({
              user_id: user.id,
              protocol_item_id: action.protocolItemId,
              completed_date: today
            });
          toast({
            title: "Great work!",
            description: "Action completed successfully",
          });
        }
        refetchDailyPlan();
      }
    } catch (error) {
      console.error('Error toggling action:', error);
      toast({
        title: "Error",
        description: "Failed to update action",
        variant: "destructive"
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              My <span className="text-primary">Plan</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Your personalised 90-day health transformation roadmap
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <DashboardSkeleton />
          ) : (
          <>
        {/* Slim Welcome Banner */}
        {user && (
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-lg">👋</span>
              <div>
                <p className="font-medium">Welcome back{user?.user_metadata?.preferred_name ? `, ${user.user_metadata.preferred_name}` : ''}!</p>
                <p className="text-sm text-muted-foreground">Your health journey continues</p>
              </div>
            </div>
          </div>
        )}




        {/* Tabs for My Plan */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="today">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              My Daily Plan
            </TabsTrigger>
            <TabsTrigger value="overview">
              <Sparkles className="h-4 w-4 mr-2" />
              90 Day Plan
            </TabsTrigger>
            <TabsTrigger value="goals">
              <Target className="h-4 w-4 mr-2" />
              My Goals
            </TabsTrigger>
            <TabsTrigger value="insights">Health Analysis</TabsTrigger>
            <TabsTrigger value="progress">Tracking</TabsTrigger>
            <TabsTrigger value="protocols">Protocols</TabsTrigger>
          </TabsList>

          {/* 90-Day Overview Tab */}
          <TabsContent value="overview">
            <NinetyDayPlanOverview />
          </TabsContent>

            {/* Goals Tab - Foundation of Journey */}
            <TabsContent value="goals" className="space-y-6">
              <GoalsSummaryView />
            </TabsContent>

            {/* Today Tab - Daily Actions */}
            <TabsContent value="today" className="space-y-6">
              {hasNoProtocol && assessmentCompletedCount > 0 && (
                <ProtocolGenerationPrompt 
                  assessmentsCompleted={assessmentCompletedCount}
                  onGenerate={refetchDailyPlan}
                />
              )}

              <GoalStatementCard />
              <DailyEssentialsCard />
              <NutritionSummaryCard />
              {movements.length > 0 && (
                <MovementCard movements={movements} onToggle={handleToggleAction} />
              )}
              {supplements.length > 0 && (
                <SupplementsCard supplements={supplements} onToggle={handleToggleAction} />
              )}
              <SimpleProgressTracker 
                completedCount={completedCount}
                totalCount={totalCount}
                estimatedMinutesRemaining={estimatedMinutesRemaining}
                dailyStreak={dailyStreak?.current_streak || 0}
              />
            </TabsContent>

            {/* Progress Tab - Tracking & Streaks */}
            <TabsContent value="progress" className="space-y-6">
              {/* Progress Tracker & Streaks */}
              <div className="grid md:grid-cols-2 gap-6">
                <ProgressTracker />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Streaks</h3>
                  <div className="space-y-3">
                    <StreakCard
                      activityType="daily_check_in"
                      title="Daily Check-In"
                      description="Log your daily wellness metrics"
                    />
                    <StreakCard
                      activityType="assessments"
                      title="Assessments"
                      description="Complete health assessments"
                    />
                  </div>
                </div>
              </div>
              
              {/* Member Progress Card */}
              <MemberProgressCard />

              {/* Adherence Calendar */}
              <AdherenceCalendar />
            </TabsContent>

            {/* Insights Tab - Analysis & Reports */}
            <TabsContent value="insights" className="space-y-8">
              {/* Comprehensive Health Analysis - Show if 2+ assessments */}
              {recentAssessments.length >= 2 && (
                <Card className="border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          Comprehensive Health Analysis
                        </CardTitle>
                        <CardDescription>
                          AI-powered insights from your {recentAssessments.length} assessments
                        </CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/symptoms?view=history&tab=overview')}
                      >
                        View Full Analysis
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ProgressiveHealthOverview 
                      assessments={recentAssessments.map(a => ({
                        ...a,
                        user_id: user?.id || '',
                        answers: {},
                        detail_scores: null,
                        recommendations: {},
                        created_at: a.completed_at,
                        updated_at: a.completed_at
                      }))}
                      compact={false}
                      onViewFullAnalysis={() => navigate('/symptoms?view=history&tab=overview')}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Baseline Reassessment Prompt */}
              <BaselineReassessmentPrompt />

              {/* LIS Baseline Comparison Card */}
              {lisData.baselineScore && (
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <CardHeader>
                    <CardTitle>Your Longevity Impact Score</CardTitle>
                    <CardDescription>Baseline vs Current Performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Baseline Score */}
                      <div className="text-center p-6 bg-background/80 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Baseline (Onboarding)</p>
                        <p className="text-4xl font-bold text-primary">{lisData.baselineScore}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {lisData.baselineDate && format(lisData.baselineDate, 'MMM d, yyyy')}
                        </p>
                      </div>

                      {/* Current Score */}
                      <div className="text-center p-6 bg-background/80 rounded-lg border">
                        <p className="text-sm text-muted-foreground mb-2">Current (30-day avg)</p>
                        <p className="text-4xl font-bold text-secondary">
                          {lisData.currentScore || 'No data'}
                        </p>
                        {lisData.improvement !== 0 && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            {lisData.improvement >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={lisData.improvement >= 0 ? "text-green-600" : "text-red-600"}>
                              {lisData.improvement >= 0 ? '+' : ''}{lisData.improvement} points
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Goal Progress Report */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Goal Progress Report
                  </CardTitle>
                  <CardDescription>
                    How your daily tracking correlates with your health goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {activeGoals.length > 0 
                      ? `Tracking ${activeGoals.length} active goal${activeGoals.length > 1 ? 's' : ''}. Continue your daily LIS submissions to see progress correlations.`
                      : 'Set goals to see how your daily actions drive progress.'}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/my-goals')}
                    >
                      {activeGoals.length > 0 ? 'View Goals' : 'Create Goal'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/reports')}
                    >
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights & Reports Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <GoalInsightsCard />
                <AIInsightsCard />
              </div>

              <MonthlyReportCard isPremium={false} />

              {/* Personalised Health Assessment */}
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Comprehensive Health Analysis */}
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-primary mb-4">Your Comprehensive Health Analysis</h2>
                      <p className="text-base text-muted-foreground leading-relaxed mb-4">
                        {getOverallHealthAnalysis(recentAssessments).analysis}
                      </p>
                    </div>

                    {/* Top Recommendations */}
                    {recentAssessments.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-primary">Priority Recommendations</h3>
                        {getTopRecommendations(recentAssessments).map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border border-primary/10">
                            <div className={`h-2 w-2 rounded-full mt-2 ${rec.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                            <div>
                              <p className="text-sm font-medium text-primary">{rec.area}</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {rec.recommendation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Recommendations Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    Priority Actions
                  </CardTitle>
                  <CardDescription>Based on your recent assessments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getPriorityRecommendations().map((rec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-background rounded border hover:bg-muted/50 cursor-pointer"
                           onClick={rec.action}>
                        <div className={`h-2 w-2 rounded-full ${rec.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{rec.title}</div>
                          <div className="text-xs text-muted-foreground">{rec.description}</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Protocols Tab - Protocol Management */}
            <TabsContent value="protocols" className="space-y-6">
              {/* My Personalized Protocol */}
              <Card>
                <CardHeader>
                  <CardTitle>My Personalized Protocol</CardTitle>
                  <CardDescription>
                    Daily tracking, supplement adherence, and personalized recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate('/my-protocol')}
                    className="w-full"
                    size="lg"
                  >
                    <Pill className="mr-2 h-5 w-5" />
                    View My Protocol Manager
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    Access your supplement schedule, adherence calendar, and product recommendations
                  </p>
                </CardContent>
              </Card>

              {/* 4 Pillar Protocols */}
              <Card>
                <CardHeader>
                  <CardTitle>4 Pillar Protocols</CardTitle>
                  <CardDescription>
                    Explore Brain, Body, Balance & Beauty - complete with assessments and science-backed guidance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/pillars?pillar=brain')}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Brain className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Brain</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Cognitive optimization & mental clarity
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/pillars?pillar=body')}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Activity className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Body</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Physical strength & vitality
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/pillars?pillar=balance')}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Heart className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Balance</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Stress management & inner peace
                      </p>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => navigate('/pillars?pillar=beauty')}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <span className="font-semibold">Beauty</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-left">
                        Radiant skin & cellular rejuvenation
                      </p>
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
        </>
        )}
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default Dashboard;