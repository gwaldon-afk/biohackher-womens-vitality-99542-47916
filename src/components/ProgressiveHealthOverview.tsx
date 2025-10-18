import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useUserStore } from '@/stores/userStore';
import { HealthRadarChart } from './HealthRadarChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SymptomAssessment } from '@/types/assessments';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProgressiveHealthOverviewProps {
  assessments: SymptomAssessment[];
  totalInFlow?: number;
  onContinueToNext?: () => void;
  onViewFullAnalysis?: () => void;
  compact?: boolean;
}

interface AnalysisResult {
  overallScore: number;
  categoryScores: {
    energy_sleep: number;
    cognitive: number;
    emotional: number;
    physical: number;
    hormonal: number;
    digestive: number;
  };
  patterns: Array<{
    title: string;
    description: string;
    affectedSymptoms: string[];
    severity: 'high' | 'medium' | 'low';
  }>;
  priorityActions: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium';
  }>;
  nextAssessmentSuggestion: {
    symptomId: string;
    reason: string;
  };
}

export const ProgressiveHealthOverview = ({
  assessments,
  totalInFlow,
  onContinueToNext,
  onViewFullAnalysis,
  compact = false
}: ProgressiveHealthOverviewProps) => {
  const { profile, subscription } = useUserStore();
  const { data: analysis, isLoading, error } = useQuery<AnalysisResult>({
    queryKey: ['progressive-analysis', assessments.map(a => a.id).join(',')],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('analyze-health-patterns', {
        body: { 
          assessments: assessments.map(a => ({
            symptom_type: a.symptom_type,
            overall_score: a.overall_score,
            score_category: a.score_category,
            primary_issues: a.primary_issues || [],
            completed_at: a.completed_at
          }))
        }
      });

      if (error) throw error;
      return data as AnalysisResult;
    },
    enabled: assessments.length >= 2,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
  });

  const getBadgeVariant = (category: string) => {
    if (category === 'minimal' || category === 'excellent') return 'default';
    if (category === 'mild' || category === 'good') return 'secondary';
    if (category === 'moderate' || category === 'fair') return 'outline';
    return 'destructive';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', variant: 'default' as const };
    if (score >= 60) return { label: 'Good', variant: 'secondary' as const };
    if (score >= 40) return { label: 'Fair', variant: 'outline' as const };
    return { label: 'Needs Attention', variant: 'destructive' as const };
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'border-destructive';
    if (severity === 'medium') return 'border-warning';
    return 'border-muted';
  };

  const completionPercent = totalInFlow ? (assessments.length / totalInFlow) * 100 : 100;

  // PHASE 1: INSTANT RENDER - Always show user data immediately
  return (
    <div className="space-y-6">
      {/* User Welcome Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">
                {profile?.preferred_name 
                  ? `Welcome back, ${profile.preferred_name}! 👋` 
                  : 'Welcome to Your Health Hub! 👋'}
              </CardTitle>
              <CardDescription className="text-base">
                {profile?.preferred_name 
                  ? "Here's your personalized health overview" 
                  : "Let's explore your health journey together"}
              </CardDescription>
              {subscription && (
                <Badge variant={subscription.subscription_tier === 'premium' ? 'default' : 'outline'} className="mt-2">
                  {subscription.subscription_tier === 'premium' ? '⭐ Premium Member' : '🎯 Free Trial'}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assessment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Your Health Assessments
          </CardTitle>
          <CardDescription>
            You've completed {assessments.length} symptom assessment{assessments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalInFlow && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{assessments.length} of {totalInFlow} completed</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Assessments List - INSTANT */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Assessments</CardTitle>
          <CardDescription>Individual symptom scores from your assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {assessments.map((assessment) => (
              <div 
                key={assessment.id} 
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-medium capitalize">
                      {assessment.symptom_type.replace(/-/g, ' ')}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(assessment.completed_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(assessment.overall_score)}
                  </div>
                  <Badge variant={getBadgeVariant(assessment.score_category)}>
                    {assessment.score_category}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PHASE 2: AI INSIGHTS - Progressive */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Health Analysis
          </CardTitle>
          <CardDescription>
            Advanced pattern detection and personalized insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Enhanced Loading State
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  <div className="absolute inset-0 h-12 w-12 bg-primary/20 rounded-full animate-ping" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  Analyzing Your Health Patterns
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is analyzing {assessments.length} assessment{assessments.length !== 1 ? 's' : ''} to detect patterns and generate insights...
                </p>
                <p className="text-xs text-muted-foreground">
                  This usually takes 5-10 seconds
                </p>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <Alert className="bg-accent/50 border-accent">
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  💡 Complete more assessments for deeper pattern insights
                </AlertDescription>
              </Alert>
            </div>
          ) : analysis ? (
            // AI Results
            <div className="space-y-6">
              {/* Overall Wellness Score */}
              <div className="flex flex-col items-center justify-center py-6 border-b">
                <div className="text-6xl font-bold text-primary mb-3">
                  {Math.round(analysis.overallScore)}
                </div>
                <Badge variant={getScoreStatus(analysis.overallScore).variant} className="mb-2">
                  {getScoreStatus(analysis.overallScore).label}
                </Badge>
                <p className="text-center text-sm text-muted-foreground max-w-md">
                  Overall Wellness Score based on AI analysis
                </p>
              </div>

              {/* Radar Chart */}
              {!compact && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Health Category Breakdown</h3>
                  <HealthRadarChart categoryScores={analysis.categoryScores} />
                </div>
              )}

              {/* AI-Detected Patterns */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Detected Patterns</h3>
                <div className="space-y-3">
                  {(compact ? analysis.patterns.slice(0, 2) : analysis.patterns).map((pattern, index) => (
                    <div 
                      key={index} 
                      className={`p-4 border-l-4 ${getSeverityColor(pattern.severity)} bg-muted/50 rounded-r-lg`}
                    >
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        {pattern.title}
                        <Badge variant="outline" className="text-xs">
                          {pattern.severity}
                        </Badge>
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pattern.affectedSymptoms.map((symptom, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Actions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Priority Actions
                </h3>
                <div className="space-y-3">
                  {(compact ? [analysis.priorityActions[0]] : analysis.priorityActions).map((action, index) => (
                    <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{action.title}</h4>
                        <Badge variant={action.impact === 'high' ? 'default' : 'secondary'}>
                          {action.impact} impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Steps */}
              {!compact && analysis.nextAssessmentSuggestion && (
                <div className="p-4 bg-accent rounded-lg">
                  <h4 className="font-semibold mb-2">Recommended Next Assessment</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {analysis.nextAssessmentSuggestion.reason}
                  </p>
                  {onContinueToNext && (
                    <Button onClick={onContinueToNext} className="w-full">
                      Continue Assessment Journey
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {onViewFullAnalysis && (
                <Button variant="outline" onClick={onViewFullAnalysis} className="w-full">
                  View Full Analysis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to generate AI analysis. Your assessment data is shown above.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
