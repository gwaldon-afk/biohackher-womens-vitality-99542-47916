import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, TrendingUp, Crown, Lock, Activity, Heart, Brain, Users, CheckCircle2, ChevronRight, Home } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [symptomAssessments, setSymptomAssessments] = useState<any[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const [lisData, setLisData] = useState<any[]>([]);
  const [loadingLis, setLoadingLis] = useState(true);
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
      isPremium: false,
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
    fetchLisData();
  }, []);

  const fetchLisData = async () => {
    setLoadingLis(true);
    try {
      if (!user) {
        setLisData([]);
        setLoadingLis(false);
        return;
      }

      // Fetch last 30 days of LIS data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setLisData(data || []);
    } catch (error) {
      console.error('Error fetching LIS data:', error);
      setLisData([]);
    } finally {
      setLoadingLis(false);
    }
  };

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

      console.log('Raw assessments from DB:', assessments?.map(a => ({ 
        id: a.id, 
        symptom_type: a.symptom_type, 
        score: a.overall_score,
        completed_at: a.completed_at 
      })));

      // Deduplicate: keep only the most recent assessment for each symptom_type
      // Data is already ordered by completed_at DESC, so first occurrence is most recent
      const seenTypes = new Set<string>();
      const uniqueAssessments = assessments?.filter((assessment) => {
        if (seenTypes.has(assessment.symptom_type)) {
          console.log('Filtering out duplicate:', assessment.symptom_type, assessment.id);
          return false;
        }
        seenTypes.add(assessment.symptom_type);
        return true;
      }) || [];

      console.log('After deduplication:', uniqueAssessments?.map(a => ({ 
        id: a.id, 
        symptom_type: a.symptom_type, 
        score: a.overall_score 
      })));

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
      'energy': 'Energy & Fatigue',
      'brain-fog': 'Brain Fog',
      'brain-brain-fog-assessment': 'Brain Fog',
      'cognitive-function': 'Cognitive Function',
      'memory': 'Memory Issues',
      'mood': 'Mood & Mental Health',
      'anxiety': 'Anxiety',
      'depression': 'Depression',
      'stress': 'Stress Management',
      'digestion': 'Digestive Health',
      'skin': 'Skin Health',
      'weight': 'Weight Management',
      'pain': 'Pain Management',
      'hormones': 'Hormonal Health'
    };
    return nameMap[symptomId] || symptomId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
                      Combining symptom assessments and daily health tracking for complete insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {/* Overview Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-primary/5 rounded-lg">
                          <div className="text-2xl font-bold text-primary mb-2">
                            {getOverallSymptomAnalysis().score}/100
                          </div>
                          <div className="text-sm text-muted-foreground">Symptom Score</div>
                        </div>
                        <div className="text-center p-6 bg-secondary/5 rounded-lg">
                          <div className="text-2xl font-bold text-secondary mb-2">
                            {lisData.length > 0 ? Math.round(lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length) : 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">Avg LIS (30d)</div>
                        </div>
                        <div className="text-center p-6 bg-accent/5 rounded-lg">
                          <div className="text-2xl font-bold text-accent mb-2">
                            {symptomAssessments.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Assessments</div>
                        </div>
                        <div className="text-center p-6 bg-green-500/5 rounded-lg">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {lisData.length}
                          </div>
                          <div className="text-sm text-muted-foreground">Days Tracked</div>
                        </div>
                      </div>

                      {/* LIS Pillar Analysis */}
                      {lisData.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-primary">Daily Health Tracking (Pillar Scores)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                <h4 className="font-semibold">Brain</h4>
                              </div>
                              <div className="text-2xl font-bold text-purple-500">
                                {Math.round(lisData.reduce((sum, d) => sum + (d.cognitive_engagement_score || 0), 0) / lisData.filter(d => d.cognitive_engagement_score).length) || 'N/A'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Cognitive engagement</p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Activity className="h-5 w-5 text-blue-500" />
                                <h4 className="font-semibold">Body</h4>
                              </div>
                              <div className="text-2xl font-bold text-blue-500">
                                {Math.round(lisData.reduce((sum, d) => sum + (d.physical_activity_score || 0), 0) / lisData.filter(d => d.physical_activity_score).length) || 'N/A'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Physical activity</p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Heart className="h-5 w-5 text-green-500" />
                                <h4 className="font-semibold">Balance</h4>
                              </div>
                              <div className="text-2xl font-bold text-green-500">
                                {Math.round(lisData.reduce((sum, d) => sum + (d.sleep_score || 0), 0) / lisData.filter(d => d.sleep_score).length) || 'N/A'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Sleep & stress</p>
                            </div>
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Users className="h-5 w-5 text-pink-500" />
                                <h4 className="font-semibold">Beauty</h4>
                              </div>
                              <div className="text-2xl font-bold text-pink-500">
                                {Math.round(lisData.reduce((sum, d) => sum + (d.nutrition_score || 0), 0) / lisData.filter(d => d.nutrition_score).length) || 'N/A'}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">Nutrition & wellness</p>
                            </div>
                          </div>
                          
                          {/* Biological Age Impact */}
                          <div className="border rounded-lg p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-lg font-semibold mb-1">Biological Age Impact</h4>
                                <p className="text-sm text-muted-foreground">Based on your daily health habits</p>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold text-primary">
                                  {lisData[0]?.biological_age_impact > 0 ? '+' : ''}{lisData[0]?.biological_age_impact?.toFixed(1) || 'N/A'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">years</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Symptom Assessment Analysis */}
                      {symptomAssessments.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-semibold text-primary">Symptom Assessment Analysis</h3>
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
                      )}

                      {/* Comprehensive Summary */}
                      <div className="border-t pt-6">
                        <h3 className="text-xl font-semibold text-primary mb-4">Comprehensive Health Summary</h3>
                        <div className="prose max-w-none">
                          <p className="text-muted-foreground">
                            {lisData.length > 0 && symptomAssessments.length > 0 ? (
                              <>Your health analysis combines {lisData.length} days of daily health tracking with {symptomAssessments.length} symptom assessment{symptomAssessments.length > 1 ? 's' : ''}. 
                              Your average Longevity Impact Score of {Math.round(lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length)} 
                              {lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length >= 100 ? ' indicates positive health habits' : ' suggests areas for improvement'}. 
                              Combined with your symptom assessment score of {getOverallSymptomAnalysis().score}/100, this provides a comprehensive view of your current health status and trajectory.</>
                            ) : lisData.length > 0 ? (
                              <>You have {lisData.length} days of daily health tracking data with an average LIS of {Math.round(lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length)}. 
                              Complete symptom assessments to get a more comprehensive health analysis.</>
                            ) : symptomAssessments.length > 0 ? (
                              <>You have completed {symptomAssessments.length} symptom assessment{symptomAssessments.length > 1 ? 's' : ''} with an overall score of {getOverallSymptomAnalysis().score}/100. 
                              Start tracking daily health metrics to see your complete health picture.</>
                            ) : (
                              <>Complete symptom assessments and track daily health metrics to see your comprehensive health analysis here.</>
                            )}
                          </p>
                        </div>
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

              {/* Medical Consultation Package */}
              {selectedReport === 'medical-consultation' && (
                <Card>
                  <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                    <div className="text-center space-y-2">
                      <CardTitle className="text-3xl font-bold text-primary">Medical Consultation Package</CardTitle>
                      <CardDescription className="text-base">
                        Comprehensive health report for healthcare professionals
                      </CardDescription>
                      <div className="text-sm text-muted-foreground pt-2">
                        Generated on {format(new Date(), 'MMMM d, yyyy')} | Tracking Period: Last 30 days
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      {/* Executive Summary */}
                      <div className="border-l-4 border-primary pl-6 py-4 bg-primary/5">
                        <h3 className="text-xl font-bold text-primary mb-4">Executive Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Overall Health Score</div>
                            <div className="text-3xl font-bold text-primary">{getOverallSymptomAnalysis().score}/100</div>
                            <div className="text-sm text-secondary mt-1">{getOverallSymptomAnalysis().status}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Longevity Impact Score (30d avg)</div>
                            <div className="text-3xl font-bold text-secondary">
                              {lisData.length > 0 ? Math.round(lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length) : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{lisData.length} days tracked</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Biological Age Impact</div>
                            <div className="text-3xl font-bold text-accent">
                              {lisData[0]?.biological_age_impact ? `${lisData[0].biological_age_impact > 0 ? '+' : ''}${lisData[0].biological_age_impact.toFixed(1)}` : 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">years from chronological age</div>
                          </div>
                        </div>
                      </div>

                      {/* Clinical Assessment Summary */}
                      <div>
                        <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary/20">
                          Clinical Assessment Summary
                        </h3>
                        <div className="space-y-6">
                          {symptomAssessments.length > 0 ? (
                            symptomAssessments.map((assessment, index) => (
                              <div key={assessment.id} className="border rounded-lg p-6 bg-card">
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-2xl font-bold text-primary">{index + 1}.</span>
                                      <h4 className="text-lg font-bold">{getSymptomName(assessment.symptom_type)}</h4>
                                    </div>
                                    <div className="flex items-center gap-4 ml-8">
                                      <div>
                                        <span className="text-sm text-muted-foreground">Assessment Score: </span>
                                        <span className="text-xl font-bold text-primary">{assessment.overall_score}/100</span>
                                      </div>
                                      <Badge variant={
                                        assessment.score_category === 'excellent' ? 'default' :
                                        assessment.score_category === 'good' ? 'secondary' :
                                        assessment.score_category === 'fair' ? 'outline' : 'destructive'
                                      }>
                                        {assessment.score_category.toUpperCase()}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground">
                                    Assessed: {format(new Date(assessment.completed_at), 'MMM d, yyyy')}
                                  </div>
                                </div>

                                {/* Detail Scores */}
                                {assessment.detail_scores && (
                                  <div className="mb-4 ml-8">
                                    <h5 className="text-sm font-semibold text-muted-foreground mb-2">Detailed Metrics:</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {Object.entries(assessment.detail_scores).map(([key, value]) => (
                                        <div key={key} className="bg-muted/30 p-3 rounded">
                                          <div className="text-xs text-muted-foreground capitalize">
                                            {key.replace(/_/g, ' ')}
                                          </div>
                                          <div className="text-lg font-bold">{String(value)}/100</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Primary Issues */}
                                {assessment.primary_issues && assessment.primary_issues.length > 0 && (
                                  <div className="mb-4 ml-8">
                                    <h5 className="text-sm font-semibold text-muted-foreground mb-2">Primary Concerns:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {assessment.primary_issues
                                        .filter((issue: string) => 
                                          issue && 
                                          !issue.toLowerCase().includes('assessment') && 
                                          !issue.toLowerCase().includes('completed')
                                        )
                                        .map((issue: string, idx: number) => (
                                          <Badge key={idx} variant="outline" className="text-xs">
                                            {issue.replace(/_/g, ' ')}
                                          </Badge>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Clinical Recommendations */}
                                <div className="ml-8 space-y-3">
                                  <h5 className="text-sm font-semibold text-muted-foreground">Clinical Recommendations:</h5>
                                  
                                  {assessment.recommendations?.immediate && assessment.recommendations.immediate.length > 0 && (
                                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded">
                                      <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">IMMEDIATE ACTIONS:</div>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        {assessment.recommendations.immediate.map((rec: string, idx: number) => (
                                          <li key={idx} className="text-red-900 dark:text-red-300">{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {assessment.recommendations?.lifestyle && assessment.recommendations.lifestyle.length > 0 && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                                      <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">LIFESTYLE MODIFICATIONS:</div>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        {assessment.recommendations.lifestyle.map((rec: string, idx: number) => (
                                          <li key={idx} className="text-blue-900 dark:text-blue-300">{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {assessment.recommendations?.professional && assessment.recommendations.professional.length > 0 && (
                                    <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded">
                                      <div className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">SPECIALIST REFERRALS:</div>
                                      <ul className="list-disc list-inside space-y-1 text-sm">
                                        {assessment.recommendations.professional.map((rec: string, idx: number) => (
                                          <li key={idx} className="text-purple-900 dark:text-purple-300">{rec}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center p-8 bg-muted/20 rounded-lg">
                              <p className="text-muted-foreground">No symptom assessments completed yet.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Daily Health Metrics */}
                      {lisData.length > 0 && (
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-4 pb-2 border-b-2 border-primary/20">
                            Daily Health Metrics & Lifestyle Analysis
                          </h3>
                          <div className="space-y-6">
                            {/* Four Pillars Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="border-2 border-purple-200 dark:border-purple-800 rounded-lg p-5 bg-purple-50/50 dark:bg-purple-950/20">
                                <div className="flex items-center gap-3 mb-3">
                                  <Brain className="h-6 w-6 text-purple-600" />
                                  <h4 className="text-lg font-bold">Brain (Cognitive Health)</h4>
                                </div>
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                  {Math.round(lisData.reduce((sum, d) => sum + (d.cognitive_engagement_score || 0), 0) / lisData.filter(d => d.cognitive_engagement_score).length) || 'N/A'}
                                  <span className="text-lg text-muted-foreground">/100</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Based on learning activities, cognitive engagement, and mental stimulation
                                </div>
                              </div>

                              <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg p-5 bg-blue-50/50 dark:bg-blue-950/20">
                                <div className="flex items-center gap-3 mb-3">
                                  <Activity className="h-6 w-6 text-blue-600" />
                                  <h4 className="text-lg font-bold">Body (Physical Activity)</h4>
                                </div>
                                <div className="text-3xl font-bold text-blue-600 mb-2">
                                  {Math.round(lisData.reduce((sum, d) => sum + (d.physical_activity_score || 0), 0) / lisData.filter(d => d.physical_activity_score).length) || 'N/A'}
                                  <span className="text-lg text-muted-foreground">/100</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Based on steps, activity intensity, and exercise duration
                                </div>
                              </div>

                              <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-5 bg-green-50/50 dark:bg-green-950/20">
                                <div className="flex items-center gap-3 mb-3">
                                  <Heart className="h-6 w-6 text-green-600" />
                                  <h4 className="text-lg font-bold">Balance (Sleep & Stress)</h4>
                                </div>
                                <div className="text-3xl font-bold text-green-600 mb-2">
                                  {Math.round(lisData.reduce((sum, d) => sum + (d.sleep_score || 0), 0) / lisData.filter(d => d.sleep_score).length) || 'N/A'}
                                  <span className="text-lg text-muted-foreground">/100</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Based on sleep quality, duration, and stress management
                                </div>
                              </div>

                              <div className="border-2 border-pink-200 dark:border-pink-800 rounded-lg p-5 bg-pink-50/50 dark:bg-pink-950/20">
                                <div className="flex items-center gap-3 mb-3">
                                  <Users className="h-6 w-6 text-pink-600" />
                                  <h4 className="text-lg font-bold">Beauty (Nutrition)</h4>
                                </div>
                                <div className="text-3xl font-bold text-pink-600 mb-2">
                                  {Math.round(lisData.reduce((sum, d) => sum + (d.nutrition_score || 0), 0) / lisData.filter(d => d.nutrition_score).length) || 'N/A'}
                                  <span className="text-lg text-muted-foreground">/100</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Based on meal quality and nutritional balance
                                </div>
                              </div>
                            </div>

                            {/* Key Metrics Table */}
                            <div className="border rounded-lg overflow-hidden">
                              <h4 className="text-lg font-bold p-4 bg-muted border-b">Comprehensive Health Metrics Overview</h4>
                              <table className="w-full">
                                <thead className="bg-muted">
                                  <tr>
                                    <th className="text-left p-3 text-sm font-semibold">Metric Category</th>
                                    <th className="text-left p-3 text-sm font-semibold">Specific Metric</th>
                                    <th className="text-center p-3 text-sm font-semibold">30-Day Average</th>
                                    <th className="text-center p-3 text-sm font-semibold">Latest Value</th>
                                    <th className="text-center p-3 text-sm font-semibold">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {/* Sleep Metrics */}
                                  <tr className="bg-green-50/50 dark:bg-green-950/10">
                                    <td rowSpan={4} className="p-3 text-sm font-semibold border-r">Sleep & Recovery</td>
                                    <td className="p-3 text-sm">Total Sleep Duration</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {(lisData.reduce((sum, d) => sum + (d.total_sleep_hours || 0), 0) / lisData.filter(d => d.total_sleep_hours).length).toFixed(1)}h
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.total_sleep_hours?.toFixed(1) || 'N/A'}h</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.total_sleep_hours >= 7 ? '✓ Optimal' : '⚠ Below target'}
                                    </td>
                                  </tr>
                                  <tr className="bg-green-50/50 dark:bg-green-950/10">
                                    <td className="p-3 text-sm">Deep Sleep</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {(lisData.reduce((sum, d) => sum + (d.deep_sleep_hours || 0), 0) / lisData.filter(d => d.deep_sleep_hours).length).toFixed(1)}h
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.deep_sleep_hours?.toFixed(1) || 'N/A'}h</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.deep_sleep_hours >= 1.5 ? '✓ Good' : '⚠ Low'}
                                    </td>
                                  </tr>
                                  <tr className="bg-green-50/50 dark:bg-green-950/10">
                                    <td className="p-3 text-sm">REM Sleep</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {(lisData.reduce((sum, d) => sum + (d.rem_hours || 0), 0) / lisData.filter(d => d.rem_hours).length).toFixed(1)}h
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.rem_hours?.toFixed(1) || 'N/A'}h</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.rem_hours >= 1.5 ? '✓ Good' : '⚠ Low'}
                                    </td>
                                  </tr>
                                  <tr className="bg-green-50/50 dark:bg-green-950/10">
                                    <td className="p-3 text-sm">Sleep Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.sleep_score || 0), 0) / lisData.filter(d => d.sleep_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.sleep_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.sleep_score >= 80 ? '✓ Excellent' : lisData[0]?.sleep_score >= 60 ? '○ Fair' : '⚠ Poor'}
                                    </td>
                                  </tr>

                                  {/* Physical Activity Metrics */}
                                  <tr className="bg-blue-50/50 dark:bg-blue-950/10">
                                    <td rowSpan={4} className="p-3 text-sm font-semibold border-r">Physical Activity</td>
                                    <td className="p-3 text-sm">Daily Steps</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.steps || 0), 0) / lisData.filter(d => d.steps).length).toLocaleString()}
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.steps?.toLocaleString() || 'N/A'}</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.steps >= 10000 ? '✓ Excellent' : lisData[0]?.steps >= 7000 ? '○ Good' : '⚠ Below target'}
                                    </td>
                                  </tr>
                                  <tr className="bg-blue-50/50 dark:bg-blue-950/10">
                                    <td className="p-3 text-sm">Active Minutes</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.active_minutes || 0), 0) / lisData.filter(d => d.active_minutes).length)}min
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.active_minutes || 'N/A'}min</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.active_minutes >= 30 ? '✓ Target met' : '⚠ Below target'}
                                    </td>
                                  </tr>
                                  <tr className="bg-blue-50/50 dark:bg-blue-950/10">
                                    <td className="p-3 text-sm">Activity Intensity</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {(lisData.reduce((sum, d) => sum + (d.activity_intensity || 0), 0) / lisData.filter(d => d.activity_intensity).length).toFixed(1)}
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.activity_intensity?.toFixed(1) || 'N/A'}</td>
                                    <td className="p-3 text-sm text-center">○ Tracked</td>
                                  </tr>
                                  <tr className="bg-blue-50/50 dark:bg-blue-950/10">
                                    <td className="p-3 text-sm">Physical Activity Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.physical_activity_score || 0), 0) / lisData.filter(d => d.physical_activity_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.physical_activity_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.physical_activity_score >= 80 ? '✓ Excellent' : lisData[0]?.physical_activity_score >= 60 ? '○ Fair' : '⚠ Poor'}
                                    </td>
                                  </tr>

                                  {/* Cardiovascular & Stress Metrics */}
                                  <tr className="bg-red-50/50 dark:bg-red-950/10">
                                    <td rowSpan={3} className="p-3 text-sm font-semibold border-r">Cardiovascular & Stress</td>
                                    <td className="p-3 text-sm">Heart Rate Variability (HRV)</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.hrv || 0), 0) / lisData.filter(d => d.hrv).length) || 'N/A'}ms
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.hrv || 'N/A'}ms</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.hrv >= 50 ? '✓ Good' : '⚠ Low'}
                                    </td>
                                  </tr>
                                  <tr className="bg-red-50/50 dark:bg-red-950/10">
                                    <td className="p-3 text-sm">Stress Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.stress_score || 0), 0) / lisData.filter(d => d.stress_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.stress_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.stress_score <= 30 ? '✓ Low' : lisData[0]?.stress_score <= 60 ? '○ Moderate' : '⚠ High'}
                                    </td>
                                  </tr>
                                  <tr className="bg-red-50/50 dark:bg-red-950/10">
                                    <td className="p-3 text-sm">Self-Reported Stress</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.self_reported_stress || 0), 0) / lisData.filter(d => d.self_reported_stress).length) || 'N/A'}/10
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.self_reported_stress || 'N/A'}/10</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.self_reported_stress <= 3 ? '✓ Low' : lisData[0]?.self_reported_stress <= 6 ? '○ Moderate' : '⚠ High'}
                                    </td>
                                  </tr>

                                  {/* Nutrition Metrics */}
                                  <tr className="bg-pink-50/50 dark:bg-pink-950/10">
                                    <td rowSpan={3} className="p-3 text-sm font-semibold border-r">Nutrition</td>
                                    <td className="p-3 text-sm">Meal Quality</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {(lisData.reduce((sum, d) => sum + (d.meal_quality || 0), 0) / lisData.filter(d => d.meal_quality).length).toFixed(1)}
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.meal_quality?.toFixed(1) || 'N/A'}</td>
                                    <td className="p-3 text-sm text-center">○ Tracked</td>
                                  </tr>
                                  <tr className="bg-pink-50/50 dark:bg-pink-950/10">
                                    <td className="p-3 text-sm">Nutritional Grade</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {lisData[0]?.nutritional_grade || 'Not graded'}
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.nutritional_grade || 'N/A'}</td>
                                    <td className="p-3 text-sm text-center">○ Tracked</td>
                                  </tr>
                                  <tr className="bg-pink-50/50 dark:bg-pink-950/10">
                                    <td className="p-3 text-sm">Nutrition Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.nutrition_score || 0), 0) / lisData.filter(d => d.nutrition_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.nutrition_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.nutrition_score >= 80 ? '✓ Excellent' : lisData[0]?.nutrition_score >= 60 ? '○ Fair' : '⚠ Poor'}
                                    </td>
                                  </tr>

                                  {/* Cognitive & Social Metrics */}
                                  <tr className="bg-purple-50/50 dark:bg-purple-950/10">
                                    <td rowSpan={4} className="p-3 text-sm font-semibold border-r">Cognitive & Social</td>
                                    <td className="p-3 text-sm">Learning Minutes</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.learning_minutes || 0), 0) / lisData.filter(d => d.learning_minutes).length)}min
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.learning_minutes || 'N/A'}min</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.learning_minutes >= 30 ? '✓ Active' : '○ Tracked'}
                                    </td>
                                  </tr>
                                  <tr className="bg-purple-50/50 dark:bg-purple-950/10">
                                    <td className="p-3 text-sm">Cognitive Engagement Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.cognitive_engagement_score || 0), 0) / lisData.filter(d => d.cognitive_engagement_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.cognitive_engagement_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.cognitive_engagement_score >= 80 ? '✓ High' : '○ Moderate'}
                                    </td>
                                  </tr>
                                  <tr className="bg-purple-50/50 dark:bg-purple-950/10">
                                    <td className="p-3 text-sm">Social Time</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.social_time_minutes || 0), 0) / lisData.filter(d => d.social_time_minutes).length)}min
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.social_time_minutes || 'N/A'}min</td>
                                    <td className="p-3 text-sm text-center">○ Tracked</td>
                                  </tr>
                                  <tr className="bg-purple-50/50 dark:bg-purple-950/10">
                                    <td className="p-3 text-sm">Social Connections Score</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.social_connections_score || 0), 0) / lisData.filter(d => d.social_connections_score).length) || 'N/A'}/100
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.social_connections_score || 'N/A'}/100</td>
                                    <td className="p-3 text-sm text-center">○ Tracked</td>
                                  </tr>

                                  {/* Meditation & Mindfulness */}
                                  <tr className="bg-yellow-50/50 dark:bg-yellow-950/10">
                                    <td className="p-3 text-sm font-semibold border-r">Mindfulness</td>
                                    <td className="p-3 text-sm">Meditation Minutes</td>
                                    <td className="p-3 text-sm text-center font-medium">
                                      {Math.round(lisData.reduce((sum, d) => sum + (d.meditation_minutes || 0), 0) / lisData.filter(d => d.meditation_minutes).length)}min
                                    </td>
                                    <td className="p-3 text-sm text-center">{lisData[0]?.meditation_minutes || 'N/A'}min</td>
                                    <td className="p-3 text-sm text-center">
                                      {lisData[0]?.meditation_minutes >= 10 ? '✓ Active' : '○ Tracked'}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>

                            {/* LIS Trend Analysis */}
                            <div className="border rounded-lg p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                              <h4 className="text-lg font-bold mb-4">Longevity Impact Score (LIS) Trend Analysis</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground mb-1">30-Day Average</div>
                                  <div className="text-3xl font-bold text-primary">
                                    {Math.round(lisData.reduce((sum, d) => sum + (d.longevity_impact_score || 0), 0) / lisData.length)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground mb-1">Trend Direction</div>
                                  <div className="text-2xl font-bold text-secondary">
                                    {lisData[0]?.longevity_impact_score > lisData[lisData.length - 1]?.longevity_impact_score ? '↑ Improving' : '↓ Declining'}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-sm text-muted-foreground mb-1">Days Tracked</div>
                                  <div className="text-3xl font-bold text-accent">{lisData.length}</div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <strong>Clinical Note:</strong> LIS above 100 indicates positive longevity impact. Scores below 100 suggest areas requiring intervention.
                                Current trend shows {lisData[0]?.longevity_impact_score >= 100 ? 'positive health behaviors' : 'need for lifestyle modifications'}.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Clinical Notes Section */}
                      <div className="border-t-2 border-dashed pt-6">
                        <h3 className="text-xl font-bold text-primary mb-4">Healthcare Provider Notes</h3>
                        <div className="border rounded-lg p-6 bg-muted/20 min-h-[200px]">
                          <p className="text-sm text-muted-foreground italic">
                            This section is reserved for healthcare provider notes and observations during consultation.
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t pt-6 text-center text-sm text-muted-foreground">
                        <p>This report is generated for medical consultation purposes and should be reviewed by a qualified healthcare professional.</p>
                        <p className="mt-2">Report ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | Generated: {format(new Date(), 'PPpp')}</p>
                      </div>

                      <div className="flex justify-center gap-4">
                        <Button onClick={() => window.print()} size="lg">
                          <FileText className="h-4 w-4 mr-2" />
                          Print Medical Report
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
          
          {/* Bottom Return Button */}
          <div className="flex justify-center gap-4 mt-8">
            <Button 
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/today')} 
              size="lg"
            >
              Go Back
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;