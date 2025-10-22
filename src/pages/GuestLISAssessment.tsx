import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Heart, Activity, Sparkles, User } from 'lucide-react';
import { SmartSlider } from '@/components/assessments/SmartSlider';

interface QuestionOption {
  text: string;
  score_value: number;
  ai_analysis: string;
  emoji?: string;
}

interface Question {
  question_id: string;
  pillar: string;
  text: string;
  type: 'radio' | 'slider';
  options: QuestionOption[];
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    question_id: "Q1_SleepDuration",
    pillar: "Body",
    type: "slider",
    text: "On average over the past week, how many hours of sleep did you get per night?",
    options: [
      {
        text: "A. Less than 5 hours or more than 10 hours",
        emoji: "😴",
        score_value: 0,
        ai_analysis: "Critical Risk. Extreme deviation from optimal sleep duration, associated with significantly elevated mortality risk and impaired biological repair."
      },
      {
        text: "B. 5.1–6.0 hours or 9.1–10.0 hours",
        emoji: "😪",
        score_value: 30,
        ai_analysis: "High Risk. Clear deviation from the narrow 7-8 hour optimal window, incurring a steep point reduction reflecting a measurable increase in risk."
      },
      {
        text: "C. 6.1–6.9 hours or 8.1–9.0 hours",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Near Optimal. While close, this is outside the tightest protective window, suggesting adequate repair but missing the point of lowest measured mortality risk."
      },
      {
        text: "D. 7.0–8.0 hours",
        emoji: "😌",
        score_value: 100,
        ai_analysis: "Optimal Range. This narrow window is consistently linked to the lowest all-cause mortality risk and efficient biological repair processes, maximizing the score."
      }
    ]
  },
  {
    question_id: "Q2_SubjectiveSleepQuality",
    pillar: "Body",
    type: "slider",
    text: "How would you rate the restorative quality (depth, feeling of repair) of your sleep over the past week?",
    options: [
      {
        text: "A. Poor (Restless, unrefreshing)",
        emoji: "😫",
        score_value: 0,
        ai_analysis: "Critical. Poor sleep quality undermines all restorative processes regardless of duration."
      },
      {
        text: "B. Fair (Occasionally restless)",
        emoji: "😐",
        score_value: 30,
        ai_analysis: "Suboptimal. Frequent disruptions prevent deep restorative sleep phases."
      },
      {
        text: "C. Good (Generally refreshed)",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Protective. Sleep quality supports most biological repair processes effectively."
      },
      {
        text: "D. Excellent (Deeply restorative)",
        emoji: "🤩",
        score_value: 100,
        ai_analysis: "Optimal. Maximizes all restorative and repair processes during sleep."
      }
    ]
  },
  {
    question_id: "Q3_Activity",
    pillar: "Body",
    type: "slider",
    text: "On an average day, which of the following best describes your physical activity level (steps or active minutes)?",
    options: [
      {
        text: "A. Less than 2,000 steps or minimal movement",
        emoji: "🛋️",
        score_value: 0,
        ai_analysis: "Critical Risk. Sedentary behavior is strongly associated with accelerated biological aging and increased mortality risk."
      },
      {
        text: "B. 2,000–4,000 steps or less than 15 minutes of activity",
        emoji: "🚶",
        score_value: 30,
        ai_analysis: "High Risk. Below the minimum threshold for cardiovascular and metabolic health protection."
      },
      {
        text: "C. 4,000–7,999 steps or 15–29 minutes of moderate activity",
        emoji: "🏃",
        score_value: 70,
        ai_analysis: "Protective Threshold. Meets minimum activity requirements for health maintenance."
      },
      {
        text: "D. 8,000+ steps or ≥ 30 minutes of moderate exercise",
        emoji: "💪",
        score_value: 100,
        ai_analysis: "Maximal Benefit. This volume reaches the step-count saturation point for younger adults, and the 30-minute duration is associated with a 17% reduction in annual deaths, earning full credit."
      }
    ]
  },
  {
    question_id: "Q4_NutritionQuality",
    pillar: "Body",
    type: "slider",
    text: "What proportion of your daily food intake comes from whole, unprocessed sources (vegetables, fruits, lean protein, healthy fats)?",
    options: [
      {
        text: "A. Less than 30% whole foods (Mostly processed)",
        emoji: "🍔",
        score_value: 0,
        ai_analysis: "Critical Risk. Diet dominated by ultra-processed foods drives chronic inflammation and metabolic dysfunction."
      },
      {
        text: "B. 30–50% whole foods (Mixed intake, frequent nutrient-poor meals)",
        emoji: "🍕",
        score_value: 30,
        ai_analysis: "Insufficient Density. Indicates potential chronic metabolic stress and insufficient micronutrient supply for optimal cellular repair."
      },
      {
        text: "C. 50–70% whole foods (Balanced, occasional treats)",
        emoji: "🥗",
        score_value: 70,
        ai_analysis: "Protective Pattern. Adherence to a generally protective dietary pattern associated with slower biological aging and good general health."
      },
      {
        text: "D. > 70% whole foods (Strict adherence to balanced, dense nutrition)",
        emoji: "🥬",
        score_value: 100,
        ai_analysis: "Maximum credit for a diet designed to minimize systemic inflammation and optimally support metabolic and cellular health."
      }
    ]
  },
  {
    question_id: "Q5_SubjectiveAge",
    pillar: "Balance",
    type: "slider",
    text: "Considering your energy, vitality, and mental clarity, how old do you genuinely feel compared to your chronological age?",
    options: [
      {
        text: "A. I feel more than 5 years older than my age.",
        emoji: "🧓",
        score_value: 0,
        ai_analysis: "Critical Risk. Large positive subjective age delta is a powerful predictor of mortality and biological aging acceleration."
      },
      {
        text: "B. I feel 1–4 years older than my age.",
        emoji: "😓",
        score_value: 40,
        ai_analysis: "Increased Risk. Positive subjective age delta, suggesting a perception of accelerating physical and mental decline, which is a known predictor of adverse outcomes."
      },
      {
        text: "C. I feel my age or slightly younger (0 to 4 years younger).",
        emoji: "😐",
        score_value: 80,
        ai_analysis: "Neutral/Protective. Reflects a stable self-assessment, establishing a strong baseline for mental health and resilience."
      },
      {
        text: "D. I feel ≥ 5 years younger than my age.",
        emoji: "✨",
        score_value: 100,
        ai_analysis: "Major Protective Factor. This negative delta correlates with a significant survival advantage, reflecting high vitality and optimal psychological health, which receives maximum score credit."
      }
    ]
  },
  {
    question_id: "Q6_SubjectiveCalmness",
    pillar: "Balance",
    type: "slider",
    text: "On a scale of 0 (Extremely Stressed) to 10 (Completely Recovered/Calm), how mentally recovered and calm do you feel this morning?",
    options: [
      {
        text: "A. 0–3 (Extremely stressed, anxious, or overwhelmed)",
        emoji: "😰",
        score_value: 0,
        ai_analysis: "Critical. Chronic high stress is a major driver of accelerated biological aging."
      },
      {
        text: "B. 4–5 (Moderately stressed, coping but not thriving)",
        emoji: "😟",
        score_value: 30,
        ai_analysis: "Elevated Risk. Persistent moderate stress undermines recovery and resilience."
      },
      {
        text: "C. 6–7 (Generally calm, occasional stress)",
        emoji: "😌",
        score_value: 70,
        ai_analysis: "Protective. Balanced stress management supports healthy aging trajectory."
      },
      {
        text: "D. 8–10 (Highly calm, recovered, and mentally clear)",
        emoji: "🧘",
        score_value: 100,
        ai_analysis: "Optimal. Reflects excellent autonomic balance and stress recovery capacity."
      }
    ]
  },
  {
    question_id: "Q7_SocialConnection",
    pillar: "Balance",
    type: "slider",
    text: "How often do you feel strongly connected and supported by your family, friends, or community?",
    options: [
      {
        text: "A. Rarely or Never (I often feel isolated)",
        emoji: "😔",
        score_value: 0,
        ai_analysis: "Critical Risk. Social isolation is as harmful as smoking 15 cigarettes per day in terms of mortality risk."
      },
      {
        text: "B. Sometimes (I experience periods of loneliness)",
        emoji: "🙂",
        score_value: 30,
        ai_analysis: "Moderate Risk. Intermittent lack of social support weakens the protective effect that strong social bonds offer against chronic stress."
      },
      {
        text: "C. Generally Supported (Connected most of the time)",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Protective Threshold. Meets the minimum requirement for utilizing social ties as an effective buffer against life stressors."
      },
      {
        text: "D. Highly Engaged (Feel consistently supported and connected)",
        emoji: "🤗",
        score_value: 100,
        ai_analysis: "Maximal Protection. This high level of social integration is linked to decelerated biological aging and maximal survival benefit, earning full credit."
      }
    ]
  },
  {
    question_id: "Q8_EmotionalResilience",
    pillar: "Balance",
    type: "slider",
    text: "Which statement best describes your emotional outlook and resilience when facing unexpected challenges?",
    options: [
      {
        text: "A. I often feel overwhelmed and highly pessimistic about the future.",
        emoji: "😞",
        score_value: 0,
        ai_analysis: "Captures elements of anxiety and fatalism that are statistically significant contributors to mortality risk, requiring the highest penalty."
      },
      {
        text: "B. I sometimes struggle to cope and can become reactive to stress.",
        emoji: "😐",
        score_value: 30,
        ai_analysis: "Suggests moderate vulnerability to psychological distress, requiring focused interventions to build mental fortitude."
      },
      {
        text: "C. I am generally resilient and handle challenges with measured thought.",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Represents a healthy capacity for psychological self-regulation and coping, supporting sustained well-being."
      },
      {
        text: "D. I am highly resilient and maintain a strong, positive, and proactive outlook.",
        emoji: "💪",
        score_value: 100,
        ai_analysis: "Maximal score. Optimistic outlook is a statistically powerful contributor to a healthy survival profile."
      }
    ]
  },
  {
    question_id: "Q9_CognitiveEngagement",
    pillar: "Brain",
    type: "slider",
    text: "On most days, how much time do you dedicate to focused cognitive tasks (learning, complex problem-solving, reading, etc.)?",
    options: [
      {
        text: "A. Less than 15 minutes",
        emoji: "📱",
        score_value: 0,
        ai_analysis: "Critical. Minimal cognitive stimulation is associated with accelerated cognitive decline."
      },
      {
        text: "B. 15–30 minutes",
        emoji: "📖",
        score_value: 30,
        ai_analysis: "Minimal Engagement. Serves as a baseline level of mental activity, but falls short of optimal stimulation for brain health."
      },
      {
        text: "C. 30–60 minutes",
        emoji: "🧠",
        score_value: 70,
        ai_analysis: "Moderate Engagement. Sufficient time dedicated to maintaining and enhancing cognitive function."
      },
      {
        text: "D. ≥ 60 minutes of focused cognitive activity",
        emoji: "🎓",
        score_value: 100,
        ai_analysis: "Highest credit for sustained intellectual stimulation, which is a lifestyle factor associated with slower epigenetic aging."
      }
    ]
  },
  {
    question_id: "Q10_MeditationAdherence",
    pillar: "Brain",
    type: "radio",
    text: "In the past seven days, what was your average daily practice time for meditation, mindful breathing, or conscious relaxation?",
    options: [
      {
        text: "A. 0 minutes (None)",
        emoji: "🤷",
        score_value: 0,
        ai_analysis: "Zero credit. Failure to engage in practices known to support the parasympathetic nervous system and stress reduction."
      },
      {
        text: "B. 1–9 minutes (Inconsistent practice)",
        emoji: "🧘‍♀️",
        score_value: 25,
        ai_analysis: "Adherence credit only. Duration is below the minimum effective dose required to reliably support autonomic balance."
      },
      {
        text: "C. 10–19 minutes (Daily adherence)",
        emoji: "🧘",
        score_value: 70,
        ai_analysis: "Meets Minimum Effective Dose (MED). Daily adherence of 10+ minutes is linked to supporting autonomic regulation and stress management, earning high conditional credit."
      },
      {
        text: "D. ≥ 20 minutes (Consistent, deep practice)",
        emoji: "🕉️",
        score_value: 100,
        ai_analysis: "Maximal adherence. Sustained, deep practice is associated with measurable physiological and neurological changes over time, maximizing the score for this input."
      }
    ]
  },
  {
    question_id: "Q11_SmokingStatus",
    pillar: "Body_Penalty",
    type: "radio",
    text: "What is your current smoking status? (This includes vaping nicotine products.)",
    options: [
      {
        text: "A. Current Smoker (Daily or occasional use)",
        emoji: "🚬",
        score_value: 0,
        ai_analysis: "Maximum Penalty Trigger. Current smoking is the single largest modifiable risk factor for accelerated epigenetic aging. Triggers a fixed -60 point penalty."
      },
      {
        text: "B. Former Smoker (Quit less than 1 year ago)",
        emoji: "🚭",
        score_value: 30,
        ai_analysis: "High Penalty Trigger. Residual risk is still significant. Triggers the fixed -30 point penalty reflecting high EAA sensitivity during the first year of cessation."
      },
      {
        text: "C. Former Smoker (Quit more than 1 year ago)",
        emoji: "✅",
        score_value: 70,
        ai_analysis: "Minimal Penalty Trigger. Risk declines substantially post-1 year. Triggers a minor -15 point penalty reflecting residual long-term EAA impact."
      },
      {
        text: "D. Never Smoked",
        emoji: "🌟",
        score_value: 100,
        ai_analysis: "Zero Penalty. This status provides the baseline zero-risk factor for this major lifestyle determinant, ensuring no penalty is applied."
      }
    ]
  },
  {
    question_id: "Q12_SkinHealth",
    pillar: "Beauty",
    type: "slider",
    text: "How would you describe the current health and vitality of your skin and hair? (A proxy for systemic inflammation and nutrient status).",
    options: [
      {
        text: "A. Poor (Dull, inflamed, significant issues)",
        emoji: "😟",
        score_value: 0,
        ai_analysis: "Critical. May indicate systemic inflammation and nutrient deficiencies affecting cellular health."
      },
      {
        text: "B. Fair (Occasional issues, lacks vitality)",
        emoji: "😐",
        score_value: 30,
        ai_analysis: "Suboptimal. Suggests potential nutrient gaps or inflammatory processes."
      },
      {
        text: "C. Good (Generally healthy, minor concerns)",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Protective. Reflects adequate nutrient status and controlled inflammation."
      },
      {
        text: "D. Excellent (Vibrant, clear, healthy)",
        emoji: "✨",
        score_value: 100,
        ai_analysis: "Optimal. External manifestation of optimal internal cellular health and nutrient status."
      }
    ]
  }
];

