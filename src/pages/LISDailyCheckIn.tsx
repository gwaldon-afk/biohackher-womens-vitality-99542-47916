import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity, Brain, Heart, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QuestionOption {
  text: string;
  score_value: number;
  emoji?: string;
}

interface Question {
  question_id: string;
  pillar: string;
  text: string;
  options: QuestionOption[];
}

// Shortened assessment - 5 most dynamic questions from the full LIS 2.0
const DAILY_QUESTIONS: Question[] = [
  {
    question_id: "Q1_SleepDuration",
    pillar: "Body",
    text: "How many hours of sleep did you get last night?",
    options: [
      { text: "Less than 5 hours or more than 10 hours", emoji: "😴", score_value: 0 },
      { text: "5-6 hours or 9-10 hours", emoji: "😪", score_value: 30 },
      { text: "6-7 hours or 8-9 hours", emoji: "😊", score_value: 70 },
      { text: "7-8 hours", emoji: "😌", score_value: 100 }
    ]
  },
  {
    question_id: "Q2_SubjectiveSleepQuality",
    pillar: "Body",
    text: "How would you rate your sleep quality last night?",
    options: [
      { text: "Poor (Restless, unrefreshing)", emoji: "😫", score_value: 0 },
      { text: "Fair (Occasionally restless)", emoji: "😐", score_value: 30 },
      { text: "Good (Generally refreshed)", emoji: "😊", score_value: 70 },
      { text: "Excellent (Deeply restorative)", emoji: "🤩", score_value: 100 }
    ]
  },
  {
    question_id: "Q3_Activity",
    pillar: "Body",
    text: "What was your physical activity level yesterday?",
    options: [
      { text: "Less than 2,000 steps or minimal movement", emoji: "🛋️", score_value: 0 },
      { text: "2,000-4,000 steps or <15 min activity", emoji: "🚶", score_value: 30 },
      { text: "4,000-7,999 steps or 15-29 min activity", emoji: "🏃", score_value: 70 },
      { text: "8,000+ steps or ≥30 min exercise", emoji: "💪", score_value: 100 }
    ]
  },
  {
    question_id: "Q6_SubjectiveCalmness",
    pillar: "Balance",
    text: "How mentally recovered and calm do you feel this morning?",
    options: [
      { text: "0-3 (Extremely stressed, anxious)", emoji: "😰", score_value: 0 },
      { text: "4-5 (Moderately stressed)", emoji: "😟", score_value: 30 },
      { text: "6-7 (Generally calm)", emoji: "😌", score_value: 70 },
      { text: "8-10 (Highly calm and clear)", emoji: "🧘", score_value: 100 }
    ]
  },
  {
    question_id: "Q9_CognitiveEngagement",
    pillar: "Brain",
    text: "How much time did you dedicate to focused cognitive tasks yesterday?",
    options: [
      { text: "Less than 15 minutes", emoji: "📱", score_value: 0 },
      { text: "15-30 minutes", emoji: "📖", score_value: 30 },
      { text: "30-60 minutes", emoji: "🧠", score_value: 70 },
      { text: "60+ minutes", emoji: "🎓", score_value: 100 }
    ]
  }
];

const PILLAR_ICONS = {
  Body: Activity,
  Balance: Heart,
  Brain: Brain
};

export default function LISDailyCheckIn() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    // Redirect to auth if not logged in
    navigate('/auth');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="text-lg font-semibold">Redirecting to sign in...</div>
          <p className="text-sm text-muted-foreground">
            Please sign in to complete your daily check-in.
          </p>
          <Button onClick={() => navigate('/auth')}>Go to Sign In</Button>
        </Card>
      </div>
    );
  }

  const question = DAILY_QUESTIONS[currentQuestion];
  const PillarIcon = PILLAR_ICONS[question.pillar as keyof typeof PILLAR_ICONS] || Activity;
  const progress = ((currentQuestion + 1) / DAILY_QUESTIONS.length) * 100;
  const selectedAnswer = answers[question.question_id];

  const handleAnswerSelect = (option: QuestionOption) => {
    setAnswers(prev => ({
      ...prev,
      [question.question_id]: option
    }));
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      toast.error('Please select an answer to continue');
      return;
    }

    if (currentQuestion < DAILY_QUESTIONS.length - 1) {
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
    const pillarScores: Record<string, { score: number; count: number }> = {
      Body: { score: 0, count: 0 },
      Balance: { score: 0, count: 0 },
      Brain: { score: 0, count: 0 }
    };

    Object.entries(answers).forEach(([questionId, option]) => {
      const q = DAILY_QUESTIONS.find(q => q.question_id === questionId);
      if (q) {
        const pillar = q.pillar;
        if (pillarScores[pillar]) {
          pillarScores[pillar].score += option.score_value;
          pillarScores[pillar].count += 1;
        }
      }
    });

    // Calculate averages for each pillar
    const pillarAverages: Record<string, number> = {};
    Object.entries(pillarScores).forEach(([pillar, data]) => {
      pillarAverages[pillar] = data.count > 0 ? Math.round(data.score / data.count) : 0;
    });

    // Overall score is average of all pillar scores
    const pillarValues = Object.values(pillarAverages);
    const finalScore = pillarValues.length > 0 
      ? Math.round(pillarValues.reduce((sum, score) => sum + score, 0) / pillarValues.length) 
      : 0;

    return {
      finalScore,
      pillarScores: pillarAverages
    };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const scoreData = calculateScore();

      // Save daily score
      const { error } = await supabase
        .from('daily_scores')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          longevity_impact_score: scoreData.finalScore,
          biological_age_impact: scoreData.finalScore,
          is_baseline: false,
          assessment_type: 'daily_tracking',
          lis_version: 'LIS 2.0',
          source_type: 'manual_entry',
          sleep_score: scoreData.pillarScores.Body || 0,
          stress_score: scoreData.pillarScores.Balance || 0,
          physical_activity_score: scoreData.pillarScores.Body || 0,
          cognitive_engagement_score: scoreData.pillarScores.Brain || 0,
          color_code: scoreData.finalScore >= 75 ? 'green' : scoreData.finalScore >= 50 ? 'yellow' : 'red'
        });

      if (error) {
        console.error('Error saving daily check-in:', error);
        toast.error('Failed to save check-in. Please try again.');
        return;
      }

      toast.success(`Daily LIS: ${scoreData.finalScore}/100`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Daily LIS Check-In
          </h1>
          <p className="text-muted-foreground">
            Track your daily longevity habits in under 2 minutes
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {DAILY_QUESTIONS.length}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-6 border-2">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 rounded-full bg-primary/10">
              <PillarIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-primary mb-2">
                {question.pillar} Pillar
              </div>
              <h2 className="text-xl font-semibold leading-relaxed">
                {question.text}
              </h2>
            </div>
          </div>

          <RadioGroup
            value={selectedAnswer?.text || ''}
            onValueChange={(value) => {
              const option = question.options.find(opt => opt.text === value);
              if (option) handleAnswerSelect(option);
            }}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
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
                  {option.emoji && <span className="mr-2 text-xl">{option.emoji}</span>}
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
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
              'Saving...'
            ) : currentQuestion === DAILY_QUESTIONS.length - 1 ? (
              'Complete Check-In'
            ) : (
              'Next'
            )}
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          Daily check-ins help track your longevity trajectory over time
        </p>
      </div>
    </div>
  );
}
