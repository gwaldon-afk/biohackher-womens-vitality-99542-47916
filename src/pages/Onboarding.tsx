import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, X, Brain, Heart, Activity, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/hooks/use-toast";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { supabase } from "@/integrations/supabase/client";

interface QuestionOption {
  text: string;
  score_value: number;
  ai_analysis: string;
}

interface Question {
  question_id: string;
  pillar: string;
  text: string;
  options: QuestionOption[];
}

interface BaselineData {
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    question_id: "Q1_SleepDuration",
    pillar: "Body",
    text: "On average over the past week, how many hours of sleep did you get per night?",
    options: [
      { text: "Less than 5 hours or more than 10 hours", score_value: 0, ai_analysis: "Critical Risk" },
      { text: "5.1–6.0 hours or 9.1–10.0 hours", score_value: 30, ai_analysis: "High Risk" },
      { text: "6.1–6.9 hours or 8.1–9.0 hours", score_value: 70, ai_analysis: "Near Optimal" },
      { text: "7.0–8.0 hours", score_value: 100, ai_analysis: "Optimal Range" }
    ]
  },
  {
    question_id: "Q2_SubjectiveSleepQuality",
    pillar: "Body",
    text: "How would you rate the quality of your sleep over the past week?",
    options: [
      { text: "Poor (Restless, unrefreshing)", score_value: 0, ai_analysis: "Critical" },
      { text: "Fair (Occasionally restless)", score_value: 30, ai_analysis: "Suboptimal" },
      { text: "Good (Generally refreshed)", score_value: 70, ai_analysis: "Protective" },
      { text: "Excellent (Deeply restorative)", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q3_Activity",
    pillar: "Body",
    text: "What best describes your daily physical activity level?",
    options: [
      { text: "Less than 2,000 steps or minimal movement", score_value: 0, ai_analysis: "Critical Risk" },
      { text: "2,000–4,000 steps or less than 15 minutes of activity", score_value: 30, ai_analysis: "High Risk" },
      { text: "4,000–7,999 steps or 15–29 minutes of moderate activity", score_value: 70, ai_analysis: "Protective" },
      { text: "8,000+ steps or ≥ 30 minutes of moderate exercise", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q4_NutritionQuality",
    pillar: "Body",
    text: "What proportion of your diet comes from whole, unprocessed foods?",
    options: [
      { text: "Less than 30% whole foods (Mostly processed)", score_value: 0, ai_analysis: "Critical Risk" },
      { text: "30–50% whole foods (Mixed intake)", score_value: 30, ai_analysis: "Insufficient" },
      { text: "50–70% whole foods (Balanced)", score_value: 70, ai_analysis: "Protective" },
      { text: "> 70% whole foods (Strict adherence)", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q11_SmokingStatus",
    pillar: "Body",
    text: "What is your current smoking status? (Includes vaping)",
    options: [
      { text: "Current Smoker (Daily or occasional)", score_value: 0, ai_analysis: "Maximum Penalty" },
      { text: "Former Smoker (Quit less than 1 year ago)", score_value: 30, ai_analysis: "High Penalty" },
      { text: "Former Smoker (Quit more than 1 year ago)", score_value: 70, ai_analysis: "Minimal Penalty" },
      { text: "Never Smoked", score_value: 100, ai_analysis: "Zero Penalty" }
    ]
  },
  {
    question_id: "Q5_SubjectiveAge",
    pillar: "Balance",
    text: "How old do you feel compared to your chronological age?",
    options: [
      { text: "More than 5 years older", score_value: 0, ai_analysis: "Critical Risk" },
      { text: "1–4 years older", score_value: 40, ai_analysis: "Increased Risk" },
      { text: "My age or slightly younger (0-4 years)", score_value: 80, ai_analysis: "Protective" },
      { text: "≥ 5 years younger", score_value: 100, ai_analysis: "Major Protective Factor" }
    ]
  },
  {
    question_id: "Q6_SubjectiveCalmness",
    pillar: "Balance",
    text: "How mentally recovered and calm do you feel this morning? (0-10 scale)",
    options: [
      { text: "0–3 (Extremely stressed)", score_value: 0, ai_analysis: "Critical" },
      { text: "4–5 (Moderately stressed)", score_value: 30, ai_analysis: "Elevated Risk" },
      { text: "6–7 (Generally calm)", score_value: 70, ai_analysis: "Protective" },
      { text: "8–10 (Highly calm and recovered)", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q7_SocialConnection",
    pillar: "Balance",
    text: "How often do you feel connected and supported by others?",
    options: [
      { text: "Rarely or Never (Often feel isolated)", score_value: 0, ai_analysis: "Critical Risk" },
      { text: "Sometimes (Periods of loneliness)", score_value: 30, ai_analysis: "Moderate Risk" },
      { text: "Generally Supported (Connected most of the time)", score_value: 70, ai_analysis: "Protective" },
      { text: "Highly Engaged (Consistently supported)", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q8_EmotionalResilience",
    pillar: "Balance",
    text: "How do you handle unexpected challenges?",
    options: [
      { text: "Often overwhelmed and pessimistic", score_value: 0, ai_analysis: "Critical" },
      { text: "Sometimes struggle and become reactive", score_value: 30, ai_analysis: "Moderate" },
      { text: "Generally resilient with measured responses", score_value: 70, ai_analysis: "Protective" },
      { text: "Highly resilient with positive outlook", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q9_CognitiveEngagement",
    pillar: "Brain",
    text: "How much time daily do you dedicate to focused cognitive tasks?",
    options: [
      { text: "Less than 15 minutes", score_value: 0, ai_analysis: "Critical" },
      { text: "15–30 minutes", score_value: 30, ai_analysis: "Minimal" },
      { text: "30–60 minutes", score_value: 70, ai_analysis: "Moderate" },
      { text: "≥ 60 minutes", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q10_MeditationAdherence",
    pillar: "Brain",
    text: "What's your average daily meditation or mindfulness practice?",
    options: [
      { text: "0 minutes (None)", score_value: 0, ai_analysis: "None" },
      { text: "1–9 minutes (Inconsistent)", score_value: 25, ai_analysis: "Minimal" },
      { text: "10–19 minutes (Daily adherence)", score_value: 70, ai_analysis: "Protective" },
      { text: "≥ 20 minutes (Deep practice)", score_value: 100, ai_analysis: "Optimal" }
    ]
  },
  {
    question_id: "Q12_SkinHealth",
    pillar: "Beauty",
    text: "How would you describe your skin and hair health?",
    options: [
      { text: "Poor (Dull, inflamed, significant issues)", score_value: 0, ai_analysis: "Critical" },
      { text: "Fair (Occasional issues, lacks vitality)", score_value: 30, ai_analysis: "Suboptimal" },
      { text: "Good (Generally healthy, minor concerns)", score_value: 70, ai_analysis: "Protective" },
      { text: "Excellent (Vibrant, clear, healthy)", score_value: 100, ai_analysis: "Optimal" }
    ]
  }
];

const PILLAR_ICONS: Record<string, any> = {
  Body: Activity,
  Balance: Heart,
  Brain: Brain,
  Beauty: Sparkles
};

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0); // 0 for baseline, 1-12 for questions, 13 for completion
  const [baselineData, setBaselineData] = useState<BaselineData>({
    dateOfBirth: '',
    heightCm: '',
    weightKg: ''
  });
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeOnboarding, updateProgress } = useUserProgress();
  const { toast } = useToast();
  const { createOrUpdateProfile } = useHealthProfile();

  const totalSteps = 14; // 1 baseline + 12 questions + 1 completion
  const progress = (currentStep / totalSteps) * 100;

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (): number => {
    const height = parseFloat(baselineData.heightCm);
    const weight = parseFloat(baselineData.weightKg);
    if (height && weight) {
      return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
    }
    return 0;
  };

  const calculateScore = () => {
    let smokingPenaltyPercent = 0;

    const pillarScores: Record<string, { score: number; count: number }> = {
      Body: { score: 0, count: 0 },
      Balance: { score: 0, count: 0 },
      Brain: { score: 0, count: 0 },
      Beauty: { score: 0, count: 0 }
    };

    Object.entries(answers).forEach(([questionId, option]) => {
      const q = ASSESSMENT_QUESTIONS.find(q => q.question_id === questionId);
      if (q) {
        const pillar = q.pillar;
        if (pillarScores[pillar]) {
          pillarScores[pillar].score += option.score_value;
          pillarScores[pillar].count += 1;
        }
      }

      // Apply smoking penalties
      if (questionId === 'Q11_SmokingStatus') {
        if (option.text.includes('Current Smoker')) {
          smokingPenaltyPercent = 0.60;
        } else if (option.text.includes('less than 1 year')) {
          smokingPenaltyPercent = 0.30;
        } else if (option.text.includes('more than 1 year')) {
          smokingPenaltyPercent = 0.15;
        }
      }
    });

    // Calculate average pillar scores
    const pillarAverages: Record<string, number> = {};
    Object.entries(pillarScores).forEach(([pillar, data]) => {
      pillarAverages[pillar] = data.count > 0 ? Math.round(data.score / data.count) : 0;
    });

    // Final score is average of pillar scores
    const pillarValues = Object.values(pillarAverages);
    const averagePillarScore = pillarValues.length > 0 
      ? pillarValues.reduce((sum, score) => sum + score, 0) / pillarValues.length 
      : 0;
    
    // Apply smoking penalty
    const scoreAfterPenalty = averagePillarScore * (1 - smokingPenaltyPercent);
    const finalScore = Math.max(0, Math.round(scoreAfterPenalty));

    return {
      finalScore,
      pillarScores: pillarAverages,
      smokingPenalty: Math.round(averagePillarScore * smokingPenaltyPercent)
    };
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Validate baseline data
      if (!baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg) {
        toast({ title: "Please fill in all baseline information", variant: "destructive" });
        return;
      }
      
      const age = calculateAge(baselineData.dateOfBirth);
      if (age < 18 || age > 120) {
        toast({ title: "Please enter a valid date of birth", variant: "destructive" });
        return;
      }

      if (parseFloat(baselineData.heightCm) < 100 || parseFloat(baselineData.heightCm) > 250) {
        toast({ title: "Please enter a valid height (100-250 cm)", variant: "destructive" });
        return;
      }

      if (parseFloat(baselineData.weightKg) < 30 || parseFloat(baselineData.weightKg) > 300) {
        toast({ title: "Please enter a valid weight (30-300 kg)", variant: "destructive" });
        return;
      }
    }

    if (currentStep >= 1 && currentStep <= 12) {
      // Check if current question is answered
      const questionIndex = currentStep - 1;
      const question = ASSESSMENT_QUESTIONS[questionIndex];
      if (!answers[question.question_id]) {
        toast({ title: "Please select an answer", variant: "destructive" });
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      if (user) {
        await updateProgress({ onboarding_step: currentStep + 1 });
      }
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      const scoreData = calculateScore();
      const age = calculateAge(baselineData.dateOfBirth);

      // Save baseline assessment to daily_scores
      await supabase.from('daily_scores').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        longevity_impact_score: scoreData.finalScore,
        biological_age_impact: scoreData.finalScore,
        is_baseline: true,
        assessment_type: 'onboarding_baseline',
        user_chronological_age: age,
        lis_version: 'LIS 2.0',
        color_code: scoreData.finalScore >= 75 ? 'green' : scoreData.finalScore >= 50 ? 'yellow' : 'red'
      });

      // Save baseline data to user_health_profile
      await createOrUpdateProfile({
        date_of_birth: baselineData.dateOfBirth,
        height_cm: parseFloat(baselineData.heightCm),
        weight_kg: parseFloat(baselineData.weightKg),
        initial_subjective_age_delta: answers['Q5_SubjectiveAge']?.score_value || 0,
      });

      // Save measurement system to profile
      await supabase.from('profiles').update({
        measurement_system: 'metric'
      }).eq('user_id', user.id);

      // Mark onboarding as complete
      await completeOnboarding();

      toast({
        title: "Welcome to BiohackHer! 🎉",
        description: `Your baseline Longevity Impact Score: ${scoreData.finalScore}`,
      });

      // Navigate to dashboard Goals tab to set first goals
      navigate("/dashboard?tab=goals");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error saving assessment",
        description: "Please try again or contact support.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerSelect = (option: QuestionOption) => {
    if (currentStep === 0 || currentStep > 12) return;
    const questionIndex = currentStep - 1;
    const question = ASSESSMENT_QUESTIONS[questionIndex];
    setAnswers(prev => ({
      ...prev,
      [question.question_id]: option
    }));
  };

  const renderStep = () => {
    // Baseline data collection
    if (currentStep === 0) {
      return (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Let's Start With Your Baseline</CardTitle>
            <CardDescription>
              This information helps us calculate your personalized Longevity Impact Score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={baselineData.dateOfBirth}
                onChange={(e) => setBaselineData({ ...baselineData, dateOfBirth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  value={baselineData.heightCm}
                  onChange={(e) => setBaselineData({ ...baselineData, heightCm: e.target.value })}
                  min="100"
                  max="250"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="65"
                  value={baselineData.weightKg}
                  onChange={(e) => setBaselineData({ ...baselineData, weightKg: e.target.value })}
                  min="30"
                  max="300"
                />
              </div>
            </div>
            {baselineData.heightCm && baselineData.weightKg && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Your BMI: <span className="font-semibold text-foreground">{calculateBMI()}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Questions
    if (currentStep >= 1 && currentStep <= 12) {
      const questionIndex = currentStep - 1;
      const question = ASSESSMENT_QUESTIONS[questionIndex];
      const PillarIcon = PILLAR_ICONS[question.pillar] || Activity;
      const selectedAnswer = answers[question.question_id];

      return (
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <PillarIcon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-xs font-semibold text-primary mb-2">
              {question.pillar.toUpperCase()} PILLAR
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold leading-tight">
              {question.text}
            </CardTitle>
            <CardDescription>
              Question {currentStep} of {ASSESSMENT_QUESTIONS.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Answer Cards - Large Interactive Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
              {question.options.map((option, idx) => {
                const isSelected = selectedAnswer?.text === option.text;
                const scorePercent = option.score_value;
                const barColor = scorePercent >= 75 ? 'bg-green-500' : scorePercent >= 50 ? 'bg-yellow-500' : 'bg-red-500';
                
                return (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isSelected
                        ? 'border-primary border-2 bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      handleAnswerSelect(option);
                      // Auto-advance after 400ms
                      setTimeout(() => handleNext(), 400);
                    }}
                  >
                    <CardContent className="p-6 text-center space-y-3">
                      {/* Option Text */}
                      <h4 className="font-semibold text-base leading-relaxed">
                        {option.text}
                      </h4>
                      
                      {/* Color-coded Score Bar */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-300`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">
                          {scorePercent}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      );
    }

    // Completion screen
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text">Assessment Complete!</CardTitle>
          <CardDescription>
            We're calculating your personalized Longevity Impact Score
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <Brain className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold">Brain</h3>
              <p className="text-xs text-muted-foreground">Mental clarity & focus</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <Activity className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold">Body</h3>
              <p className="text-xs text-muted-foreground">Physical vitality</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <Heart className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold">Balance</h3>
              <p className="text-xs text-muted-foreground">Inner calm & peace</p>
            </div>
            <div className="p-4 rounded-lg border bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
              <Sparkles className="h-8 w-8 text-pink-600 mb-2" />
              <h3 className="font-semibold">Beauty</h3>
              <p className="text-xs text-muted-foreground">Radiant appearance</p>
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-center space-y-2">
            <p className="font-semibold">Your personalized health journey starts now</p>
            <p className="text-sm text-muted-foreground">
              You'll see your baseline score and get personalized recommendations
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const isNextDisabled = () => {
    if (currentStep === 0) {
      return !baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg;
    }
    if (currentStep >= 1 && currentStep <= 12) {
      const questionIndex = currentStep - 1;
      const question = ASSESSMENT_QUESTIONS[questionIndex];
      return !answers[question.question_id];
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">BH</span>
            </div>
            <span className="font-semibold">BiohackHer</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {currentStep === 0 ? "Baseline Information" : currentStep > 12 ? "Complete" : `Question ${currentStep} of ${ASSESSMENT_QUESTIONS.length}`}
            </span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={isNextDisabled()}
          >
            {currentStep === totalSteps - 1 ? "Complete" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
