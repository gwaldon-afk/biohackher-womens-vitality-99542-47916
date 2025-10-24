import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { MenoMapStageCompass } from "@/components/menomap/MenoMapStageCompass";
import { MENOMAP_ASSESSMENT, calculateMenoStage } from "@/data/menoMapAssessment";
import { CheckCircle, TrendingUp, AlertCircle, Activity, Lightbulb, Target, Clock, Microscope, ShoppingCart, Home, ArrowLeft, Brain, Link2, Dumbbell, Heart, Thermometer, Pill } from "lucide-react";
import { 
  analyzeSymptomInterconnections, 
  identifyBiologicalMechanisms,
  predictNextPhase,
  generatePersonalizedProtocolPreview,
  calculateHealthInsights,
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
  const healthInsights = calculateHealthInsights(storedAnswers);
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

        {/* Health Insights - PHYSIOLOGICAL ANALYSIS */}
        {healthInsights.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Health Insights: What's Happening in Your Body
            </h2>
            
            <div className="space-y-6">
              {healthInsights.map((insight, idx) => (
                <Card key={idx} className="p-5 border-l-4" style={{
                  borderLeftColor: insight.severity === 'high' || insight.severity === 'critical' ? '#ef4444' : 
                                 insight.severity === 'moderate' ? '#f59e0b' : '#10b981'
                }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="mb-2">{insight.category}</Badge>
                      <h3 className="text-lg font-semibold">{insight.title}</h3>
                    </div>
                    <Badge variant={
                      insight.urgency === 'priority' ? 'destructive' :
                      insight.urgency === 'soon' ? 'default' : 'secondary'
                    }>
                      {insight.urgency === 'priority' ? 'Priority' :
                       insight.urgency === 'soon' ? 'Address Soon' : 'Routine'}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg mb-3">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      What's Happening Physiologically
                    </h4>
                    <p className="text-sm text-foreground">{insight.physiologyExplanation}</p>
                  </div>

                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-2">System-Wide Impact:</h4>
                    <ul className="space-y-1">
                      {insight.systemImpact.map((impact, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {insight.cascadeEffect && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        Cascade Effect
                      </h4>
                      <p className="text-sm text-foreground">{insight.cascadeEffect}</p>
                    </div>
                  )}

                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg mb-3">
                    <h4 className="text-sm font-semibold mb-1">Why This Matters for You:</h4>
                    <p className="text-sm text-foreground">{insight.whyThisMatters}</p>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>Based on: {insight.indicators.join(', ')}</span>
                  </div>

                  {insight.testingSuggested && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                      <Microscope className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">
                        Consider testing: <strong>{insight.testingSuggested}</strong>
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
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

        {/* Understanding → Action Bridge */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                From Understanding to Action
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                Now that you understand the specific physiological patterns in your body, 
                the section below shows evidence-based interventions that may support 
                these mechanisms.
              </p>
              <p className="text-sm text-muted-foreground">
                Each intervention is explicitly linked to the insights above and organized 
                by type—lifestyle changes first, optional nutritional support last. This helps 
                you make informed decisions based on your unique physiology.
              </p>
            </div>
          </div>
        </Card>

        {/* Educational Disclaimer */}
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

        {/* Evidence-Based Interventions */}
        {protocolPreview.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Evidence-Based Interventions to Consider
            </h2>
            <p className="text-muted-foreground mb-6">
              These interventions are organized by type and mapped to your specific 
              physiological insights above. Remember: these are educational suggestions 
              based on research, not medical advice.
            </p>

            {['exercise', 'lifestyle', 'testing', 'therapy', 'supplement'].map(category => {
              const items = protocolPreview.filter(item => item.category === category);
              if (items.length === 0) return null;

              const categoryConfig: Record<string, { icon: any; label: string; color: string }> = {
                exercise: { icon: Dumbbell, label: 'Exercise & Movement', color: 'green' },
                lifestyle: { icon: Heart, label: 'Lifestyle & Habits', color: 'blue' },
                testing: { icon: Microscope, label: 'Testing to Consider', color: 'purple' },
                therapy: { icon: Thermometer, label: 'Therapeutic Approaches', color: 'orange' },
                supplement: { icon: Pill, label: 'Nutritional Support', color: 'pink' }
              };

              const config = categoryConfig[category];
              const Icon = config.icon;

              return (
                <div key={category} className="mb-8 last:mb-0">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5" />
                    <h3 className="text-lg font-semibold">{config.label}</h3>
                    <Badge variant="outline">{items.length}</Badge>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <Card key={idx} className="p-4 border-l-4 border-l-primary/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base">{item.intervention}</h4>
                            
                            <div className="flex items-center gap-1 mt-1 text-xs text-purple-600 dark:text-purple-400">
                              <Link2 className="w-3 h-3" />
                              <span>Addresses: {item.addressesInsight}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{item.evidenceLevel}</Badge>
                            {item.researchLink && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => window.open(item.researchLink, '_blank')}
                              >
                                <Microscope className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded mb-3">
                          <p className="text-sm font-medium text-foreground">
                            {item.howItHelps}
                          </p>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>Mechanism:</strong> {item.rationale}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timing}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </Card>
        )}

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
              {user ? 'Save Your Results & Continue Your Journey' : 'Save Your Results & Continue Your Journey'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MenoMapResults;
