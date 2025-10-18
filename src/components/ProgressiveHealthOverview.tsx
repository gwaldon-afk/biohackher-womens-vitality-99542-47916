import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { HealthRadarChart } from './HealthRadarChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Analyzing your health patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Unable to generate analysis. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const scoreStatus = getScoreStatus(analysis.overallScore);
  const completionPercent = totalInFlow ? (assessments.length / totalInFlow) * 100 : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Health Picture So Far
              </CardTitle>
              {totalInFlow && (
                <CardDescription className="mt-2">
                  {assessments.length} of {totalInFlow} assessments completed
                </CardDescription>
              )}
            </div>
          </div>
          {totalInFlow && (
            <Progress value={completionPercent} className="mt-3" />
          )}
        </CardHeader>
      </Card>

      {/* Overall Wellness Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Wellness Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className="text-6xl font-bold text-primary mb-3">
              {Math.round(analysis.overallScore)}
            </div>
            <Badge variant={scoreStatus.variant} className="mb-2">
              {scoreStatus.label}
            </Badge>
            <p className="text-center text-sm text-muted-foreground max-w-md">
              Based on {assessments.length} comprehensive symptom assessments
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      {!compact && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Health Category Breakdown</h3>
          <HealthRadarChart categoryScores={analysis.categoryScores} />
        </div>
      )}

      {/* Assessments Completed */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle>Assessments Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span className="font-medium capitalize">
                      {assessment.symptom_type.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <Badge variant={assessment.score_category === 'minimal' ? 'default' : 'outline'}>
                    {Math.round(assessment.overall_score)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI-Detected Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Assessment Patterns
          </CardTitle>
          <CardDescription>
            Connections between your symptoms identified by our AI
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Priority Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Priority Actions
          </CardTitle>
          <CardDescription>
            Most impactful interventions based on your results
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Next Steps */}
      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.nextAssessmentSuggestion && (
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
                  View Full Health Analysis
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {compact && onViewFullAnalysis && (
        <Button variant="outline" onClick={onViewFullAnalysis} className="w-full">
          View Full Analysis
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
