import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Calendar, Brain, Moon, Heart, Thermometer, Bone, Battery, Scale, Zap, FileText, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface SymptomAssessment {
  id: string;
  symptom_type: string;
  overall_score: number;
  score_category: string;
  primary_issues: string[];
  completed_at: string;
  recommendations: any;
  answers?: any;
}

interface TrendData {
  symptom_type: string;
  assessments: SymptomAssessment[];
  trend: 'improving' | 'stable' | 'declining';
  latestScore: number;
  previousScore?: number;
}

const AssessmentHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<SymptomAssessment[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'recent' | 'trends'>('recent');

  useEffect(() => {
    if (user) {
      fetchAssessments();
    }
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching assessments:', error);
        return;
      }

      setAssessments(data || []);
      generateTrendData(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrendData = (assessmentData: SymptomAssessment[]) => {
    const groupedBySymptom = assessmentData.reduce((acc, assessment) => {
      if (!acc[assessment.symptom_type]) {
        acc[assessment.symptom_type] = [];
      }
      acc[assessment.symptom_type].push(assessment);
      return acc;
    }, {} as Record<string, SymptomAssessment[]>);

    const trends: TrendData[] = Object.entries(groupedBySymptom).map(([symptomType, assessmentList]) => {
      const sortedAssessments = assessmentList.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      
      const latestScore = sortedAssessments[0].overall_score;
      const previousScore = sortedAssessments[1]?.overall_score;
      
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (previousScore !== undefined) {
        if (latestScore > previousScore + 5) trend = 'improving';
        else if (latestScore < previousScore - 5) trend = 'declining';
      }

      return {
        symptom_type: symptomType,
        assessments: sortedAssessments,
        trend,
        latestScore,
        previousScore
      };
    });

    setTrendData(trends);
  };

  const getSymptomName = (id: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flashes",
      "sleep": "Sleep Issues",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "energy-levels": "Low Energy",
      "bloating": "Bloating",
      "weight-changes": "Weight Changes",
      "hair-thinning": "Hair Thinning",
      "anxiety": "Anxiety",
      "irregular-periods": "Irregular Periods",
      "headaches": "Headaches",
      "night-sweats": "Night Sweats",
      "memory-issues": "Memory Issues",
      "gut": "Gut Health"
    };
    return nameMap[id] || id;
  };

  const getSymptomIcon = (symptomType: string) => {
    const iconMap: Record<string, any> = {
      "sleep": Moon,
      "brain-fog": Brain,
      "memory-issues": Brain,
      "hot-flashes": Thermometer,
      "night-sweats": Thermometer,
      "joint-pain": Bone,
      "energy-levels": Battery,
      "weight-changes": Scale,
      "anxiety": Heart,
      "gut": Zap,
      "bloating": Zap
    };
    return iconMap[symptomType] || FileText;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (category: string) => {
    switch (category) {
      case 'excellent': return "bg-green-100 text-green-800";
      case 'good': return "bg-blue-100 text-blue-800";
      case 'fair': return "bg-yellow-100 text-yellow-800";
      case 'poor': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your assessment history...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/symptoms')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Symptoms
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 gradient-text">Assessment History</h1>
          <p className="text-muted-foreground">
            Review your completed symptom assessments and track your progress over time. 
            <span className="font-medium text-primary"> Click any assessment card to view detailed results and personalized recommendations.</span>
          </p>
        </div>

        {assessments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Assessments Yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your first symptom assessment to start tracking your progress.
              </p>
              <Button onClick={() => navigate('/symptoms')}>
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as 'recent' | 'trends')}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="recent">Recent Assessments</TabsTrigger>
              <TabsTrigger value="trends">Trends & Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <div className="space-y-4">
                {assessments.map((assessment) => {
                  const SymptomIcon = getSymptomIcon(assessment.symptom_type);
                  
                  return (
                    <Card 
                      key={assessment.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
                      onClick={() => {
                        // Navigate to assessment results page
                        const params = new URLSearchParams();
                        if (assessment.answers) {
                          Object.entries(assessment.answers).forEach(([key, value]) => {
                            params.append(`q${key}`, value as string);
                          });
                        }
                        navigate(`/assessment/${assessment.symptom_type}/results?${params.toString()}`);
                      }}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SymptomIcon className="h-5 w-5 text-primary" />
                            <div>
                              <CardTitle className="text-lg">
                                {getSymptomName(assessment.symptom_type)}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {format(new Date(assessment.completed_at), 'MMM d, yyyy • h:mm a')}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                              {assessment.overall_score}
                            </div>
                            <Badge className={getScoreBadgeColor(assessment.score_category)}>
                              {assessment.score_category}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      {assessment.primary_issues.length > 0 && (
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Primary Concerns:</p>
                            <div className="flex flex-wrap gap-2">
                              {assessment.primary_issues.map((issue, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {issue}
                                </Badge>
                              ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-border">
                              <p className="text-xs text-primary font-medium flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Click to view detailed results and recommendations
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      )}
                      
                      {assessment.primary_issues.length === 0 && (
                        <CardContent className="pt-0">
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-primary font-medium flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Click to view detailed results and recommendations
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="space-y-6">
                {trendData.map((trend) => {
                  const SymptomIcon = getSymptomIcon(trend.symptom_type);
                  
                  return (
                    <Card key={trend.symptom_type}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <SymptomIcon className="h-5 w-5 text-primary" />
                            <div>
                              <CardTitle className="text-lg">
                                {getSymptomName(trend.symptom_type)}
                              </CardTitle>
                              <CardDescription>
                                {trend.assessments.length} assessment{trend.assessments.length !== 1 ? 's' : ''} completed
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              {getTrendIcon(trend.trend)}
                              <span className="text-sm font-medium capitalize">{trend.trend}</span>
                            </div>
                            <div className={`text-xl font-bold ${getScoreColor(trend.latestScore)}`}>
                              {trend.latestScore}
                              {trend.previousScore !== undefined && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({trend.latestScore > trend.previousScore ? '+' : ''}
                                  {(trend.latestScore - trend.previousScore).toFixed(0)})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-muted-foreground">Recent History:</p>
                          <div className="grid gap-2">
                            {trend.assessments.slice(0, 3).map((assessment, index) => (
                              <div key={assessment.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <span className="text-sm">
                                  {format(new Date(assessment.completed_at), 'MMM d, yyyy')}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm font-medium ${getScoreColor(assessment.overall_score)}`}>
                                    {assessment.overall_score}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {assessment.score_category}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {trend.assessments.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{trend.assessments.length - 3} more assessment{trend.assessments.length - 3 !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default AssessmentHistory;