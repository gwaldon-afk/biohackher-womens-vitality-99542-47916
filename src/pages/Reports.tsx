import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Download, TrendingUp, Crown, Lock, Activity, Heart, Moon, Brain, Users, Utensils, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

const Reports = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [reportType, setReportType] = useState("30-day");
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [symptomAssessments, setSymptomAssessments] = useState<any[]>([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchHistoricalData();
    fetchSymptomAssessments();
  }, []);

  const fetchSymptomAssessments = async () => {
    if (!user) return;
    
    setLoadingSymptoms(true);
    try {
      // Fetch all symptom assessments for comprehensive analysis
      const { data: assessments, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      // Get unique assessments by symptom type (most recent for each type)
      const uniqueAssessments = assessments?.reduce((acc: any[], current) => {
        if (!acc.find(item => item.symptom_type === current.symptom_type)) {
          acc.push(current);
        }
        return acc;
      }, []) || [];
      
      setSymptomAssessments(uniqueAssessments);
    } catch (error) {
      console.error('Error fetching symptom assessments:', error);
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const getSymptomName = (symptomId: string) => {
    const nameMap: Record<string, string> = {
      'brain-fog': 'Brain Fog',
      'brain-brain-fog-assessment': 'Brain Fog',
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

  const getPersonalizedInsights = () => {
    if (symptomAssessments.length === 0) return { 
      patterns: [], 
      aggregatedRecommendations: { lifestyle: [], nutrition: [], medical: [], other: [] }, 
      keyInsights: [] 
    };

    // Extract all primary issues across symptoms
    const allPrimaryIssues = symptomAssessments.flatMap(a => a.primary_issues || []);
    const issueFrequency = allPrimaryIssues.reduce((acc: Record<string, number>, issue: string) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Find common patterns (issues appearing in multiple symptoms)
    const patterns = Object.entries(issueFrequency)
      .filter(([_, count]) => (count as number) > 1)
      .map(([issue, count]) => ({ issue, count: count as number, affectedSymptoms: symptomAssessments.filter(a => a.primary_issues?.includes(issue)).map(a => getSymptomName(a.symptom_type)) }))
      .sort((a, b) => b.count - a.count);

    // Aggregate recommendations from all assessments
    const allRecommendations = symptomAssessments.flatMap(a => {
      if (!a.recommendations) return [];
      
      // Handle both object and array formats
      if (Array.isArray(a.recommendations)) {
        return a.recommendations;
      } else if (typeof a.recommendations === 'object') {
        return Object.values(a.recommendations).flat();
      }
      return [];
    });

    // Categorize recommendations
    const recommendationCategories = {
      lifestyle: allRecommendations.filter(r => typeof r === 'string' && (r.toLowerCase().includes('sleep') || r.toLowerCase().includes('exercise') || r.toLowerCase().includes('stress') || r.toLowerCase().includes('routine'))),
      nutrition: allRecommendations.filter(r => typeof r === 'string' && (r.toLowerCase().includes('diet') || r.toLowerCase().includes('nutrition') || r.toLowerCase().includes('food') || r.toLowerCase().includes('supplement'))),
      medical: allRecommendations.filter(r => typeof r === 'string' && (r.toLowerCase().includes('doctor') || r.toLowerCase().includes('specialist') || r.toLowerCase().includes('medical') || r.toLowerCase().includes('medication'))),
      other: allRecommendations.filter(r => typeof r === 'string' && !r.toLowerCase().match(/(sleep|exercise|stress|routine|diet|nutrition|food|supplement|doctor|specialist|medical|medication)/))
    };

    // Generate key insights based on actual data
    const keyInsights = [];
    
    if (patterns.length > 0) {
      keyInsights.push({
        type: 'pattern',
        title: 'Common Root Causes Identified',
        insight: `${patterns[0].issue} appears across ${patterns[0].count} different symptoms (${patterns[0].affectedSymptoms.join(', ')}), suggesting this may be a key area to address.`
      });
    }

    const poorSymptoms = symptomAssessments.filter(a => a.score_category === 'poor');
    const excellentSymptoms = symptomAssessments.filter(a => a.score_category === 'excellent');
    
    if (poorSymptoms.length > 0 && excellentSymptoms.length > 0) {
      keyInsights.push({
        type: 'contrast',
        title: 'Health Variation Analysis',
        insight: `While ${excellentSymptoms.map(a => getSymptomName(a.symptom_type)).join(' and ')} are well-managed, ${poorSymptoms.map(a => getSymptomName(a.symptom_type)).join(' and ')} need focused attention.`
      });
    }

    if (recommendationCategories.lifestyle.length > recommendationCategories.medical.length) {
      keyInsights.push({
        type: 'approach',
        title: 'Treatment Approach',
        insight: 'Your assessments suggest lifestyle interventions may be more beneficial than medical treatments for your current symptom profile.'
      });
    }

    return { 
      patterns, 
      aggregatedRecommendations: recommendationCategories, 
      keyInsights 
    };
  };

  const getOverallSymptomAnalysis = () => {
    if (symptomAssessments.length === 0) return {
      status: 'No Data',
      score: 0,
      analysis: 'Complete symptom assessments to get your comprehensive health profile.',
      breakdown: { excellent: 0, good: 0, fair: 0, poor: 0 }
    };

    const avgScore = symptomAssessments.reduce((sum, a) => sum + a.overall_score, 0) / symptomAssessments.length;
    const breakdown = {
      excellent: symptomAssessments.filter(a => a.score_category === 'excellent').length,
      good: symptomAssessments.filter(a => a.score_category === 'good').length,
      fair: symptomAssessments.filter(a => a.score_category === 'fair').length,
      poor: symptomAssessments.filter(a => a.score_category === 'poor').length
    };

    let status = '';
    let analysis = '';
    
    if (avgScore >= 80) {
      status = 'Excellent';
      analysis = `Outstanding symptom management across ${symptomAssessments.length} health areas. You're in the top tier for overall wellness with ${breakdown.excellent + breakdown.good} areas performing well.`;
    } else if (avgScore >= 65) {
      status = 'Good';
      analysis = `Strong overall health profile with ${breakdown.excellent + breakdown.good} areas performing well. ${breakdown.fair + breakdown.poor > 0 ? `Targeted improvement in ${breakdown.fair + breakdown.poor} area${breakdown.fair + breakdown.poor > 1 ? 's' : ''} could optimize your wellness further.` : ''}`;
    } else if (avgScore >= 50) {
      status = 'Fair';
      analysis = `Mixed symptom profile with opportunities for improvement. ${breakdown.excellent + breakdown.good} areas are stable, while ${breakdown.fair + breakdown.poor} areas need focused attention for optimal health.`;
    } else {
      status = 'Needs Attention';
      analysis = `Multiple symptom areas require immediate intervention. ${breakdown.poor} critical areas and ${breakdown.fair} moderate areas identified. Comprehensive health strategy recommended.`;
    }

    return { status, score: Math.round(avgScore), analysis, breakdown };
  };

  useEffect(() => {
    fetchHistoricalData();
  }, []);

  const fetchHistoricalData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your reports.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      setHistoricalData(data || []);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast({
        title: "Error",
        description: "Failed to load historical data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sampleMetrics = {
    biohackherAge: { current: 34, trend: -2 },
    sleepScore: { current: 78, trend: 5 },
    hrv: { current: 65, trend: 8 },
    proteinIntake: { current: 85, trend: 12 },
    symptomScore: { current: 25, trend: -15 }
  };

  const reportData = {
    "30-day": {
      title: "30-Day Longevity Report", 
      period: "March 2024",
      highlights: [
        "Biohackher Age improved by 2 years",
        "Sleep quality increased 15%", 
        "Hot flash frequency reduced 40%",
        "Protein targets met 85% of days"
      ],
      recommendations: [
        "Continue current sleep optimisation protocol",
        "Increase cold exposure frequency to 4x/week",
        "Add leucine supplementation to plant-based meals"
      ]
    },
    "90-day": {
      title: "90-Day Comprehensive Report",
      period: "Jan-Mar 2024", 
      highlights: [
        "Overall wellness score improved 32%",
        "Energy levels stabilized across cycle phases",
        "Reduced inflammatory markers by 25%",
        "Achieved target protein intake 80% of quarter"
      ],
      recommendations: [
        "Consider HRT consultation for symptom optimisation",
        "Implement structured strength training program",
        "Add targeted micronutrient testing"
      ]
    }
  };

  const currentReport = reportData[reportType as keyof typeof reportData];

  const generateReport = () => {
    // In real app, this would generate and download actual PDF
    const reportContent = `
BIOHACKHER LONGEVITY REPORT
${currentReport.title}
Period: ${currentReport.period}

EXECUTIVE SUMMARY
Your biohacking journey shows significant progress across multiple biomarkers.
Key improvements in sleep optimisation and symptom management protocols.

BIOHACKHER AGE ANALYSIS
Current Age: ${sampleMetrics.biohackherAge.current} years
Improvement: ${Math.abs(sampleMetrics.biohackherAge.trend)} years younger
Factors: Sleep quality, HRV training, nutrition optimisation

KEY METRICS SUMMARY
• Sleep Score: ${sampleMetrics.sleepScore.current}% (↑${sampleMetrics.sleepScore.trend}%)
• HRV: ${sampleMetrics.hrv.current}ms (↑${sampleMetrics.hrv.trend}%)  
• Protein Compliance: ${sampleMetrics.proteinIntake.current}% (↑${sampleMetrics.proteinIntake.trend}%)
• Symptom Score: ${sampleMetrics.symptomScore.current}/100 (↓${Math.abs(sampleMetrics.symptomScore.trend)}%)

HIGHLIGHTS
${currentReport.highlights.map(h => `• ${h}`).join('\n')}

RECOMMENDATIONS
${currentReport.recommendations.map(r => `• ${r}`).join('\n')}

PROTOCOLS COMPLETED
• Red Light Therapy: 24/30 sessions
• Cold Exposure: 18/30 sessions  
• HRV Breathwork: 28/30 sessions
• Sleep Optimisation: 27/30 nights

Generated by Biohackher - Women's Longevity Coach
Report ID: BH-${Date.now()}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-biohackher-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Comprehensive Health Profile</h1>
          <p className="text-muted-foreground">
            Complete analysis of your symptom assessments and longevity metrics
          </p>
        </div>

        {/* Comprehensive Symptom Assessment Overview */}
        <div className="mb-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Aggregated Symptom Assessment
              </CardTitle>
              <CardDescription>Comprehensive analysis across all your health areas</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSymptoms ? (
                <div className="text-center py-8 text-muted-foreground">Loading comprehensive assessment...</div>
              ) : (
                <div className="space-y-6">
                  {/* Overall Status */}
                  <div className="text-center p-6 bg-muted/30 rounded-lg">
                    <div className={`text-3xl font-bold mb-2 ${
                      getOverallSymptomAnalysis().status === 'Excellent' ? 'text-green-600' :
                      getOverallSymptomAnalysis().status === 'Good' ? 'text-blue-600' :
                      getOverallSymptomAnalysis().status === 'Fair' ? 'text-amber-600' :
                      'text-red-600'
                    }`}>
                      {getOverallSymptomAnalysis().status}
                    </div>
                    {getOverallSymptomAnalysis().score > 0 && (
                      <div className="text-xl font-semibold text-muted-foreground mb-4">
                        Overall Score: {getOverallSymptomAnalysis().score}/100
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      {getOverallSymptomAnalysis().analysis}
                    </p>
                  </div>

                  {/* Symptom Breakdown */}
                  {symptomAssessments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {getOverallSymptomAnalysis().breakdown.excellent > 0 && (
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600">{getOverallSymptomAnalysis().breakdown.excellent}</div>
                          <div className="text-sm text-green-700">Excellent Areas</div>
                        </div>
                      )}
                      {getOverallSymptomAnalysis().breakdown.good > 0 && (
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">{getOverallSymptomAnalysis().breakdown.good}</div>
                          <div className="text-sm text-blue-700">Good Areas</div>
                        </div>
                      )}
                      {getOverallSymptomAnalysis().breakdown.fair > 0 && (
                        <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="text-2xl font-bold text-amber-600">{getOverallSymptomAnalysis().breakdown.fair}</div>
                          <div className="text-sm text-amber-700">Fair Areas</div>
                        </div>
                      )}
                      {getOverallSymptomAnalysis().breakdown.poor > 0 && (
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-2xl font-bold text-red-600">{getOverallSymptomAnalysis().breakdown.poor}</div>
                          <div className="text-sm text-red-700">Areas Needing Attention</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Individual Symptom Details */}
                  {symptomAssessments.length > 0 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold mb-4">Individual Symptom Assessment Summary</h3>
                      <div className="space-y-3">
                        {symptomAssessments.map((assessment) => (
                          <div key={assessment.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${
                                assessment.score_category === 'excellent' ? 'bg-green-500' :
                                assessment.score_category === 'good' ? 'bg-blue-500' :
                                assessment.score_category === 'fair' ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}></div>
                              <div>
                                <div className="font-medium">{getSymptomName(assessment.symptom_type)}</div>
                                <div className="text-sm text-muted-foreground">
                                  Assessed {format(new Date(assessment.completed_at), 'dd/MM/yyyy')}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className={`${
                                assessment.score_category === 'excellent' ? 'border-green-500 text-green-600' :
                                assessment.score_category === 'good' ? 'border-blue-500 text-blue-600' :
                                assessment.score_category === 'fair' ? 'border-amber-500 text-amber-600' :
                                'border-red-500 text-red-600'
                              }`}>
                                {assessment.score_category}
                              </Badge>
                              <div className="text-sm font-medium">{Math.round(assessment.overall_score)}/100</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                      {/* Comprehensive Aggregated Analysis */}
                      {symptomAssessments.length > 0 && (
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold mb-4">Personalized Health Insights</h3>
                          
                          {/* Data-Driven Key Insights */}
                          {getPersonalizedInsights().keyInsights.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Key Findings from Your Assessments</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {getPersonalizedInsights().keyInsights.map((insight, index) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                      <div className="font-medium text-blue-800">{insight.title}</div>
                                      <div className="text-sm text-blue-700">{insight.insight}</div>
                                    </div>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}

                          {/* Common Root Cause Patterns */}
                          {getPersonalizedInsights().patterns.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Identified Health Patterns</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {getPersonalizedInsights().patterns.map((pattern, index) => (
                                  <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="font-medium text-amber-800 mb-1">
                                      Root Cause: {pattern.issue}
                                    </div>
                                    <div className="text-sm text-amber-700">
                                      Affects {pattern.count} symptoms: {pattern.affectedSymptoms.join(', ')}
                                    </div>
                                    <div className="text-xs text-amber-600 mt-2">
                                      Addressing this underlying issue could improve multiple symptoms simultaneously.
                                    </div>
                                  </div>
                                ))}
                              </CardContent>
                            </Card>
                          )}

                          {/* Aggregated Recommendations from Assessments */}
                          {Object.values(getPersonalizedInsights().aggregatedRecommendations).flat().length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Consolidated Recommendations</CardTitle>
                                <CardDescription>From your individual symptom assessments</CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {getPersonalizedInsights().aggregatedRecommendations.lifestyle.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-green-800 mb-2">Lifestyle Interventions</h4>
                                    <div className="space-y-2">
                                      {getPersonalizedInsights().aggregatedRecommendations.lifestyle.slice(0, 3).map((rec: any, index: number) => (
                                        <div key={index} className="text-sm text-green-700 p-2 bg-green-50 rounded border border-green-200">
                                          • {rec}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {getPersonalizedInsights().aggregatedRecommendations.nutrition.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-orange-800 mb-2">Nutritional Approaches</h4>
                                    <div className="space-y-2">
                                      {getPersonalizedInsights().aggregatedRecommendations.nutrition.slice(0, 3).map((rec: any, index: number) => (
                                        <div key={index} className="text-sm text-orange-700 p-2 bg-orange-50 rounded border border-orange-200">
                                          • {rec}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {getPersonalizedInsights().aggregatedRecommendations.medical.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-red-800 mb-2">Medical Considerations</h4>
                                    <div className="space-y-2">
                                      {getPersonalizedInsights().aggregatedRecommendations.medical.slice(0, 3).map((rec: any, index: number) => (
                                        <div key={index} className="text-sm text-red-700 p-2 bg-red-50 rounded border border-red-200">
                                          • {rec}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )}

                          {/* Priority Action Plan */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Prioritized Action Plan</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {getPersonalizedInsights().patterns.length > 0 && (
                                  <div className="flex items-center gap-3 p-3 bg-background rounded border">
                                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                                    <span className="text-sm">
                                      <strong>Priority 1:</strong> Address {getPersonalizedInsights().patterns[0].issue} - impacts {getPersonalizedInsights().patterns[0].count} symptoms
                                    </span>
                                  </div>
                                )}
                                {symptomAssessments.filter(a => a.score_category === 'poor').length > 0 && (
                                  <div className="flex items-center gap-3 p-3 bg-background rounded border">
                                    <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm">
                                      <strong>Priority 2:</strong> Focus on {symptomAssessments.filter(a => a.score_category === 'poor').map(a => getSymptomName(a.symptom_type)).join(', ')}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-3 p-3 bg-background rounded border">
                                  <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-sm">
                                    <strong>Priority 3:</strong> Reassess in 4-6 weeks to track improvement progress
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Symptom Assessment</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessment" className="space-y-6">
            {/* Symptom assessment content is already displayed above */}
            <div className="text-center text-muted-foreground">
              <p>Your comprehensive symptom assessment is displayed above.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="historical" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Report Configuration */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Generate Report</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Report Type</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="30-day">30-Day Report</option>
                        <option value="90-day">90-Day Comprehensive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Report Date</label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    
                    <Button 
                      onClick={generateReport}
                      className="w-full primary-gradient"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate PDF Report
                    </Button>
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Card className="border-secondary/20 bg-secondary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-secondary">
                      <Crown className="h-5 w-5" />
                      Premium Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Detailed biomarker analysis</span>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Physician-ready summaries</span>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trend predictions</span>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Upgrade for Premium Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

          {/* Historical Data Display */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Historical Data</CardTitle>
                <CardDescription>Detailed view of your past entries for investigation</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading your data...</div>
                ) : historicalData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No data found. Start tracking your daily metrics to see reports here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Accordion type="single" collapsible className="w-full">
                      {historicalData.map((entry, index) => (
                        <AccordionItem key={entry.id} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-4">
                                <span className="font-medium">
                                  {format(new Date(entry.date), 'dd/MM/yyyy')}
                                </span>
                                <Badge variant="outline" className={
                                  entry.color_code === 'green' ? 'border-green-500 text-green-600' :
                                  entry.color_code === 'yellow' ? 'border-yellow-500 text-yellow-600' :
                                  'border-red-500 text-red-600'
                                }>
                                  LIS: {entry.longevity_impact_score}
                                </Badge>
                              </div>
                              <span className={`text-sm font-medium ${
                                entry.biological_age_impact > 0 ? 'text-green-600' : 
                                entry.biological_age_impact < 0 ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {entry.biological_age_impact > 0 ? '-' : '+'}
                                {Math.abs(entry.biological_age_impact)} days
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                              {/* Sleep Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Moon className="h-4 w-4 text-blue-500" />
                                  <h4 className="font-semibold">Sleep Quality</h4>
                                  <Badge variant="secondary">{Math.round(entry.sleep_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>Total Sleep: {entry.total_sleep_hours}h</div>
                                  <div>REM Sleep: {entry.rem_hours}h</div>
                                  <div>Deep Sleep: {entry.deep_sleep_hours}h</div>
                                </div>
                              </div>

                              {/* Stress Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Heart className="h-4 w-4 text-red-500" />
                                  <h4 className="font-semibold">Stress</h4>
                                  <Badge variant="secondary">{Math.round(entry.stress_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>HRV: {entry.hrv}ms</div>
                                  <div>Stress Level: {entry.self_reported_stress}/10</div>
                                </div>
                              </div>

                              {/* Activity Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Activity className="h-4 w-4 text-green-500" />
                                  <h4 className="font-semibold">Activity</h4>
                                  <Badge variant="secondary">{Math.round(entry.physical_activity_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>Active Minutes: {entry.active_minutes}min</div>
                                  <div>Steps: {entry.steps?.toLocaleString()}</div>
                                  <div>Type: {entry.activity_type}</div>
                                  <div>Intensity: {entry.activity_intensity}/10</div>
                                </div>
                              </div>

                              {/* Nutrition Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Utensils className="h-4 w-4 text-orange-500" />
                                  <h4 className="font-semibold">Nutrition</h4>
                                  <Badge variant="secondary">{Math.round(entry.nutrition_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {entry.nutritional_detailed_score !== null ? (
                                    <>
                                      <div>Detailed Score: {entry.nutritional_detailed_score} ({entry.nutritional_grade})</div>
                                      <Badge variant="outline" className="text-xs">Detailed Tracking</Badge>
                                    </>
                                  ) : (
                                    <>
                                      <div>Meal Quality: {entry.meal_quality}/10</div>
                                      <Badge variant="outline" className="text-xs">Simple Tracking</Badge>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Social Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Users className="h-4 w-4 text-purple-500" />
                                  <h4 className="font-semibold">Social</h4>
                                  <Badge variant="secondary">{Math.round(entry.social_connections_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>Interaction Quality: {entry.social_interaction_quality}/10</div>
                                  <div>Social Time: {entry.social_time_minutes}min</div>
                                </div>
                              </div>

                              {/* Cognitive Data */}
                              <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 mb-3">
                                  <Brain className="h-4 w-4 text-indigo-500" />
                                  <h4 className="font-semibold">Cognitive</h4>
                                  <Badge variant="secondary">{Math.round(entry.cognitive_engagement_score || 0)}</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div>Meditation: {entry.meditation_minutes}min</div>
                                  <div>Learning: {entry.learning_minutes}min</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t">
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Input Method: {entry.input_mode || 'manual'}</span>
                                <span>Updated: {format(new Date(entry.updated_at), 'HH:mm on dd/MM/yyyy')}</span>
                              </div>
                            </div>
                          </AccordionContent>
                         </AccordionItem>
                       ))}
                     </Accordion>
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </div>
            </TabsContent>
          </Tabs>
      </main>
    </div>
  );
};

export default Reports;