const PILLAR_ICONS = {
  Body: Activity,
  Balance: Heart,
  Brain: Brain,
  Beauty: Sparkles
};

interface BaselineData {
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
}

export default function GuestLISAssessment() {
  const navigate = useNavigate();
  const [showBaseline, setShowBaseline] = useState(true);
  const [baselineData, setBaselineData] = useState<BaselineData>({
    dateOfBirth: '',
    heightCm: '',
    weightKg: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleBaselineSubmit = () => {
    if (!baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg) {
      toast.error('Please fill in all baseline information');
      return;
    }

    const age = calculateAge(baselineData.dateOfBirth);
    if (age < 18 || age > 120) {
      toast.error('Please enter a valid date of birth');
      return;
    }

    if (parseFloat(baselineData.heightCm) < 100 || parseFloat(baselineData.heightCm) > 250) {
      toast.error('Please enter a valid height (100-250 cm)');
      return;
    }

    if (parseFloat(baselineData.weightKg) < 30 || parseFloat(baselineData.weightKg) > 300) {
      toast.error('Please enter a valid weight (30-300 kg)');
      return;
    }

    setShowBaseline(false);
  };

  const progress = showBaseline ? 0 : ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const question = !showBaseline ? ASSESSMENT_QUESTIONS[currentQuestion] : null;
  const PillarIcon = question ? PILLAR_ICONS[question.pillar.replace('_Penalty', '') as keyof typeof PILLAR_ICONS] || Activity : Activity;

  const handleAnswerSelect = (option: QuestionOption) => {
    if (!question) return;
    setAnswers(prev => ({
      ...prev,
      [question.question_id]: option
    }));
  };

  const handleNext = () => {
    if (!question || !answers[question.question_id]) {
      toast.error('Please select an answer to continue');
      return;
    }

    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let smokingPenaltyPercent = 0;

    Object.entries(answers).forEach(([questionId, option]) => {
      totalScore += option.score_value;

      // Apply smoking penalties as percentage reductions
      if (questionId === 'Q11_SmokingStatus') {
        if (option.text.includes('Current Smoker')) {
          smokingPenaltyPercent = 0.60; // 60% reduction for current smokers
        } else if (option.text.includes('less than 1 year')) {
          smokingPenaltyPercent = 0.30; // 30% reduction
        } else if (option.text.includes('more than 1 year')) {
          smokingPenaltyPercent = 0.15; // 15% reduction
        }
      }
    });

    // Calculate pillar scores first
    const pillarScores = calculatePillarScores();
    
    // Final score is the average of pillar scores
    const pillarValues = Object.values(pillarScores);
    const averagePillarScore = pillarValues.length > 0 
      ? pillarValues.reduce((sum, score) => sum + score, 0) / pillarValues.length 
      : 0;
    
    // Apply smoking penalty as percentage reduction
    const scoreAfterPenalty = averagePillarScore * (1 - smokingPenaltyPercent);
    const finalScore = Math.max(0, Math.round(scoreAfterPenalty));
    
    // Calculate absolute penalty amount for display
    const smokingPenalty = Math.round(averagePillarScore * smokingPenaltyPercent);

    return {
      finalScore,
      rawScore: totalScore,
      smokingPenalty,
      pillarScores
    };
  };

  const calculatePillarScores = () => {
    const pillarScores: Record<string, { score: number; count: number }> = {
      Body: { score: 0, count: 0 },
      Balance: { score: 0, count: 0 },
      Brain: { score: 0, count: 0 },
      Beauty: { score: 0, count: 0 }
    };

    Object.entries(answers).forEach(([questionId, option]) => {
      const q = ASSESSMENT_QUESTIONS.find(q => q.question_id === questionId);
      if (q) {
        const pillar = q.pillar.replace('_Penalty', '');
        if (pillarScores[pillar]) {
          pillarScores[pillar].score += option.score_value;
          pillarScores[pillar].count += 1;
        }
      }
    });

    // Calculate averages
    const result: Record<string, number> = {};
    Object.entries(pillarScores).forEach(([pillar, data]) => {
      result[pillar] = data.count > 0 ? Math.round(data.score / data.count) : 0;
    });

    return result;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const scoreData = calculateScore();
      const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare assessment data
      const assessmentData = {
        baselineData: {
          dateOfBirth: baselineData.dateOfBirth,
          age: calculateAge(baselineData.dateOfBirth),
          heightCm: parseFloat(baselineData.heightCm),
          weightKg: parseFloat(baselineData.weightKg),
          bmi: calculateBMI()
        },
        answers: Object.entries(answers).map(([questionId, option]) => ({
          questionId,
          answer: option.text,
          score: option.score_value,
          analysis: option.ai_analysis
        })),
        timestamp: new Date().toISOString()
      };

      const briefResults = {
        finalScore: scoreData.finalScore,
        pillarScores: scoreData.pillarScores,
        smokingPenalty: scoreData.smokingPenalty
      };

      // Save to guest_lis_assessments table
      const { error } = await supabase
        .from('guest_lis_assessments')
        .insert({
          session_id: sessionId,
          assessment_data: assessmentData,
          brief_results: briefResults
        });

      if (error) {
        console.error('Error saving guest assessment:', error);
        toast.error('Failed to save assessment. Please try again.');
        return;
      }

      // Navigate to results page
      navigate(`/guest-lis-results/${sessionId}`);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAnswer = question ? answers[question.question_id] : undefined;
  const bmi = calculateBMI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LIS 2.0 Longevity Assessment
          </h1>
          <p className="text-muted-foreground">
            Discover your science-backed Longevity Impact Score
          </p>
        </div>

        {/* Progress Bar */}
        {!showBaseline && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Baseline Data Collection or Question Card */}
        {showBaseline ? (
          <Card className="p-8 mb-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">Before We Begin</h2>
                <p className="text-muted-foreground">
                  We need a few baseline metrics to calculate your personalized Longevity Impact Score
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label htmlFor="dob" className="text-base mb-2 block">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={baselineData.dateOfBirth}
                  onChange={(e) => setBaselineData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-lg"
                />
                {baselineData.dateOfBirth && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Age: {calculateAge(baselineData.dateOfBirth)} years
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="height" className="text-base mb-2 block">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="e.g., 165"
                  value={baselineData.heightCm}
                  onChange={(e) => setBaselineData(prev => ({ ...prev, heightCm: e.target.value }))}
                  min="100"
                  max="250"
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="weight" className="text-base mb-2 block">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="e.g., 65"
                  value={baselineData.weightKg}
                  onChange={(e) => setBaselineData(prev => ({ ...prev, weightKg: e.target.value }))}
                  min="30"
                  max="300"
                  step="0.1"
                  className="text-lg"
                />
              </div>

              {bmi > 0 && (
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                  <p className="text-3xl font-bold text-primary">{bmi}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-8 mb-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <PillarIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-primary mb-2">
                  {question?.pillar.replace('_Penalty', '')} Pillar
                </div>
                <h2 className="text-xl font-semibold leading-relaxed">
                  {question?.text}
                </h2>
              </div>
            </div>

            <RadioGroup
              key={question?.question_id || currentQuestion}
              value={selectedAnswer?.text || ''}
              onValueChange={(value) => {
                const option = question?.options.find(opt => opt.text === value);
                if (option) handleAnswerSelect(option);
              }}
              className="space-y-3"
            >
              {question?.options.map((option, index) => (
                <div
                  key={index}
                  className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    selectedAnswer?.text === option.text
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem value={option.text} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          {showBaseline ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBaselineSubmit}
                disabled={!baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg}
                className="min-w-32"
              >
                Start Assessment
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  'Calculating...'
                ) : currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? (
                  'Get My Score'
                ) : (
                  'Next'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This assessment takes approximately 3 minutes to complete
        </p>
      </div>
    </div>
  );
}
