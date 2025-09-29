import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Crown, Lock, Activity, Heart, Brain, Users, CheckCircle2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [symptomAssessments, setSymptomAssessments] = useState<any[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Available reports configuration
  const availableReports = [
    {
      id: 'summary-list',
      title: 'Summary Symptom List',
      description: 'Comprehensive overview of all assessed symptoms for healthcare professionals',
      icon: FileText,
      category: 'Medical',
      isPremium: false,
      estimatedTime: '2 min',
      purpose: 'Perfect for doctor visits and medical consultations'
    },
    {
      id: 'comprehensive-analysis',
      title: 'Comprehensive Health Analysis', 
      description: 'In-depth analysis combining all assessments with personalized insights',
      icon: TrendingUp,
      category: 'Analysis',
      isPremium: false,
      estimatedTime: '3 min',
      purpose: 'Understand your overall health patterns and trends'
    },
    {
      id: 'progress-tracking',
      title: 'Progress & Trends Report',
      description: 'Visual tracking of your health improvements and goal achievements',
      icon: TrendingUp,
      category: 'Progress',
      isPremium: true,
      estimatedTime: '2 min',
      purpose: 'Monitor improvement trends and celebrate milestones'
    },
    {
      id: 'medical-consultation',
      title: 'Medical Consultation Package',
      description: 'Complete medical-grade report with lab integration and specialist notes',
      icon: FileText,
      category: 'Medical',
      isPremium: true,
      estimatedTime: '4 min',
      purpose: 'Comprehensive package for specialist appointments'
    },
    {
      id: 'lifestyle-recommendations',
      title: 'Personalized Action Plan',
      description: 'Customized recommendations and actionable steps based on your assessments',
      icon: CheckCircle2,
      category: 'Planning',
      isPremium: false,
      estimatedTime: '2 min',
      purpose: 'Get specific, actionable steps to improve your health'
    },
    {
      id: 'wellness-dashboard',
      title: 'Weekly Wellness Dashboard',
      description: 'Quick overview of your current health status and weekly highlights',
      icon: Heart,
      category: 'Overview',
      isPremium: false,
      estimatedTime: '1 min',
      purpose: 'Stay on top of your current health status'
    }
  ];

  const getReportsByCategory = () => {
    return availableReports.reduce((acc, report) => {
      if (!acc[report.category]) {
        acc[report.category] = [];
      }
      acc[report.category].push(report);
      return acc;
    }, {} as Record<string, typeof availableReports>);
  };

  useEffect(() => {
    fetchSymptomAssessments();
  }, []);

  const fetchSymptomAssessments = async () => {
    setLoadingSymptoms(true);
    try {
      if (!user) {
        generateDemoSymptomAssessments();
        return;
      }

      const { data: assessments, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      const uniqueAssessments = assessments?.reduce((acc: any[], current) => {
        if (!acc.find(item => item.symptom_type === current.symptom_type)) {
          acc.push(current);
        }
        return acc;
      }, []) || [];

      if (uniqueAssessments.length === 0) {
        generateDemoSymptomAssessments();
        return;
      }

      setSymptomAssessments(uniqueAssessments);
    } catch (error) {
      console.error('Error fetching symptom assessments:', error);
      generateDemoSymptomAssessments();
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const generateDemoSymptomAssessments = () => {
    const demoAssessments = [
      {
        id: 'demo-joint-pain',
        user_id: 'demo-user',
        symptom_type: 'joint-pain',
        overall_score: 60,
        score_category: 'fair',
        primary_issues: ['morning_stiffness', 'knee_pain'],
        recommendations: {
          immediate: ['Anti-inflammatory diet', 'Gentle stretching'],
          lifestyle: ['Regular low-impact exercise', 'Weight management'],
          professional: ['Rheumatology consultation if symptoms persist']
        },
        completed_at: new Date().toISOString(),
        detail_scores: {
          pain_severity: 65,
          mobility_impact: 55,
          daily_function: 70
        }
      }
    ];
    
    setSymptomAssessments(demoAssessments);
    setLoadingSymptoms(false);
  };

  const getSymptomName = (symptomId: string) => {
    const nameMap: Record<string, string> = {
      'joint-pain': 'Joint Pain',
      'sleep': 'Sleep Quality',
      'energy': 'Energy & Fatigue'
    };
    return nameMap[symptomId] || symptomId;
  };

  const getOverallSymptomAnalysis = () => {
    if (symptomAssessments.length === 0) return {
      status: 'No Data',
      score: 0,
      breakdown: { excellent: 0, good: 0, fair: 0, poor: 0 }
    };

    const avgScore = symptomAssessments.reduce((sum, a) => sum + a.overall_score, 0) / symptomAssessments.length;
    const breakdown = {
      excellent: symptomAssessments.filter(a => a.score_category === 'excellent').length,
      good: symptomAssessments.filter(a => a.score_category === 'good').length,
      fair: symptomAssessments.filter(a => a.score_category === 'fair').length,
      poor: symptomAssessments.filter(a => a.score_category === 'poor').length
    };

    let status = avgScore >= 80 ? 'Excellent' : avgScore >= 65 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Needs Attention';

    return { status, score: Math.round(avgScore), breakdown };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Health Reports</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive analysis of your health journey and symptom management
            </p>
          </div>

          {/* Reports Landing Page */}
          {!selectedReport ? (
            <div className="space-y-8">
              {/* Quick Stats */}
              {!loadingSymptoms && symptomAssessments.length > 0 && (
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{symptomAssessments.length}</div>
                        <div className="text-sm text-muted-foreground">Assessments Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{getOverallSymptomAnalysis().score}/100</div>
                        <div className="text-sm text-muted-foreground">Overall Health Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">30</div>
                        <div className="text-sm text-muted-foreground">Days of Data</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">6</div>
                        <div className="text-sm text-muted-foreground">Available Reports</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Available Reports by Category */}
              <div className="space-y-8">
                {Object.entries(getReportsByCategory()).map(([category, reports]) => (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-primary mb-6">{category} Reports</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {reports.map((report) => (
                        <Card 
                          key={report.id} 
                          className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                            report.isPremium ? 'border-secondary/20 bg-secondary/5' : 'hover:border-primary/30'
                          }`}
                          onClick={() => setSelectedReport(report.id)}
                        >
                          <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${
                                  report.isPremium ? 'bg-secondary/10' : 'bg-primary/10'
                                }`}>
                                  <report.icon className={`h-5 w-5 ${
                                    report.isPremium ? 'text-secondary' : 'text-primary'
                                  }`} />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{report.title}</CardTitle>
                                  {report.isPremium && (
                                    <Badge variant="secondary" className="mt-1">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="mb-4">
                              {report.description}
                            </CardDescription>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Estimated time:</span>
                                <span className="font-medium">{report.estimatedTime}</span>
                              </div>
                              <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                                {report.purpose}
                              </div>
                            </div>
                            {report.isPremium && (
                              <div className="flex items-center gap-2 mt-3 p-2 bg-secondary/10 rounded border border-secondary/20">
                                <Lock className="h-4 w-4 text-secondary" />
                                <span className="text-sm text-secondary">Premium feature</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium Upgrade CTA */}
              <Card className="border-secondary/20 bg-gradient-to-r from-secondary/5 to-secondary/10">
                <CardContent className="p-8 text-center">
                  <Crown className="h-12 w-12 text-secondary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-secondary mb-4">Unlock Premium Reports</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Get access to advanced analytics, medical-grade reports, and AI-powered insights 
                    to supercharge your health optimization journey.
                  </p>
                  <Button className="bg-secondary hover:bg-secondary/90 text-white">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Selected Report View */
            <div className="space-y-6">
              {/* Back Button */}
              <Button 
                variant="outline" 
                onClick={() => setSelectedReport(null)}
                className="mb-4"
              >
                ← Back to Reports
              </Button>

              {/* Summary List Report */}
              {selectedReport === 'summary-list' && (
                <Card>
                  <CardHeader className="text-center border-b">
                    <CardTitle className="text-2xl font-bold text-primary">Summary Symptom List</CardTitle>
                    <CardDescription className="text-base">
                      Comprehensive health profile for medical consultation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">
                          {getOverallSymptomAnalysis().score}/100
                        </div>
                        <div className="text-lg font-semibold text-muted-foreground">
                          {getOverallSymptomAnalysis().status}
                        </div>
                      </div>

                      {symptomAssessments.map((assessment, index) => (
                        <div key={assessment.id} className="border rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-primary">
                                {index + 1}. {getSymptomName(assessment.symptom_type)}
                              </h4>
                              <div className="flex items-center gap-3 mt-2">
                                <span className="text-2xl font-bold">{assessment.overall_score}/100</span>
                                <Badge variant="outline">{assessment.score_category}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => window.print()}>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Summary
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comprehensive Analysis Report */}
              {selectedReport === 'comprehensive-analysis' && (
                <Card>
                  <CardHeader className="text-center border-b">
                    <CardTitle className="text-2xl font-bold text-primary">Comprehensive Health Analysis</CardTitle>
                    <CardDescription className="text-base">
                      In-depth analysis combining all assessments with personalized insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {getOverallSymptomAnalysis().score}/100
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Health Score</div>
                        </div>
                        <div className="text-center p-6 bg-secondary/5 rounded-lg">
                          <div className="text-2xl font-bold text-secondary mb-2">
                            {symptomAssessments.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Areas Assessed</div>
                        </div>
                        <div className="text-center p-6 bg-accent/5 rounded-lg">
                          <div className="text-2xl font-bold text-accent mb-2">
                            {getOverallSymptomAnalysis().breakdown.excellent + getOverallSymptomAnalysis().breakdown.good}
                          </div>
                          <div className="text-sm text-muted-foreground">Positive Areas</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-primary">Health Pattern Analysis</h3>
                        {symptomAssessments.map((assessment) => (
                          <div key={assessment.id} className="border rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-semibold">{getSymptomName(assessment.symptom_type)}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xl font-bold">{assessment.overall_score}/100</span>
                                  <Badge variant="outline">{assessment.score_category}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium mb-2">Key Recommendations:</h5>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                  {assessment.recommendations?.immediate?.map((rec: string, idx: number) => (
                                    <li key={idx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => window.print()}>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Analysis
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lifestyle Recommendations Report */}
              {selectedReport === 'lifestyle-recommendations' && (
                <Card>
                  <CardHeader className="text-center border-b">
                    <CardTitle className="text-2xl font-bold text-primary">Personalized Action Plan</CardTitle>
                    <CardDescription className="text-base">
                      Customized recommendations and actionable steps based on your assessments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5" />
                            Immediate Actions
                          </h3>
                          <div className="space-y-3">
                            {symptomAssessments.flatMap(a => a.recommendations?.immediate || []).slice(0, 5).map((rec: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Lifestyle Changes
                          </h3>
                          <div className="space-y-3">
                            {symptomAssessments.flatMap(a => a.recommendations?.lifestyle || []).slice(0, 5).map((rec: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg">
                                <Activity className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-accent mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Professional Consultations
                        </h3>
                        <div className="space-y-3">
                          {symptomAssessments.flatMap(a => a.recommendations?.professional || []).map((rec: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                              <Users className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => window.print()}>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Action Plan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Weekly Wellness Dashboard */}
              {selectedReport === 'wellness-dashboard' && (
                <Card>
                  <CardHeader className="text-center border-b">
                    <CardTitle className="text-2xl font-bold text-primary">Weekly Wellness Dashboard</CardTitle>
                    <CardDescription className="text-base">
                      Quick overview of your current health status and weekly highlights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-primary/10 rounded-lg">
                          <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
                          <div className="text-xl font-bold text-primary">
                            {getOverallSymptomAnalysis().score}/100
                          </div>
                          <div className="text-xs text-muted-foreground">Health Score</div>
                        </div>
                        <div className="text-center p-4 bg-secondary/10 rounded-lg">
                          <Brain className="h-8 w-8 text-secondary mx-auto mb-2" />
                          <div className="text-xl font-bold text-secondary">
                            {symptomAssessments.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Tracked Areas</div>
                        </div>
                        <div className="text-center p-4 bg-accent/10 rounded-lg">
                          <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                          <div className="text-xl font-bold text-accent">7</div>
                          <div className="text-xs text-muted-foreground">Days Active</div>
                        </div>
                        <div className="text-center p-4 bg-green-100 rounded-lg">
                          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <div className="text-xl font-bold text-green-600">
                            {getOverallSymptomAnalysis().breakdown.excellent + getOverallSymptomAnalysis().breakdown.good}
                          </div>
                          <div className="text-xs text-muted-foreground">Good Areas</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-primary mb-4">This Week's Highlights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              Areas of Improvement
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {symptomAssessments.filter(a => a.score_category === 'excellent' || a.score_category === 'good').map(a => (
                                <li key={a.id}>• {getSymptomName(a.symptom_type)} ({a.overall_score}/100)</li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Focus Areas
                            </h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {symptomAssessments.filter(a => a.score_category === 'fair' || a.score_category === 'poor').map(a => (
                                <li key={a.id}>• {getSymptomName(a.symptom_type)} needs attention</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => window.print()}>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Dashboard
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Premium Report Placeholder */}
              {(['progress-tracking', 'medical-consultation'].includes(selectedReport || '')) && (
                <Card className="border-secondary/20 bg-secondary/5">
                  <CardContent className="p-8 text-center">
                    <Lock className="h-12 w-12 text-secondary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-secondary mb-4">Premium Report</h3>
                    <p className="text-muted-foreground mb-6">
                      This advanced report requires a premium subscription to access.
                    </p>
                    <Button className="bg-secondary hover:bg-secondary/90 text-white">
                      Upgrade to Premium
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Reports;