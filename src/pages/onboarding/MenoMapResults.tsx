import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { MenoMapStageCompass } from "@/components/menomap/MenoMapStageCompass";
import { MENOMAP_ASSESSMENT, calculateMenoStage } from "@/data/menoMapAssessment";
import { CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

const STAGE_INFO = {
  'pre': {
    title: 'Pre-Menopause',
    description: 'Your cycles are still regular, and you\'re not experiencing significant hormonal changes yet.',
    recommendations: [
      'Focus on establishing healthy habits now',
      'Track your cycles to establish a baseline',
      'Consider preventive nutrition and exercise',
      'Monitor energy and mood patterns'
    ]
  },
  'early-peri': {
    title: 'Early Perimenopause',
    description: 'You\'re beginning to experience subtle hormonal shifts. Cycles may become slightly irregular.',
    recommendations: [
      'Start tracking symptoms consistently',
      'Consider adaptogenic herbs for hormone support',
      'Optimize sleep hygiene',
      'Add strength training to preserve muscle mass'
    ]
  },
  'mid-peri': {
    title: 'Mid Perimenopause',
    description: 'Hormonal fluctuations are more pronounced. You may notice significant cycle changes and symptoms.',
    recommendations: [
      'Focus on stress management and cortisol regulation',
      'Consider magnesium for sleep and mood',
      'Increase phytoestrogen-rich foods',
      'Track hot flashes and night sweats patterns'
    ]
  },
  'late-peri': {
    title: 'Late Perimenopause',
    description: 'You\'re approaching menopause. Periods may be very irregular or absent for months.',
    recommendations: [
      'Support bone health with vitamin D and K2',
      'Focus on cardiovascular exercise',
      'Consider hormone testing with your doctor',
      'Optimize gut health for hormone metabolism'
    ]
  },
  'post': {
    title: 'Post-Menopause',
    description: 'It\'s been 12+ months since your last period. Focus shifts to long-term health optimization.',
    recommendations: [
      'Prioritize bone density and cardiovascular health',
      'Continue strength training',
      'Focus on longevity nutrition',
      'Monitor metabolic health markers'
    ]
  }
};

const MenoMapResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState<{
    stage: string;
    confidence: number;
    avgScore: number;
    domainScores: Array<{ domain: string; score: number; icon: string }>;
  } | null>(null);

  useEffect(() => {
    // Retrieve assessment answers from localStorage
    const storedAnswers = localStorage.getItem('menomap_answers');
    if (storedAnswers) {
      const answers = JSON.parse(storedAnswers);
      const stageResult = calculateMenoStage(answers);
      
      // Calculate domain scores
      const domainScores = MENOMAP_ASSESSMENT.domains.map(domain => {
        const domainQuestions = domain.questions.map(q => q.id);
        const domainAnswers = domainQuestions
          .map(qId => answers[qId])
          .filter(score => score !== undefined);
        
        const avgDomainScore = domainAnswers.length > 0
          ? domainAnswers.reduce((sum, score) => sum + score, 0) / domainAnswers.length
          : 0;
        
        return {
          domain: domain.name,
          score: avgDomainScore,
          icon: domain.icon
        };
      });

      setAnalysisData({
        ...stageResult,
        domainScores
      });
    }
  }, []);

  const handleContinue = () => {
    if (user) {
      navigate('/onboarding/goal-setup-chat');
    } else {
      navigate('/auth?mode=signup&redirect=/onboarding/goal-setup-chat');
    }
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading your results...</div>
      </div>
    );
  }

  const stageInfo = STAGE_INFO[analysisData.stage as keyof typeof STAGE_INFO];
  const overallScore = Math.round(analysisData.avgScore * 20); // Convert to 0-100 scale

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-4xl font-bold">Your MenoMap™ Analysis</h1>
          <p className="text-lg text-muted-foreground">
            Here's what your responses reveal about your hormonal health journey
          </p>
        </div>

        {/* Stage Result with Compass */}
        <Card className="border-2 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="pt-8">
            <MenoMapStageCompass 
              currentStage={analysisData.stage as any}
              confidenceScore={analysisData.confidence}
              size="lg"
            />
          </CardContent>
        </Card>

        {/* What This Means */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              What This Means For You
            </CardTitle>
            <CardDescription className="text-base pt-2">
              {stageInfo.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Your Overall Score</span>
                <span className="text-2xl font-bold text-primary">{overallScore}/100</span>
              </div>
              <Progress value={overallScore} className="h-2" />
              <p className="text-sm text-muted-foreground">
                This score reflects the overall pattern of your responses across all symptom domains. 
                Higher scores indicate fewer symptoms, while lower scores suggest more active symptoms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Domain Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Your Symptom Pattern Analysis
            </CardTitle>
            <CardDescription>
              How your responses map across the 6 key health domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData.domainScores.map((domain, idx) => {
                const domainPercent = Math.round(domain.score * 20);
                const severity = 
                  domainPercent >= 80 ? { label: 'Excellent', color: 'text-green-600 dark:text-green-400' } :
                  domainPercent >= 60 ? { label: 'Good', color: 'text-blue-600 dark:text-blue-400' } :
                  domainPercent >= 40 ? { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' } :
                  { label: 'Needs Attention', color: 'text-orange-600 dark:text-orange-400' };

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{domain.icon}</span>
                        <span className="font-medium">{domain.domain}</span>
                      </div>
                      <span className={`text-sm font-semibold ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>
                    <Progress value={domainPercent} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Personalized Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Your Personalized Action Plan</CardTitle>
            <CardDescription>
              Evidence-based recommendations tailored to your {stageInfo.title.toLowerCase()} stage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {stageInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Take Action?</CardTitle>
            <CardDescription className="text-base">
              {!user 
                ? 'Create your free account to save these results and get your personalized wellness protocol'
                : 'Set your health goals and get a personalized protocol based on your assessment'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleContinue} className="w-full" size="lg">
              {user ? 'Set Your Health Goals' : 'Create Free Account & Get Your Protocol'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenoMapResults;
