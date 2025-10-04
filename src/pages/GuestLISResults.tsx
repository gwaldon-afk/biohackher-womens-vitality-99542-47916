import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, Lock } from 'lucide-react';

interface BriefResults {
  finalScore: number;
  pillarScores: Record<string, number>;
  smokingPenalty: number;
}

interface AssessmentData {
  answers: Array<{
    questionId: string;
    answer: string;
    score: number;
    analysis: string;
  }>;
  timestamp: string;
}

export default function GuestLISResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<BriefResults | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    if (!sessionId) {
      toast.error('Invalid session ID');
      navigate('/');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guest_lis_assessments')
        .select('brief_results, assessment_data')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error || !data) {
        toast.error('Assessment not found');
        navigate('/');
        return;
      }

      setResults(data.brief_results as unknown as BriefResults);
      setAssessmentData(data.assessment_data as unknown as AssessmentData);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskCategory = (score: number): { label: string; color: string; description: string } => {
    if (score >= 80) {
      return {
        label: 'Optimal',
        color: 'bg-green-500',
        description: 'Your lifestyle choices are strongly supporting healthy longevity'
      };
    } else if (score >= 60) {
      return {
        label: 'Protective',
        color: 'bg-blue-500',
        description: 'Good foundation with opportunities for further optimization'
      };
    } else if (score >= 40) {
      return {
        label: 'Moderate Risk',
        color: 'bg-yellow-500',
        description: 'Several areas need attention to support healthy aging'
      };
    } else {
      return {
        label: 'High Risk',
        color: 'bg-red-500',
        description: 'Immediate lifestyle changes recommended for longevity optimization'
      };
    }
  };

  const getTopStrengths = () => {
    if (!results) return [];
    const sorted = Object.entries(results.pillarScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return sorted;
  };

  const getTopImprovements = () => {
    if (!results) return [];
    const sorted = Object.entries(results.pillarScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3);
    return sorted;
  };

  const getSimpleAnalysis = () => {
    if (!assessmentData || !results) return '';

    const riskCategory = getRiskCategory(results.finalScore);
    const topWeakness = getTopImprovements()[0];
    const topStrength = getTopStrengths()[0];

    return `Your LIS score of ${results.finalScore} falls in the ${riskCategory.label} category. ${riskCategory.description} Your strongest area is ${topStrength[0]} (${topStrength[1]}/100), while ${topWeakness[0]} (${topWeakness[1]}/100) presents the greatest opportunity for improvement.`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const riskCategory = getRiskCategory(results.finalScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Longevity Impact Score</h1>
          <p className="text-muted-foreground">Based on science-backed lifestyle factors</p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 text-center border-2">
          <div className="mb-6">
            <div className="text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              {results.finalScore}
            </div>
            <div className="text-2xl text-muted-foreground mb-4">out of 100</div>
            <Badge className={`${riskCategory.color} text-white text-lg px-6 py-2`}>
              {riskCategory.label}
            </Badge>
          </div>

          <Progress value={results.finalScore} className="h-3 mb-4" />

          <p className="text-lg text-muted-foreground leading-relaxed">
            {getSimpleAnalysis()}
          </p>

          {results.smokingPenalty > 0 && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="w-5 h-5" />
                Smoking Penalty Applied: -{results.smokingPenalty} points
              </div>
            </div>
          )}
        </Card>

        {/* Pillar Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top Strengths */}
          <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Top Strengths</h3>
            </div>
            <div className="space-y-3">
              {getTopStrengths().map(([pillar, score]) => (
                <div key={pillar} className="flex items-center justify-between">
                  <span className="font-medium">{pillar}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={score} className="w-24 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              <h3 className="text-xl font-semibold">Improvement Opportunities</h3>
            </div>
            <div className="space-y-3">
              {getTopImprovements().map(([pillar, score]) => (
                <div key={pillar} className="flex items-center justify-between">
                  <span className="font-medium">{pillar}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={score} className="w-24 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Registration CTA */}
        <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Unlock Your Complete Analysis</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Register now to access your detailed longevity insights and start your transformation
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Full Pillar Breakdown</div>
                  <div className="text-sm text-muted-foreground">
                    Detailed analysis of all 4 longevity pillars with evidence-based insights
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Biological Age Impact</div>
                  <div className="text-sm text-muted-foreground">
                    See how your lifestyle is affecting your biological aging rate
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Personalized Action Plan</div>
                  <div className="text-sm text-muted-foreground">
                    Science-backed recommendations tailored to your specific results
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => navigate(`/auth?session=${sessionId}`)}
                className="text-lg px-8 py-6 h-auto"
              >
                Register for Your Free Detailed Analysis
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Includes FREE 7-Day Premium Trial with daily tracking & AI insights</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
