import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Activity, Brain, Heart, Home, ArrowLeft, ArrowRight } from 'lucide-react';
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
    return null;
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
      {/* Minimal Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Exit
            </Button>
            
            <span className="text-sm text-muted-foreground font-medium">
              {currentQuestion + 1} of {DAILY_QUESTIONS.length}
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Pillar Context Badge */}
          <div className="flex items-center gap-2 mt-3">
            <PillarIcon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">{question.pillar}</span>
          </div>
        </div>
      </div>

      {/* Main Question Display - Centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)] px-4 py-12">
        <div className="w-full max-w-3xl space-y-8 animate-fade-in">
          {/* Question Text - Large & Prominent */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {question.text}
            </h2>
          </div>

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
                  <CardContent className="p-6 text-center space-y-4">
                    {/* Large Emoji */}
                    {option.emoji && (
                      <div className="text-6xl animate-scale-in">
                        {option.emoji}
                      </div>
                    )}
                    
                    {/* Option Text - No letter prefix */}
                    <h4 className="font-semibold text-lg leading-relaxed">
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

          {/* Navigation - Minimal */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Only show Continue if no selection (no auto-advance) */}
            {selectedAnswer && !isSubmitting && (
              <Button
                onClick={handleNext}
                size="lg"
                className="gap-2"
              >
                {currentQuestion === DAILY_QUESTIONS.length - 1 ? 'Complete' : 'Continue'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
