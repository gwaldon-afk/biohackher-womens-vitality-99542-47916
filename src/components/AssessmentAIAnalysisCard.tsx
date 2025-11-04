import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

interface AssessmentAIAnalysisCardProps {
  assessmentType: 'symptom' | 'lis' | 'hormone-compass';
  assessmentId: string;
  score: number;
  scoreCategory: string;
  answers: Record<string, number>;
  metadata?: any;
  autoGenerate?: boolean;
}

export const AssessmentAIAnalysisCard = ({
  assessmentType,
  assessmentId,
  score,
  scoreCategory,
  answers,
  metadata,
  autoGenerate = true
}: AssessmentAIAnalysisCardProps) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    if (autoGenerate && user) {
      generateAnalysis();
    }
  }, [autoGenerate, user]);

  const generateAnalysis = async (forceRegenerate = false) => {
    if (!user) {
      toast.error("Please sign in to get AI analysis");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analyze-assessment-results', {
        body: {
          userId: user.id,
          assessmentType,
          assessmentId,
          score,
          scoreCategory,
          answers,
          metadata,
          forceRegenerate
        }
      });

      if (invokeError) {
        if (invokeError.message?.includes("429")) {
          setError("Rate limit reached. Please try again in a moment.");
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (invokeError.message?.includes("402")) {
          setError("AI credits needed. Please add credits to your workspace.");
          toast.error("AI credits needed. Please add credits to your workspace.");
        } else {
          setError("Failed to generate analysis. Please try again later.");
          toast.error("Failed to generate analysis. Please try again later.");
        }
        throw invokeError;
      }

      if (data) {
        setAnalysis(data);
        setFromCache(data.fromCache || false);
        
        if (data.providerError) {
          toast.warning(data.errorMessage || "AI provider temporarily unavailable. Showing general recommendations.");
        } else if (data.fromCache) {
          toast.success("Retrieved cached analysis");
        } else {
          toast.success("Analysis generated successfully");
        }
      }
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const isStale = analysis && analysis.expires_at && new Date(analysis.expires_at) < new Date();

  if (!user) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-2">Unlock AI-Powered Insights</h3>
              <p className="text-blue-700 mb-4">
                Sign in to get personalized AI analysis of your results with actionable recommendations.
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In for AI Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>AI Health Analysis</CardTitle>
            {fromCache && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Cached
              </Badge>
            )}
          </div>
          {analysis && !loading && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => generateAnalysis(true)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isStale && (
          <div className="border-l-4 border-yellow-500 p-4 bg-yellow-50 rounded-r">
            <p className="text-sm text-yellow-800 mb-2">
              This analysis is from {formatDistanceToNow(new Date(analysis.created_at))} ago and may be outdated.
            </p>
            <Button size="sm" onClick={() => generateAnalysis(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Update Analysis
            </Button>
          </div>
        )}

        {analysis?.providerError && (
          <div className="border-l-4 border-orange-500 p-4 bg-orange-50 rounded-r">
            <div className="flex items-center gap-2 text-orange-800 mb-2">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Using General Recommendations</p>
            </div>
            <p className="text-sm text-orange-700">
              {analysis.errorMessage || "AI provider is temporarily unavailable. Showing general recommendations based on your score."}
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3"
              onClick={() => generateAnalysis(true)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try AI Analysis Again
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-24 w-full mt-4" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}

        {error && !loading && (
          <div className="border-l-4 border-red-500 p-4 bg-red-50 rounded-r">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Analysis Error</p>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3"
              onClick={() => generateAnalysis()}
            >
              Try Again
            </Button>
          </div>
        )}

        {analysis && !loading && !error && (
          <div className="space-y-6">
            {/* Overall Analysis */}
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">Overall Analysis</h3>
              <ReactMarkdown>{analysis.overall_analysis}</ReactMarkdown>
            </div>

            {/* Key Findings */}
            {analysis.key_findings && analysis.key_findings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
                <div className="space-y-2">
                  {analysis.key_findings.map((finding: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        finding.severity === 'high' ? 'border-red-500 bg-red-50' :
                        finding.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                        'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">
                          {finding.category}
                        </Badge>
                        <p className="flex-1 text-sm">{finding.finding}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Insights */}
            {analysis.personalized_insights && analysis.personalized_insights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Personalized Insights</h3>
                <div className="space-y-3">
                  {analysis.personalized_insights.map((insight: any, idx: number) => (
                    <div key={idx} className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-medium text-purple-900 mb-1">{insight.insight}</p>
                          <p className="text-sm text-purple-700 mb-2">{insight.reasoning}</p>
                          <Badge variant="outline" className="text-xs">
                            Evidence: {insight.evidence_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protocol Recommendations */}
            {analysis.protocol_recommendations && analysis.protocol_recommendations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Recommended Interventions</h3>
                <div className="space-y-3">
                  {analysis.protocol_recommendations.map((rec: any, idx: number) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-blue-900 flex-1">
                          {rec.intervention}
                        </p>
                        <div className="flex gap-1 ml-2">
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rec.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Impact: {rec.impact}
                          </Badge>
                        </div>
                      </div>
                      {rec.type && (
                        <p className="text-xs text-blue-600 mb-2">Type: {rec.type}</p>
                      )}
                      <p className="text-sm text-blue-700">{rec.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Actions */}
            {analysis.priority_actions && analysis.priority_actions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Your Priority Actions</h3>
                <div className="space-y-3">
                  {analysis.priority_actions.map((action: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="font-medium text-green-900 mb-1">
                        {idx + 1}. {action.action}
                      </p>
                      <p className="text-sm text-green-700 mb-2">{action.rationale}</p>
                      <div className="flex gap-2 text-xs">
                        <Badge variant="outline">{action.timeline}</Badge>
                        <Badge variant="outline">Expected: {action.expected_outcome}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence Score */}
            {analysis.confidence_score && (
              <div className="text-xs text-muted-foreground text-right">
                Analysis confidence: {analysis.confidence_score}%
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
