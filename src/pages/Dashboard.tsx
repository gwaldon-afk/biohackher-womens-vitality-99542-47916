import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { History, FileText, Activity, Settings, TrendingUp, TrendingDown, ChevronRight, Brain, Zap, Bone, Moon, Heart, AlertTriangle, CheckCircle2, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();
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

  const getSymptomName = (symptomId: string) => {
    const nameMap: Record<string, string> = {
      'brain-fog': 'Brain Fog',
      'energy': 'Energy & Fatigue',
      'joint-pain': 'Joint Pain',
      'sleep': 'Sleep Quality',
      'gut': 'Digestive Health',
      'hot-flashes': 'Hot Flashes',
      'memory-focus': 'Memory & Focus',
      'mobility': 'Mobility',
      'bloating': 'Bloating',
      'anxiety': 'Anxiety',
      'weight': 'Weight Management',
      'hair': 'Hair Health',
      'headache': 'Headaches'
    };
    return nameMap[symptomId] || symptomId;
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

  const getOverallHealthStatus = () => {
    if (recentAssessments.length === 0) return { status: 'No Data', color: 'text-gray-600' };
    
    const avgScore = recentAssessments.reduce((sum, a) => sum + a.overall_score, 0) / recentAssessments.length;
    
    if (avgScore >= 80) return { status: 'Excellent', color: 'text-green-600' };
    if (avgScore >= 65) return { status: 'Good', color: 'text-blue-600' };
    if (avgScore >= 50) return { status: 'Fair', color: 'text-amber-600' };
    return { status: 'Needs Attention', color: 'text-red-600' };
  };

  const getPriorityRecommendations = () => {
    const recommendations = [];
    
    if (activeSymptoms.length === 0) {
      recommendations.push({
        title: "Start Your Health Assessment",
        description: "Take your first symptom assessment to get personalized recommendations",
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
        description: "See all your assessments and detailed recommendations",
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
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">

        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-primary">Sarah</span>
          </h1>
          <p className="text-muted-foreground">Your personalised health dashboard</p>
        </div>

        {/* Quick Summary Card */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <ProgressCircle value={data.currentScore} size="lg" className="text-primary">
                          <div className="text-center">
                            <div className="text-xl font-bold">{data.currentScore}</div>
                            <div className="text-xs text-muted-foreground">LIS Score</div>
                          </div>
                        </ProgressCircle>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs p-3">
                      <p className="text-sm font-medium mb-2">Longevity Impact Score (LIS)</p>
                      <p className="text-xs">
                        LIS measures your daily habits' impact on biological aging. 
                        Scores 80+ indicate aging-reversing habits, 60-80 are neutral, 
                        and below 60 may accelerate aging. Based on sleep, nutrition, 
                        activity, stress, social connections, and cognitive engagement.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* LIS Analysis */}
                <div className="space-y-4 flex-1">
                  <div className="text-lg font-bold text-gray-900">Longevity Impact Score (LIS) Analysis</div>
                  <div className="text-sm text-muted-foreground">
                    {data.currentScore >= 80 ? (
                      <span className="text-green-600 font-medium">
                        You're crushing it! Top 15% globally - your habits could add 5-10 healthy years.
                      </span>
                    ) : data.currentScore >= 60 ? (
                      <span className="text-blue-600 font-medium">
                        You're doing okay, but there's untapped potential here. 65% score similarly - ready to stand out?
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium">
                        Your current path could cost you 3-7 years vs. healthier peers. Time to pivot?
                      </span>
                    )}
                  </div>
                  
                  {/* 3-column layout */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    {/* Left column - Assessment info */}
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Last assessment: {data.lastAssessment}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total assessments: {data.totalAssessments}
                      </div>
                    </div>
                    
                    {/* Middle column - Assessment buttons */}
                    <div className="flex flex-col justify-center gap-3">
                      <Button 
                        onClick={() => navigate('/symptoms')}
                        className="bg-primary text-primary-foreground border border-primary hover:bg-primary-dark"
                        variant="outline"
                        size="sm"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        <div className="text-center leading-tight">
                          <div>Complete Today's LIS</div>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                      
                      <Button 
                        onClick={() => navigate('/assessment-history?from=dashboard')}
                        className="bg-secondary text-secondary-foreground border border-secondary hover:bg-secondary-dark"
                        variant="outline"
                        size="sm"
                      >
                        <History className="h-4 w-4 mr-2" />
                        <div className="text-center leading-tight">
                          <div>View Past LIS</div>
                          <div>Assessments</div>
                        </div>
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                    
                    {/* Right column - Status info */}
                    <div className="space-y-4">
                      {/* Weekly Trend */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Weekly Trend:</span>
                        {data.weeklyTrend === 'up' ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm font-medium">Improving</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <TrendingDown className="h-4 w-4" />
                            <span className="text-sm font-medium">Needs attention</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Health Status */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {data.currentScore >= 80 ? 'Great!' : data.currentScore >= 60 ? 'Good' : 'Focus'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Health Status
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Health Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Symptoms Overview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  My Symptoms Overview
                </CardTitle>
                <CardDescription>Track your health across all areas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSymptoms ? (
                  <div className="text-center py-8 text-muted-foreground">Loading symptoms...</div>
                ) : recentAssessments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAssessments.map((assessment) => {
                      const Icon = getSymptomIcon(assessment.symptom_type);
                      return (
                        <div key={assessment.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                             onClick={() => navigate(`/assessment/${assessment.symptom_type}/results`)}>
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{getSymptomName(assessment.symptom_type)}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(assessment.completed_at).toLocaleDateString()}
                              </div>
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

          {/* Health Status & Quick Actions */}
          <div className="space-y-6">
            {/* Overall Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className={`text-2xl font-bold ${getOverallHealthStatus().color}`}>
                    {getOverallHealthStatus().status}
                  </div>
                  {recentAssessments.length > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Based on {recentAssessments.length} recent assessment{recentAssessments.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  <div className="pt-4 space-y-2">
                    <Button 
                      onClick={() => navigate('/symptoms')} 
                      className="w-full" 
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      New Assessment
                    </Button>
                    <Button 
                      onClick={() => navigate('/reports')} 
                      variant="outline" 
                      className="w-full" 
                      size="sm"
                    >
                      <History className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Symptoms Count */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {activeSymptoms.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Symptoms Tracked
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
          <Button variant="link" onClick={() => navigate('/reports')} className="text-sm">
            View Detailed Reports →
          </Button>
          <Button variant="link" onClick={() => navigate('/nutrition')} className="text-sm">
            Nutrition Guidance →
          </Button>
          <Button variant="link" onClick={() => navigate('/sleep')} className="text-sm">
            Sleep Optimization →
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;