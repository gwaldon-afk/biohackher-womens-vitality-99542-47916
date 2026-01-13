import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Brain, Zap, Target, Moon, TrendingUp, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

const BrainAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const journeyContext = searchParams.get('context') || 'general';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState({
    memory: 0,
    focus: 0,
    processing: 0,
    clarity: 0,
    overall: 0
  });

  // Questions with translation keys
  const performanceQuestions = [
    {
      id: 1,
      category: "Memory & Recall",
      icon: Brain,
      question: "How would you rate your short-term memory and ability to recall information?",
      options: [
        { value: "poor", label: "Poor - Frequently forget things within minutes", score: 25 },
        { value: "fair", label: "Fair - Sometimes forget details or names", score: 50 },
        { value: "good", label: "Good - Generally remember most things", score: 75 },
        { value: "excellent", label: "Excellent - Sharp recall and retention", score: 100 }
      ]
    },
    {
      id: 2,
      category: "Focus & Concentration",
      icon: Target,
      question: "How easily can you maintain focus on demanding cognitive tasks?",
      options: [
        { value: "very-difficult", label: "Very difficult - Constantly distracted", score: 25 },
        { value: "challenging", label: "Challenging - Struggle to concentrate for long", score: 50 },
        { value: "moderate", label: "Moderate - Can focus with effort", score: 75 },
        { value: "excellent", label: "Excellent - Deep focus for extended periods", score: 100 }
      ]
    },
    {
      id: 3,
      category: "Processing Speed",
      icon: Zap,
      question: "How quickly do you process new information and make decisions?",
      options: [
        { value: "slow", label: "Slow - Takes time to understand and respond", score: 25 },
        { value: "below-average", label: "Below average - Processing feels sluggish", score: 50 },
        { value: "average", label: "Average - Normal processing speed", score: 75 },
        { value: "fast", label: "Fast - Quick comprehension and response", score: 100 }
      ]
    },
    {
      id: 4,
      category: "Mental Clarity",
      icon: Brain,
      question: "How clear and sharp does your thinking feel throughout the day?",
      options: [
        { value: "foggy", label: "Foggy - Frequent brain fog", score: 25 },
        { value: "unclear", label: "Unclear - Often feel mentally cloudy", score: 50 },
        { value: "clear", label: "Clear - Generally sharp thinking", score: 75 },
        { value: "crystal", label: "Crystal clear - Consistently sharp and alert", score: 100 }
      ]
    },
    {
      id: 5,
      category: "Working Memory",
      icon: Brain,
      question: "How well can you hold and manipulate information in your mind?",
      options: [
        { value: "poor", label: "Poor - Difficult to juggle multiple pieces of info", score: 25 },
        { value: "fair", label: "Fair - Can handle simple mental tasks", score: 50 },
        { value: "good", label: "Good - Can manage complex mental tasks", score: 75 },
        { value: "excellent", label: "Excellent - Easily handle multiple complex inputs", score: 100 }
      ]
    },
    {
      id: 6,
      category: "Mental Energy",
      icon: Zap,
      question: "How would you describe your mental energy levels?",
      options: [
        { value: "depleted", label: "Depleted - Mentally exhausted most of the day", score: 25 },
        { value: "low", label: "Low - Energy drops significantly after tasks", score: 50 },
        { value: "moderate", label: "Moderate - Steady energy with some dips", score: 75 },
        { value: "high", label: "High - Sustained mental energy throughout day", score: 100 }
      ]
    },
    {
      id: 7,
      category: "Learning Ability",
      icon: TrendingUp,
      question: "How easily do you learn and retain new skills or information?",
      options: [
        { value: "difficult", label: "Difficult - Takes many repetitions to learn", score: 25 },
        { value: "slow", label: "Slow - Need significant time to master new things", score: 50 },
        { value: "moderate", label: "Moderate - Learn at a normal pace", score: 75 },
        { value: "fast", label: "Fast - Quickly grasp and retain new information", score: 100 }
      ]
    },
    {
      id: 8,
      category: "Sleep Quality Impact",
      icon: Moon,
      question: "How does your sleep quality affect your cognitive performance?",
      options: [
        { value: "severe", label: "Severe - Poor sleep significantly impairs cognition", score: 25 },
        { value: "moderate", label: "Moderate - Noticeable cognitive impact from sleep", score: 50 },
        { value: "mild", label: "Mild - Slight impact from sleep quality", score: 75 },
        { value: "minimal", label: "Minimal - Maintain performance despite sleep variation", score: 100 }
      ]
    },
    {
      id: 9,
      category: "Stress Resilience",
      icon: AlertCircle,
      question: "How well does your cognitive performance hold up under stress?",
      options: [
        { value: "poor", label: "Poor - Performance drops significantly under pressure", score: 25 },
        { value: "fair", label: "Fair - Noticeable decline when stressed", score: 50 },
        { value: "good", label: "Good - Mostly maintain performance under stress", score: 75 },
        { value: "excellent", label: "Excellent - Thrive under pressure", score: 100 }
      ]
    },
    {
      id: 10,
      category: "Problem Solving",
      icon: Brain,
      question: "How effectively can you solve complex problems?",
      options: [
        { value: "struggle", label: "Struggle - Have difficulty with complex problems", score: 25 },
        { value: "basic", label: "Basic - Can solve simple problems", score: 50 },
        { value: "proficient", label: "Proficient - Handle most complex problems well", score: 75 },
        { value: "advanced", label: "Advanced - Excel at complex problem-solving", score: 100 }
      ]
    }
  ];

  const menopauseQuestions = [
    {
      id: 1,
      category: "Brain Fog",
      icon: Brain,
      question: "How often do you experience brain fog or mental cloudiness?",
      options: [
        { value: "daily", label: "Daily - Constantly feel foggy", score: 25 },
        { value: "frequent", label: "Several times a week", score: 50 },
        { value: "occasional", label: "Occasionally - A few times a month", score: 75 },
        { value: "rare", label: "Rarely or never", score: 100 }
      ]
    },
    {
      id: 2,
      category: "Memory Changes",
      icon: Brain,
      question: "Have you noticed changes in your memory since perimenopause/menopause?",
      options: [
        { value: "significant", label: "Significant - Much worse than before", score: 25 },
        { value: "moderate", label: "Moderate - Noticeable decline", score: 50 },
        { value: "mild", label: "Mild - Slight changes", score: 75 },
        { value: "none", label: "No change - Memory remains sharp", score: 100 }
      ]
    },
    {
      id: 3,
      category: "Word Finding",
      icon: Brain,
      question: "Do you struggle to find the right words when speaking?",
      options: [
        { value: "constantly", label: "Constantly - Very frustrating", score: 25 },
        { value: "often", label: "Often - Multiple times daily", score: 50 },
        { value: "sometimes", label: "Sometimes - Occasionally happens", score: 75 },
        { value: "rarely", label: "Rarely - Not a problem", score: 100 }
      ]
    },
    {
      id: 4,
      category: "Concentration",
      icon: Target,
      question: "How has your ability to concentrate been affected?",
      options: [
        { value: "severely", label: "Severely - Can barely focus", score: 25 },
        { value: "moderately", label: "Moderately - Significantly harder to focus", score: 50 },
        { value: "mildly", label: "Mildly - Some difficulty focusing", score: 75 },
        { value: "unaffected", label: "Unaffected - No change in concentration", score: 100 }
      ]
    },
    {
      id: 5,
      category: "Mental Fatigue",
      icon: Zap,
      question: "How quickly does mental fatigue set in during cognitive tasks?",
      options: [
        { value: "immediate", label: "Immediately - Exhausted very quickly", score: 25 },
        { value: "fast", label: "Fast - Within 30 minutes", score: 50 },
        { value: "moderate", label: "Moderate - After 1-2 hours", score: 75 },
        { value: "slow", label: "Slow - Sustained mental energy", score: 100 }
      ]
    },
    {
      id: 6,
      category: "Sleep Disruption",
      icon: Moon,
      question: "How are hot flushes or night sweats affecting your sleep and cognition?",
      options: [
        { value: "severe", label: "Severe - Major sleep disruption, significant cognitive impact", score: 25 },
        { value: "moderate", label: "Moderate - Regular disruption affecting mental clarity", score: 50 },
        { value: "mild", label: "Mild - Some disruption but manageable", score: 75 },
        { value: "none", label: "None - No sleep disruption", score: 100 }
      ]
    },
    {
      id: 7,
      category: "Mood & Cognition",
      icon: AlertCircle,
      question: "How do mood changes affect your cognitive function?",
      options: [
        { value: "major", label: "Major impact - Mood swings severely affect thinking", score: 25 },
        { value: "significant", label: "Significant - Clear cognitive impact from mood", score: 50 },
        { value: "moderate", label: "Moderate - Some impact on cognition", score: 75 },
        { value: "minimal", label: "Minimal - Mood stable, cognition unaffected", score: 100 }
      ]
    },
    {
      id: 8,
      category: "Task Completion",
      icon: Target,
      question: "How often do you forget what you're doing mid-task?",
      options: [
        { value: "constantly", label: "Constantly - Lose track multiple times daily", score: 25 },
        { value: "often", label: "Often - Several times a week", score: 50 },
        { value: "occasionally", label: "Occasionally - Once in a while", score: 75 },
        { value: "rarely", label: "Rarely - Stay on task well", score: 100 }
      ]
    },
    {
      id: 9,
      category: "Decision Making",
      icon: Brain,
      question: "How has your decision-making ability been affected?",
      options: [
        { value: "much-worse", label: "Much worse - Very indecisive", score: 25 },
        { value: "worse", label: "Worse - Takes longer to decide", score: 50 },
        { value: "slightly-affected", label: "Slightly affected - Minor changes", score: 75 },
        { value: "unaffected", label: "Unaffected - No change", score: 100 }
      ]
    },
    {
      id: 10,
      category: "Overall Impact",
      icon: Brain,
      question: "Overall, how much are hormonal changes affecting your cognitive function?",
      options: [
        { value: "severely", label: "Severely - Major decline in all areas", score: 25 },
        { value: "significantly", label: "Significantly - Clear impact across multiple areas", score: 50 },
        { value: "moderately", label: "Moderately - Some areas affected", score: 75 },
        { value: "minimally", label: "Minimally - Little to no impact", score: 100 }
      ]
    }
  ];

  const questions = journeyContext === 'menopause' ? menopauseQuestions : performanceQuestions;
  const currentQ = questions[currentQuestion];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = async () => {
    let totalScore = 0;
    let categoryScores = { memory: 0, focus: 0, processing: 0, clarity: 0 };
    let categoryCounts = { memory: 0, focus: 0, processing: 0, clarity: 0 };

    questions.forEach((question, idx) => {
      const answer = answers[idx];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.score;
          
          const cat = question.category.toLowerCase();
          if (cat.includes('memory')) {
            categoryScores.memory += option.score;
            categoryCounts.memory++;
          } else if (cat.includes('focus') || cat.includes('concentration')) {
            categoryScores.focus += option.score;
            categoryCounts.focus++;
          } else if (cat.includes('processing') || cat.includes('speed')) {
            categoryScores.processing += option.score;
            categoryCounts.processing++;
          } else if (cat.includes('clarity') || cat.includes('fog')) {
            categoryScores.clarity += option.score;
            categoryCounts.clarity++;
          }
        }
      }
    });

    const overallScore = Math.round(totalScore / questions.length);
    
    setScores({
      memory: categoryCounts.memory > 0 ? Math.round(categoryScores.memory / categoryCounts.memory) : 0,
      focus: categoryCounts.focus > 0 ? Math.round(categoryScores.focus / categoryCounts.focus) : 0,
      processing: categoryCounts.processing > 0 ? Math.round(categoryScores.processing / categoryCounts.processing) : 0,
      clarity: categoryCounts.clarity > 0 ? Math.round(categoryScores.clarity / categoryCounts.clarity) : 0,
      overall: overallScore
    });

    // Save to database if user is logged in
    if (user) {
      try {
        await supabase.from('symptom_assessments').insert({
          user_id: user.id,
          symptom_type: 'brain_assessment',
          overall_score: overallScore,
          score_category: overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'fair' : 'needs_attention',
          answers: answers,
          detail_scores: categoryScores,
          recommendations: []
        });

        await supabase.from('user_assessment_completions').insert({
          user_id: user.id,
          assessment_id: 'brain-cognitive-assessment',
          pillar: 'brain',
          score: overallScore
        });
      } catch (error) {
        console.error('Error saving assessment:', error);
      }
    }

    setShowResults(true);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card>
            <CardHeader>
              <div className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">
                  {journeyContext === 'menopause' ? t('brainAssessment.results.titleMenopause') : t('brainAssessment.results.titlePerformance')}
                </CardTitle>
                <CardDescription>
                  {t('brainAssessment.results.complete')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-6xl font-bold text-primary mb-2">{scores.overall}</div>
                <div className="text-lg text-muted-foreground">{t('brainAssessment.results.overallScore')}</div>
              </div>

              {/* Detailed Analysis Section */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t('brainAssessment.results.cognitiveProfile')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground leading-relaxed">
                      {scores.overall >= 80 ? (
                        <>
                          <strong className="text-primary">{t('brainAssessment.results.excellentTitle')}</strong> {t('brainAssessment.results.excellentDesc', { score: scores.overall })}
                        </>
                      ) : scores.overall >= 60 ? (
                        <>
                          <strong className="text-primary">{t('brainAssessment.results.goodTitle')}</strong> {t('brainAssessment.results.goodDesc', { score: scores.overall })}
                        </>
                      ) : scores.overall >= 40 ? (
                        <>
                          <strong className="text-amber-600">{t('brainAssessment.results.fairTitle')}</strong> {t('brainAssessment.results.fairDesc', { score: scores.overall })}
                        </>
                      ) : (
                        <>
                          <strong className="text-destructive">{t('brainAssessment.results.poorTitle')}</strong> {t('brainAssessment.results.poorDesc', { score: scores.overall })}
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className={scores.memory >= 75 ? "border-green-500/50" : scores.memory >= 50 ? "border-amber-500/50" : "border-destructive/50"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{scores.memory}</div>
                      <div className="text-sm text-muted-foreground mb-2">{t('brainAssessment.categories.memory')}</div>
                      <Progress value={scores.memory} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {scores.memory >= 75 ? t('brainAssessment.categories.memoryStrong') : scores.memory >= 50 ? t('brainAssessment.categories.memoryImprove') : t('brainAssessment.categories.memorySupport')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={scores.focus >= 75 ? "border-green-500/50" : scores.focus >= 50 ? "border-amber-500/50" : "border-destructive/50"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{scores.focus}</div>
                      <div className="text-sm text-muted-foreground mb-2">{t('brainAssessment.categories.focus')}</div>
                      <Progress value={scores.focus} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {scores.focus >= 75 ? t('brainAssessment.categories.focusExcellent') : scores.focus >= 50 ? t('brainAssessment.categories.focusModerate') : t('brainAssessment.categories.focusSignificant')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={scores.processing >= 75 ? "border-green-500/50" : scores.processing >= 50 ? "border-amber-500/50" : "border-destructive/50"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{scores.processing}</div>
                      <div className="text-sm text-muted-foreground mb-2">{t('brainAssessment.categories.processing')}</div>
                      <Progress value={scores.processing} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {scores.processing >= 75 ? t('brainAssessment.categories.processingFast') : scores.processing >= 50 ? t('brainAssessment.categories.processingAverage') : t('brainAssessment.categories.processingSlow')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className={scores.clarity >= 75 ? "border-green-500/50" : scores.clarity >= 50 ? "border-amber-500/50" : "border-destructive/50"}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{scores.clarity}</div>
                      <div className="text-sm text-muted-foreground mb-2">{t('brainAssessment.categories.clarity')}</div>
                      <Progress value={scores.clarity} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {scores.clarity >= 75 ? t('brainAssessment.categories.claritySharp') : scores.clarity >= 50 ? t('brainAssessment.categories.clarityFog') : t('brainAssessment.categories.clarityFrequent')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Strengths and Areas for Improvement */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      {t('brainAssessment.results.yourStrengths')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {scores.memory >= 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{t('brainAssessment.results.strengthMemory')}</span>
                        </li>
                      )}
                      {scores.focus >= 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{t('brainAssessment.results.strengthFocus')}</span>
                        </li>
                      )}
                      {scores.processing >= 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{t('brainAssessment.results.strengthProcessing')}</span>
                        </li>
                      )}
                      {scores.clarity >= 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{t('brainAssessment.results.strengthClarity')}</span>
                        </li>
                      )}
                      {scores.memory < 75 && scores.focus < 75 && scores.processing < 75 && scores.clarity < 75 && (
                        <li className="text-muted-foreground italic">
                          {t('brainAssessment.results.noStrengths')}
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-amber-500/20 bg-amber-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-600" />
                      {t('brainAssessment.results.priorityFocus')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {scores.memory < 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">→</span>
                          <span><strong>{t('brainAssessment.results.focusMemory')}:</strong> {scores.memory < 50 ? t('brainAssessment.results.focusMemorySevere') : t('brainAssessment.results.focusMemoryMild')}</span>
                        </li>
                      )}
                      {scores.focus < 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">→</span>
                          <span><strong>{t('brainAssessment.results.focusFocus')}:</strong> {scores.focus < 50 ? t('brainAssessment.results.focusFocusSevere') : t('brainAssessment.results.focusFocusMild')}</span>
                        </li>
                      )}
                      {scores.processing < 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">→</span>
                          <span><strong>{t('brainAssessment.results.focusProcessing')}:</strong> {scores.processing < 50 ? t('brainAssessment.results.focusProcessingSevere') : t('brainAssessment.results.focusProcessingMild')}</span>
                        </li>
                      )}
                      {scores.clarity < 75 && (
                        <li className="flex items-start gap-2">
                          <span className="text-amber-600 mt-0.5">→</span>
                          <span><strong>{t('brainAssessment.results.focusClarity')}:</strong> {scores.clarity < 50 ? t('brainAssessment.results.focusClaritySevere') : t('brainAssessment.results.focusClarityMild')}</span>
                        </li>
                      )}
                      {scores.memory >= 75 && scores.focus >= 75 && scores.processing >= 75 && scores.clarity >= 75 && (
                        <li className="text-muted-foreground italic">
                          {t('brainAssessment.results.allExcellent')}
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Personalized Recommendations */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    {t('brainAssessment.results.actionPlan')}
                  </CardTitle>
                  <CardDescription>
                    {t('brainAssessment.results.actionPlanDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {journeyContext === 'menopause' ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-2 text-primary">1. Hormone Health Assessment</h4>
                        <p className="text-sm text-muted-foreground">
                          Given your menopause-related cognitive changes, comprehensive hormone testing (estrogen, progesterone, testosterone, thyroid) is essential. Declining estrogen directly impacts brain function, neurotransmitter production, and neuroplasticity.
                        </p>
                      </div>
                      {scores.clarity < 75 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2 text-primary">2. Brain Fog Protocol</h4>
                          <p className="text-sm text-muted-foreground">
                            Your brain fog score indicates this is affecting your daily function. Consider: Omega-3 supplementation (2g EPA/DHA daily), B-vitamin complex, adequate protein intake (1.2-1.6g/kg bodyweight), and stress management techniques. Clinical research shows these interventions significantly reduce menopause-related cognitive fog.
                          </p>
                        </div>
                      )}
                      {scores.memory < 75 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2 text-primary">3. Memory Support Strategy</h4>
                          <p className="text-sm text-muted-foreground">
                            Implement daily cognitive exercises (15-20 mins), ensure 7-9 hours quality sleep, consider phosphatidylserine supplementation (300mg daily), and practice memory techniques like spaced repetition. Regular aerobic exercise (150 mins/week) has shown to specifically improve hippocampal function and memory during menopause.
                          </p>
                        </div>
                      )}
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-2 text-primary">{scores.memory < 75 && scores.clarity < 75 ? "4" : scores.clarity < 75 || scores.memory < 75 ? "3" : "2"}. Sleep Optimization</h4>
                        <p className="text-sm text-muted-foreground">
                          Poor sleep compounds cognitive challenges. Prioritize: consistent sleep schedule, cool room temperature (16-19°C), magnesium glycinate (300-400mg before bed), and consider CBT-I if insomnia persists. Address night sweats with breathable bedding and temperature regulation strategies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {scores.focus < 75 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2 text-primary">1. Attention & Focus Enhancement</h4>
                          <p className="text-sm text-muted-foreground">
                            Implement structured focus training: Pomodoro technique (25-min focused work blocks), environmental optimization (minimize distractions, use noise-cancelling when needed), and consider L-theanine + caffeine combination (200mg + 100mg) for acute focus needs. Regular meditation practice (10-20 mins daily) significantly improves sustained attention within 8 weeks.
                          </p>
                        </div>
                      )}
                      {scores.processing < 75 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2 text-primary">{scores.focus < 75 ? "2" : "1"}. Processing Speed Training</h4>
                          <p className="text-sm text-muted-foreground">
                            Engage in specific cognitive training: speed reading practice, dual n-back training (15 mins daily), and quick decision-making exercises. Ensure optimal metabolic support with adequate B-vitamins, iron status check (ferritin should be {'>'}50ng/mL), and maintain stable blood glucose. High-intensity interval training (HIIT) 3x/week improves processing speed via BDNF upregulation.
                          </p>
                        </div>
                      )}
                      {scores.memory < 75 && (
                        <div className="p-4 bg-primary/5 rounded-lg">
                          <h4 className="font-semibold mb-2 text-primary">{[scores.focus < 75, scores.processing < 75].filter(Boolean).length + 1}. Memory Optimization</h4>
                          <p className="text-sm text-muted-foreground">
                            Implement evidence-based memory techniques: spaced repetition for learning, mnemonic devices, and regular recall practice. Nutritional support: phosphatidylserine (300mg), omega-3s (2g combined EPA/DHA), and Bacopa monnieri (300mg standardized extract). Ensure 7-9 hours sleep as memory consolidation occurs during deep sleep phases.
                          </p>
                        </div>
                      )}
                      <div className="p-4 bg-primary/5 rounded-lg">
                        <h4 className="font-semibold mb-2 text-primary">{[scores.focus < 75, scores.processing < 75, scores.memory < 75].filter(Boolean).length + 1}. Lifestyle Foundation</h4>
                        <p className="text-sm text-muted-foreground">
                          Regardless of your current performance, maintaining optimal brain health requires: 150 mins moderate aerobic exercise weekly, 7-9 hours quality sleep, stress management practices, social engagement, Mediterranean-style diet rich in polyphenols, and continuous learning activities. These foundational practices prevent cognitive decline and enhance neuroplasticity.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-primary" />
                    Recommended Next Steps
                  </h3>
                  <ol className="space-y-2 text-sm list-decimal list-inside">
                    <li>Review your detailed results above and identify your top 1-2 priority areas</li>
                    <li>Start with the first recommendation from your action plan within the next 48 hours</li>
                    <li>Track your progress daily to monitor improvements and adjust strategies</li>
                    <li>Consider booking a consultation with a healthcare provider specializing in cognitive health</li>
                    <li>Reassess your cognitive performance in 4-6 weeks to measure progress</li>
                  </ol>
                </CardContent>
              </Card>

              <div className="text-center space-y-4">
                <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full md:w-auto">
                  {t('brainAssessment.viewDashboard')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('brainAssessment.resultsSaved')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <currentQ.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">{currentQ.category}</div>
                <CardTitle className="text-xl">{currentQ.question}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup 
              key={currentQuestion}
              value={answers[currentQuestion]} 
              onValueChange={handleAnswerChange}
            >
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    answers[currentQuestion] === option.value
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => handleAnswerChange(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleBack}
                disabled={currentQuestion === 0}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                className="flex-1"
              >
                {currentQuestion === questions.length - 1 ? t('brainAssessment.viewResults') : t('common.next')}
                {currentQuestion !== questions.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrainAssessment;
