import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { MenoMapStageCompass } from "@/components/menomap/MenoMapStageCompass";
import { MENOMAP_ASSESSMENT, calculateMenoStage } from "@/data/menoMapAssessment";
import { CheckCircle, TrendingUp, AlertCircle, Activity, Lightbulb, Target, Clock, Microscope, ShoppingCart, Home, ArrowLeft } from "lucide-react";
import { 
  analyzeSymptomInterconnections, 
  identifyBiologicalMechanisms,
  predictNextPhase,
  generatePersonalizedProtocolPreview,
  calculateDeficiencySignals,
  generateComparativeContext,
  type SymptomAnswers
} from "@/utils/menoMapInsights";
import { Badge } from "@/components/ui/badge";

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
  const { addToCart, setIsCartOpen } = useCart();
  const [analysisData, setAnalysisData] = useState<{
    stage: string;
    confidence: number;
    avgScore: number;
    domainScores: Array<{ domain: string; score: number; icon: string }>;
  } | null>(null);

  useEffect(() => {
    // Add timeout safety - redirect if no data after 2 seconds
    const timeoutId = setTimeout(() => {
      const stored = localStorage.getItem('menomap_answers');
      if (!stored) {
        console.error('No MenoMap assessment data found');
        navigate('/onboarding/menomap-menopause');
      }
    }, 2000);

    // Retrieve assessment answers from localStorage
    const storedAnswers = localStorage.getItem('menomap_answers');
    const assessmentType = localStorage.getItem('menomap_assessment_type') || 'quick';
    
    if (storedAnswers) {
      clearTimeout(timeoutId);
      const answers: SymptomAnswers = JSON.parse(storedAnswers);
      
      // For quick assessment, calculate simplified stage
      let stageResult;
      if (assessmentType === 'quick') {
        // Map quick assessment to stage based on answers
        const stageAnswer = answers.stage || 'Not sure';
        const numericValues = [
          answers.hot_flush || 5,
          answers.sleep || 5, 
          answers.mood || 5,
          answers.energy || 5,
          answers.skin || 5
        ];
        const avgScore = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        
        // Simple stage mapping for quick assessment
        let mappedStage = 'pre';
        if (stageAnswer.toLowerCase().includes('perimenopause')) mappedStage = 'mid-peri';
        else if (stageAnswer.toLowerCase().includes('menopause') && !stageAnswer.toLowerCase().includes('post')) mappedStage = 'late-peri';
        else if (stageAnswer.toLowerCase().includes('post')) mappedStage = 'post';
        else if (avgScore < 5) mappedStage = 'early-peri';
        
        stageResult = {
          stage: mappedStage,
          confidence: 75,
          avgScore: avgScore
        };
      } else {
        // For detailed assessment, convert to the expected format
        const numericAnswers: Record<string, number> = {};
        Object.entries(answers).forEach(([key, value]) => {
          if (typeof value === 'number') {
            numericAnswers[key] = value;
          }
        });
        stageResult = calculateMenoStage(numericAnswers);
      }
      
      // For quick assessment, create simplified domain scores
      const domainScores = [
        { domain: 'Vasomotor', score: answers.hot_flush || 5, icon: '🔥' },
        { domain: 'Sleep', score: answers.sleep || 5, icon: '😴' },
        { domain: 'Mood', score: answers.mood || 5, icon: '😊' },
        { domain: 'Energy', score: answers.energy || 5, icon: '⚡' },
        { domain: 'Skin & Body', score: answers.skin || 5, icon: '✨' }
      ];

      setAnalysisData({
        ...stageResult,
        domainScores
      });
    }

    return () => clearTimeout(timeoutId);
  }, [navigate]);

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
  
  // Get insights from utility functions
  const storedAnswers: SymptomAnswers = JSON.parse(localStorage.getItem('menomap_answers') || '{}');
  const interconnections = analyzeSymptomInterconnections(storedAnswers);
  const biologicalInsight = identifyBiologicalMechanisms(storedAnswers, analysisData.stage);
  const nextPhase = predictNextPhase(storedAnswers, analysisData.stage);
  const protocolPreview = generatePersonalizedProtocolPreview(storedAnswers);
  const deficiencySignals = calculateDeficiencySignals(storedAnswers);
  const comparativeContext = generateComparativeContext(storedAnswers, analysisData.stage);

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>

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

        {/* Biological Context - What's Actually Happening */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              What's Actually Happening in Your Body
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold mb-2">Biological Mechanism:</h4>
                <p className="text-sm">{biologicalInsight.mechanism}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Timeline Context:</h4>
                <p className="text-sm">{biologicalInsight.timeline}</p>
              </div>
              <div className="bg-background/50 rounded p-3">
                <p className="text-sm font-medium">{biologicalInsight.context}</p>
              </div>
            </div>

            {comparativeContext.statistics.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm">What Women Like You Experience:</h4>
                {comparativeContext.statistics.map((stat, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30">
                    {stat}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Educational Disclaimer - Early Placement */}
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-2xl">⚕️</div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Important: Educational Purposes Only</h4>
                <p className="text-sm text-muted-foreground">
                  This analysis is based on your symptom responses and published research. It is for educational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals before starting any supplementation, treatment protocol, or making significant health decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptom Pattern Analysis - The Insight Value-Add */}
        {interconnections.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Your Symptom Pattern Analysis
              </CardTitle>
              <CardDescription>
                How your symptoms interconnect and create feedback loops
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {interconnections.map((connection, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">
                        {connection.primary} → {connection.secondary}
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Mechanism:</span> {connection.mechanism}</p>
                        <p className="text-sm text-primary"><span className="font-medium">Impact:</span> {connection.impact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Domain Breakdown - Severity Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Symptom Severity Breakdown
            </CardTitle>
            <CardDescription>
              How your responses map across key health domains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData.domainScores.map((domain, idx) => {
                const domainPercent = Math.round(domain.score * 10); // Convert 0-10 to 0-100
                
                // Hot flashes are INVERSE - high score = worse
                const isInverseDomain = domain.domain === 'Vasomotor';
                const displayPercent = isInverseDomain ? 100 - domainPercent : domainPercent;
                
                const severity = 
                  displayPercent >= 80 ? { label: 'Excellent', color: 'text-green-600 dark:text-green-400' } :
                  displayPercent >= 60 ? { label: 'Good', color: 'text-blue-600 dark:text-blue-400' } :
                  displayPercent >= 40 ? { label: 'Moderate', color: 'text-yellow-600 dark:text-yellow-400' } :
                  { label: 'Needs Attention', color: 'text-orange-600 dark:text-orange-400' };

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{domain.icon}</span>
                        <span className="font-medium">{domain.domain}</span>
                        {isInverseDomain && (
                          <span className="text-xs text-muted-foreground">(lower is better)</span>
                        )}
                      </div>
                      <span className={`text-sm font-semibold ${severity.color}`}>
                        {severity.label}
                      </span>
                    </div>
                    <Progress value={displayPercent} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Deficiency Signals - Must come BEFORE Protocol Preview */}
        {deficiencySignals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Potential Nutrient Deficiency Signals
              </CardTitle>
              <CardDescription>
                Based on your symptom responses - consult with your healthcare provider
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {deficiencySignals.map((signal, idx) => (
                <div key={idx} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-sm">{signal.nutrient}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{signal.confidence} confidence</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => {
                          // Search for this nutrient in shop
                          navigate(`/shop?search=${encodeURIComponent(signal.nutrient)}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{signal.recommendation}</p>
                </div>
              ))}
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">⚕️ Important Disclaimer</p>
                <p>These insights are based on your symptom responses and are for educational purposes only. Always consult with qualified healthcare professionals before starting any supplementation or treatment protocol.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Protocol Preview - Specific Interventions */}
        {protocolPreview.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Your Personalized Protocol Preview
              </CardTitle>
              <CardDescription>
                Evidence-based interventions across lifestyle, nutrition, and supplements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {protocolPreview.map((rec, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold">{rec.intervention}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-shrink-0 text-xs">
                        {rec.evidenceLevel}
                      </Badge>
                      {rec.researchLink && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => window.open(rec.researchLink, '_blank')}
                        >
                          <Microscope className="w-4 h-4" />
                        </Button>
                      )}
                      {rec.intervention.toLowerCase().includes('oil') || 
                       rec.intervention.toLowerCase().includes('magnesium') ||
                       rec.intervention.toLowerCase().includes('ashwagandha') ||
                       rec.intervention.toLowerCase().includes('coq10') ||
                       rec.intervention.toLowerCase().includes('collagen') ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => {
                            const searchTerm = rec.intervention.split(' ')[0];
                            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Clock className="w-3 h-3" />
                    <span>{rec.timing}</span>
                  </div>
                </div>
              ))}
              <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">⚕️ Important Disclaimer</p>
                <p>These recommendations are based on your symptom responses and published research. Always consult with qualified healthcare professionals before implementing any new health protocol.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* What's Coming Next */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              What's Coming Next
            </CardTitle>
            <CardDescription>
              Predictive insights about your symptom progression
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-2">Timeline: {nextPhase.timeline}</h4>
                <ul className="space-y-1">
                  {nextPhase.likelySymptoms.map((symptom, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-semibold text-sm mb-1">Optimal Preparation:</h4>
                <p className="text-sm">{nextPhase.preparation}</p>
              </div>
            </div>
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
