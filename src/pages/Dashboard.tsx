import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { History, FileText, Activity, Settings, TrendingUp, TrendingDown, ChevronRight, Brain, Zap, Bone, Moon, Heart, AlertTriangle, CheckCircle2, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";
import Reports from "@/pages/Reports";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getOverallHealthAnalysis, getSymptomName, getTopRecommendations } from "@/utils/healthAnalysis";
import { ProgressTracker } from "@/components/ProgressTracker";
import { StreakCard } from "@/components/StreakCard";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { MonthlyReportCard } from "@/components/MonthlyReportCard";
import { BaselineReassessmentPrompt } from "@/components/BaselineReassessmentPrompt";
import { useLISData } from "@/hooks/useLISData";
import { format } from "date-fns";

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [data, setData] = useState<DashboardData>({
    currentScore: 72.5,
    weeklyTrend: 'up',
    lastAssessment: '3 days ago',
    totalAssessments: 8
  });
  const [loading, setLoading] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState<SymptomAssessment[]>([]);
  const [activeSymptoms, setActiveSymptoms] = useState<UserSymptom[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  
  const lisData = useLISData();

  // Refetch LIS data when returning to overview tab
  useEffect(() => {
    if (activeTab === 'overview' && user) {
      lisData.refetch();
    }
  }, [activeTab, user]);

  // Fetch user's symptoms and assessments
  useEffect(() => {
    if (user) {
      fetchSymptomData();
    }
  }, [user]);

  const fetchSymptomData = async () => {
    if (!user) return;
    
    setLoadingSymptoms(true);
    try {
      // Fetch recent symptom assessments - one per symptom type for variety
      const { data: assessments, error: assessmentError } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (assessmentError) throw assessmentError;
      
      // Get unique assessments by symptom type (most recent for each type)
      const uniqueAssessments = assessments?.reduce((acc: SymptomAssessment[], current) => {
        if (!acc.find(item => item.symptom_type === current.symptom_type)) {
          acc.push(current);
        }
        return acc;
      }, []).slice(0, 5) || [];
      
      setRecentAssessments(uniqueAssessments);

      // Fetch active symptoms
      const { data: symptoms, error: symptomsError } = await supabase
        .from('user_symptoms')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (symptomsError) throw symptomsError;
      setActiveSymptoms(symptoms || []);
    } catch (error) {
      console.error('Error fetching symptom data:', error);
    } finally {
      setLoadingSymptoms(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            My <span className="text-primary">Health Journey</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress, view comprehensive reports, and access your complete health data
          </p>
        </div>

        {/* Tabs for My Journey */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">

        {/* Baseline Reassessment Prompt */}
        <BaselineReassessmentPrompt />

        {/* LIS Baseline Comparison Card */}
        {lisData.baselineScore && (
          <Card className="col-span-2 bg-gradient-to-r from-primary/5 to-secondary/5">
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

              {/* Data Sources Indicator */}
              <div className="mt-6 p-4 bg-background/80 rounded-lg border">
                <h4 className="font-medium mb-3">Data Sources</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wearable Sync</span>
                    <Badge variant={lisData.hasWearableData ? "default" : "outline"}>
                      {lisData.hasWearableData ? "Active" : "Not connected"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Manual Entry</span>
                    <Badge variant={lisData.hasManualData ? "default" : "outline"}>
                      {lisData.manualEntryCount} entries
                    </Badge>
                  </div>
                </div>
                {lisData.lastSyncTime && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Last synced: {format(new Date(lisData.lastSyncTime), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress & Streaks Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
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

        {/* AI Insights & Reports Section - Premium Features */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <AIInsightsCard isPremium={false} />
          <MonthlyReportCard isPremium={false} />
        </div>

        {/* Personalised Health Assessment */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
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

              {/* Health Score and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                <div className="flex items-center gap-6">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">
                          <ProgressCircle 
                            value={lisData.currentScore || lisData.baselineScore || 0} 
                            size="lg" 
                            className="text-primary"
                          >
                            <div className="text-center">
                              <div className="text-xl font-bold">
                                {lisData.currentScore || lisData.baselineScore || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">LIS Score</div>
                            </div>
                          </ProgressCircle>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3">
                        <p className="text-sm font-medium mb-2">Longevity Impact Score (LIS)</p>
                        <p className="text-xs">
                          LIS measures your daily habits impact on biological ageing. 
                          Scores 80+ indicate ageing-reversing habits, 60-80 are neutral, 
                          and below 60 may accelerate ageing.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getOverallHealthAnalysis(recentAssessments).status === 'Excellent' ? 'text-green-600' : getOverallHealthAnalysis(recentAssessments).status === 'Good' ? 'text-blue-600' : getOverallHealthAnalysis(recentAssessments).status === 'Fair' ? 'text-amber-600' : 'text-red-600'}`}>
                      {getOverallHealthAnalysis(recentAssessments).status}
                    </div>
                    {getOverallHealthAnalysis(recentAssessments).score > 0 && (
                      <div className="text-sm text-muted-foreground">
                        Overall Score: {getOverallHealthAnalysis(recentAssessments).score}/100
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={() => navigate('/reports?view=comprehensive')}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    size="sm"
                  >
                    <History className="h-4 w-4 mr-2" />
                    View Full Analysis
                  </Button>

                  <Button 
                    onClick={() => navigate('/symptoms')}
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5"
                    size="sm"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Update Assessment
                  </Button>

                  <Button 
                    onClick={() => navigate('/symptoms')}
                    variant="outline"
                    className="border-primary/20 text-primary hover:bg-primary/5"
                    size="sm"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complete Your Protocol Card */}
        {recentAssessments.length > 0 && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                Complete Your Protocol
              </CardTitle>
              <CardDescription>
                Recommended supplements based on your assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {recentAssessments.filter(a => a.score_category === 'poor' || a.score_category === 'fair').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Areas need attention</p>
                </div>
                <Button onClick={() => navigate('/my-protocol')}>
                  View My Protocol
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your {recentAssessments.length} completed assessment{recentAssessments.length > 1 ? 's' : ''}, 
                we've identified evidence-based supplements that may support your wellness goals.
              </p>
            </CardContent>
          </Card>
        )}

        {/* My Health Profile Section */}
        <div className="mb-8">
          {/* Symptoms Overview - Full Width */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <CardTitle>My Symptoms Overview</CardTitle>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {activeSymptoms.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Symptoms Tracked
                  </div>
                </div>
              </div>
              <CardDescription>Track your health across all areas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSymptoms ? (
                <div className="text-center py-8 text-muted-foreground">Loading symptoms...</div>
              ) : recentAssessments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => {
                    const Icon = getSymptomIcon(assessment.symptom_type);
                    const getSymptomInsight = (category: string, score: number) => {
                      if (category === 'excellent') return `Your ${getSymptomName(assessment.symptom_type).toLowerCase()} management is exemplary and well-optimised.`;
                      if (category === 'good') return `Your ${getSymptomName(assessment.symptom_type).toLowerCase()} shows positive management with room for fine-tuning.`;
                      if (category === 'fair') return `Your ${getSymptomName(assessment.symptom_type).toLowerCase()} needs focused attention for improvement.`;
                      return `Your ${getSymptomName(assessment.symptom_type).toLowerCase()} requires immediate intervention and support.`;
                    };
                    
                    return (
                      <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                           onClick={() => navigate(`/assessment/${assessment.symptom_type}/results`)}>
                        <div className="flex items-center gap-3 flex-1">
                          <div className="bg-primary/10 p-2 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{getSymptomName(assessment.symptom_type)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(assessment.completed_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {getSymptomInsight(assessment.score_category, assessment.overall_score)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getCategoryColor(assessment.score_category)}>
                            {assessment.score_category}
                          </Badge>
                          <div className="text-sm font-medium">{assessment.overall_score}/100</div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">No symptom assessments yet</p>
                  <Button onClick={() => navigate('/symptoms')}>
                    Take Your First Assessment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Priority Recommendations
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {primaryActions.map((action, index) => (
            <Button
              key={action.title}
              variant={action.variant}
              onClick={action.onClick}
              disabled={action.title === 'Sync Wearables' && loading}
              className={`h-24 p-6 flex items-center gap-4 justify-start text-left ${action.className}`}
            >
              <action.icon className="h-6 w-6 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-base">{action.title}</div>
                <div className="text-sm opacity-80">{action.subtitle}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">8</div>
            <div className="text-xs text-muted-foreground">Assessments</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">5</div>
            <div className="text-xs text-muted-foreground">Good Days</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">2</div>
            <div className="text-xs text-muted-foreground">Focus Areas</div>
          </Card>
          
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">72%</div>
            <div className="text-xs text-muted-foreground">Avg Score</div>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">Complete your weekly assessment to maintain tracking</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm">Review your sleep quality patterns in Reports</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-background rounded border">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm">Sync your fitness tracker for more accurate data</span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button variant="link" onClick={() => navigate('/symptoms')} className="text-sm">
            Take New Assessment →
          </Button>
          <Button variant="link" onClick={() => navigate('/nutrition')} className="text-sm">
            Nutrition Guidance →
          </Button>
          <Button variant="link" onClick={() => navigate('/sleep')} className="text-sm">
            Sleep Optimization →
          </Button>
        </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Reports />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>View all your past assessments and track changes over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Your detailed assessment history</p>
                  <Button onClick={() => navigate('/assessment-history')}>
                    View Full History
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;