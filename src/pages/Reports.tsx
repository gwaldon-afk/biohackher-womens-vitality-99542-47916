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
    setLoadingSymptoms(true);
    try {
      if (!user) {
        // Generate demo symptom assessments for comprehensive analysis
        generateDemoSymptomAssessments();
        return;
      }

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

      // If no real data, show demo data for comprehensive analysis
      if (uniqueAssessments.length === 0) {
        generateDemoSymptomAssessments();
        return;
      }

      setSymptomAssessments(uniqueAssessments);
    } catch (error) {
      console.error('Error fetching symptom assessments:', error);
      // Fallback to demo data on error
      generateDemoSymptomAssessments();
    } finally {
      setLoadingSymptoms(false);
    }
  };

  const generateDemoSymptomAssessments = () => {
    const demoAssessments = [
      {
        id: 'demo-sleep',
        user_id: 'demo-user',
        symptom_type: 'sleep',
        overall_score: 72,
        score_category: 'fair',
        primary_issues: ['difficulty_falling_asleep', 'frequent_waking'],
        recommendations: {
          immediate: ['Establish consistent bedtime routine', 'Limit screen time before bed'],
          lifestyle: ['Create optimal sleep environment', 'Consider magnesium supplementation'],
          professional: ['Sleep study if issues persist']
        },
        completed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        detail_scores: {
          sleep_quality: 65,
          sleep_duration: 70,
          sleep_consistency: 75,
          daytime_energy: 80
        }
      },
      {
        id: 'demo-stress',
        user_id: 'demo-user',
        symptom_type: 'stress',
        overall_score: 58,
        score_category: 'needs_attention',
        primary_issues: ['work_pressure', 'anxiety', 'tension'],
        recommendations: {
          immediate: ['Daily meditation practice', 'Deep breathing exercises'],
          lifestyle: ['Regular exercise routine', 'Stress management techniques'],
          professional: ['Consider counseling support']
        },
        completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        detail_scores: {
          emotional_regulation: 55,
          physical_tension: 60,
          mental_clarity: 65,
          resilience: 52
        }
      },
      {
        id: 'demo-energy',
        user_id: 'demo-user',
        symptom_type: 'energy',
        overall_score: 78,
        score_category: 'good',
        primary_issues: ['afternoon_crash'],
        recommendations: {
          immediate: ['Optimize meal timing', 'Stay hydrated'],
          lifestyle: ['Balanced nutrition', 'Regular movement breaks'],
          professional: ['Nutrient status testing']
        },
        completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        detail_scores: {
          morning_energy: 85,
          afternoon_energy: 65,
          evening_energy: 80,
          sustained_energy: 72
        }
      }
    ];
    
    setSymptomAssessments(demoAssessments);
    setLoadingSymptoms(false);
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

  const getPersonalizedAssessmentStatements = () => {
    if (symptomAssessments.length === 0) return {
      primaryStatement: "Your health journey is just beginning. Complete your first symptom assessment to unlock personalized insights and recommendations tailored specifically to your wellness goals.",
      secondaryStatements: [],
      actionStatement: "Take your first assessment to discover your unique health profile and receive targeted guidance for optimal wellbeing."
    };

    const avgScore = symptomAssessments.reduce((sum, a) => sum + a.overall_score, 0) / symptomAssessments.length;
    const poorSymptoms = symptomAssessments.filter(a => a.score_category === 'poor');
    const fairSymptoms = symptomAssessments.filter(a => a.score_category === 'fair');
    const goodSymptoms = symptomAssessments.filter(a => a.score_category === 'good');
    const excellentSymptoms = symptomAssessments.filter(a => a.score_category === 'excellent');

    // Extract common primary issues for pattern analysis
    const allPrimaryIssues = symptomAssessments.flatMap(a => a.primary_issues || []);
    const issueFrequency = allPrimaryIssues.reduce((acc: Record<string, number>, issue: string) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const commonIssues = Object.entries(issueFrequency)
      .filter(([_, count]: [string, number]) => count > 1)
      .sort(([,a]: [string, number], [,b]: [string, number]) => b - a)
      .slice(0, 2);

    let primaryStatement = "";
    let secondaryStatements: string[] = [];
    let actionStatement = "";

    // Generate primary assessment statement
    if (avgScore >= 80) {
      primaryStatement = `Your health profile demonstrates exceptional symptom management across ${symptomAssessments.length} key areas, with an overall wellness score of ${Math.round(avgScore)}/100. This places you in the top tier of health optimization, indicating that your current lifestyle and health strategies are highly effective.`;
      
      if (excellentSymptoms.length > 0) {
        secondaryStatements.push(`Your ${excellentSymptoms.map(a => getSymptomName(a.symptom_type)).join(', ')} management is exemplary, serving as a strong foundation for your overall wellness.`);
      }
      
      actionStatement = "Continue your successful health practices and consider sharing your strategies with others. Focus on maintaining these excellent results through consistent routines.";
    } else if (avgScore >= 65) {
      primaryStatement = `Your health profile shows strong overall wellness with a score of ${Math.round(avgScore)}/100 across ${symptomAssessments.length} assessed areas. You have ${excellentSymptoms.length + goodSymptoms.length} areas performing well, indicating effective health management strategies in place.`;
      
      if (poorSymptoms.length + fairSymptoms.length > 0) {
        const concerningAreas = [...poorSymptoms, ...fairSymptoms].map(a => getSymptomName(a.symptom_type));
        secondaryStatements.push(`While your foundation is solid, ${concerningAreas.join(', ')} ${concerningAreas.length === 1 ? 'requires' : 'require'} targeted attention to optimize your overall wellbeing.`);
      }
      
      if (commonIssues.length > 0) {
        secondaryStatements.push(`Analysis reveals that ${commonIssues[0][0]} appears as a common factor across multiple symptoms, suggesting this may be a key leverage point for improvement.`);
      }
      
      actionStatement = `Focus on addressing ${poorSymptoms.length + fairSymptoms.length} area${poorSymptoms.length + fairSymptoms.length > 1 ? 's' : ''} while maintaining your current successful strategies.`;
    } else if (avgScore >= 50) {
      primaryStatement = `Your health profile presents a mixed picture with a wellness score of ${Math.round(avgScore)}/100, indicating both areas of strength and opportunities for significant improvement across ${symptomAssessments.length} assessed domains.`;
      
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
        // Generate demo data for comprehensive analysis
        generateDemoData();
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

      // If no real data, show demo data for comprehensive analysis
      if (!data || data.length === 0) {
        generateDemoData();
        return;
      }

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

  const generateDemoData = () => {
    // Generate realistic demo data for the past 30 days
    const demoData = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      demoData.push({
        id: `demo-${i}`,
        user_id: 'demo-user',
        date: date.toISOString().split('T')[0],
        longevity_impact_score: 85 + Math.random() * 30, // 85-115 range
        biological_age_impact: -0.5 + (Math.random() * 2), // -0.5 to 1.5
        steps: 8000 + Math.random() * 4000,
        sleep_score: 70 + Math.random() * 30,
        stress_score: 20 + Math.random() * 60,
        nutrition_score: 75 + Math.random() * 25,
        physical_activity_score: 80 + Math.random() * 20,
        social_connections_score: 70 + Math.random() * 30,
        cognitive_engagement_score: 85 + Math.random() * 15,
        color_code: Math.random() > 0.7 ? 'red' : Math.random() > 0.4 ? 'yellow' : 'green',
        total_sleep_hours: 6.5 + Math.random() * 2,
        deep_sleep_hours: 1.2 + Math.random() * 0.8,
        rem_hours: 1.5 + Math.random() * 0.7,
        hrv: 25 + Math.random() * 40,
        self_reported_stress: 1 + Math.random() * 8,
        active_minutes: 45 + Math.random() * 75,
        created_at: date.toISOString(),
        updated_at: date.toISOString()
      });
    }
    
    setHistoricalData(demoData);
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
Current Biohackher Age: ${sampleMetrics.biohackherAge.current} years
Improvement: ${Math.abs(sampleMetrics.biohackherAge.trend)} years younger
Status: ${sampleMetrics.biohackherAge.trend < 0 ? 'Improving' : 'Declining'}

SLEEP OPTIMISATION
Sleep Score: ${sampleMetrics.sleepScore.current}/100
30-day trend: ${sampleMetrics.sleepScore.trend > 0 ? '+' : ''}${sampleMetrics.sleepScore.trend}%
Quality: ${sampleMetrics.sleepScore.current > 80 ? 'Excellent' : sampleMetrics.sleepScore.current > 60 ? 'Good' : 'Needs Improvement'}

HEART RATE VARIABILITY
Current HRV: ${sampleMetrics.hrv.current}ms
Trend: ${sampleMetrics.hrv.trend > 0 ? '+' : ''}${sampleMetrics.hrv.trend}ms
Recovery Status: ${sampleMetrics.hrv.current > 60 ? 'Optimal' : 'Monitor'}

NUTRITION PERFORMANCE
Protein Target Achievement: ${sampleMetrics.proteinIntake.current}%
30-day improvement: ${sampleMetrics.proteinIntake.trend > 0 ? '+' : ''}${sampleMetrics.proteinIntake.trend}%

SYMPTOM MANAGEMENT
Overall Symptom Score: ${sampleMetrics.symptomScore.current}/100 (lower is better)
Improvement: ${Math.abs(sampleMetrics.symptomScore.trend)} points
Trend: ${sampleMetrics.symptomScore.trend < 0 ? 'Significant Improvement' : 'Monitor'}

KEY HIGHLIGHTS
${currentReport.highlights.map(h => `• ${h}`).join('\n')}

RECOMMENDATIONS
${currentReport.recommendations.map(r => `• ${r}`).join('\n')}

NEXT STEPS
1. Continue tracking key biomarkers daily
2. Review protocol effectiveness in 30 days  
3. Consider advanced testing for further optimisation

Generated on: ${new Date().toLocaleDateString()}
    `;

    // Create and download PDF-like text file
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biohackher-report-${reportType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: `Your ${reportType} report has been downloaded successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-primary">Health Reports</h1>
            <p className="text-xl text-muted-foreground">
              Comprehensive analysis of your biohacking journey and symptom management
            </p>
          </div>

          {/* Symptom Assessment Overview */}
          {!loadingSymptoms && symptomAssessments.length > 0 && (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <h2 className="text-2xl font-bold text-primary">Your Health Overview</h2>
                  
                  {/* Score Display */}
                  {getOverallSymptomAnalysis().score > 0 && (
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        Overall Score: {getOverallSymptomAnalysis().score}/100
                      </div>
                    </div>
                  )}
                  
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
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                      {getOverallSymptomAnalysis().analysis}
                    </p>
                  </div>

                  {/* Symptoms Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600">{getOverallSymptomAnalysis().breakdown.excellent}</div>
                      <div className="text-xs text-green-600">Excellent</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="text-2xl font-bold text-blue-600">{getOverallSymptomAnalysis().breakdown.good}</div>
                      <div className="text-xs text-blue-600">Good</div>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="text-2xl font-bold text-amber-600">{getOverallSymptomAnalysis().breakdown.fair}</div>
                      <div className="text-xs text-amber-600">Fair</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-2xl font-bold text-red-600">{getOverallSymptomAnalysis().breakdown.poor}</div>
                      <div className="text-xs text-red-600">Needs Attention</div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Button variant="outline" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Trends
                    </Button>
                    <Button variant="outline" size="sm">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Priority Actions
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Success Strategies
                    </Button>
                  </div>

                  {/* Personalized Insights Section */}
                  {getPersonalizedInsights().keyInsights.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">Key Health Insights</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getPersonalizedInsights().keyInsights.map((insight, index) => (
                          <Card key={index} className="text-left">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0"></div>
                                <div>
                                  <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.insight}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pattern Analysis */}
                  {getPersonalizedInsights().patterns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">Common Patterns Identified</h3>
                      <div className="space-y-3">
                        {getPersonalizedInsights().patterns.slice(0, 3).map((pattern, index) => (
                          <div key={index} className="flex items-center gap-4 p-4 bg-background/80 rounded-lg border">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{pattern.count}</span>
                            </div>
                            <div className="flex-1 text-left">
                              <div className="font-medium text-sm">{pattern.issue}</div>
                              <div className="text-xs text-muted-foreground">
                                Affects: {pattern.affectedSymptoms.join(', ')}
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Priorities */}
                  {symptomAssessments.filter(a => a.score_category === 'poor' || a.score_category === 'fair').length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-primary">Recommended Action Priorities</h3>
                      <div className="space-y-3">
                        {symptomAssessments.filter(a => a.score_category === 'poor').length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                            <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm">
                              <strong>Priority 1:</strong> Address {symptomAssessments.filter(a => a.score_category === 'poor').map(a => getSymptomName(a.symptom_type)).join(', ')} immediately
                            </span>
                          </div>
                        )}
                        {symptomAssessments.filter(a => a.score_category === 'fair').length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                            <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                            <span className="text-sm">
                              <strong>Priority 2:</strong> Focus on {symptomAssessments.filter(a => a.score_category === 'fair').map(a => getSymptomName(a.symptom_type)).join(', ')}
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        <Tabs defaultValue="assessment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="assessment">Symptom Assessment</TabsTrigger>
            <TabsTrigger value="historical">Historical Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessment" className="space-y-6">
            {/* Personalized Assessment Statements */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Primary Assessment Statement */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-primary mb-4">Your Personalized Health Assessment</h3>
                    <p className="text-base text-muted-foreground leading-relaxed mb-4">
                      {getPersonalizedAssessmentStatements().primaryStatement}
                    </p>
                  </div>

                  {/* Secondary Assessment Insights */}
                  {getPersonalizedAssessmentStatements().secondaryStatements.length > 0 && (
                    <div className="space-y-3">
                      {getPersonalizedAssessmentStatements().secondaryStatements.map((statement, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border border-primary/10">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {statement}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Statement */}
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-semibold text-primary mb-2">Recommended Focus</h4>
                        <p className="text-sm text-primary/80 leading-relaxed">
                          {getPersonalizedAssessmentStatements().actionStatement}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                                <span>Updated: {format(new Date(entry.updated_at), "HH:mm 'on' dd/MM/yyyy")}</span>
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
        </div>
      </main>
    </div>
 );
};

export default Reports;