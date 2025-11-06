import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { useAuth } from "@/hooks/useAuth";
import { HORMONE_COMPASS_ASSESSMENT, calculateHormoneStage } from "@/data/hormoneCompassAssessment";
import { Moon, ArrowLeft, CheckCircle, Home } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function HormoneCompassAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackSymptom: _trackSymptom } = useHormoneCompass();
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const currentDomain = HORMONE_COMPASS_ASSESSMENT.domains[currentDomainIndex];
  const currentQuestion = currentDomain.questions[currentQuestionIndex];
  const totalQuestions = HORMONE_COMPASS_ASSESSMENT.domains.reduce(
    (sum, domain) => sum + domain.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        title: "Please answer the question",
        description: "Select a value on the scale to continue",
        variant: "destructive"
      });
      return;
    }

    // Move to next question or domain
    if (currentQuestionIndex < currentDomain.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentDomainIndex < HORMONE_COMPASS_ASSESSMENT.domains.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment complete
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1);
      const prevDomain = HORMONE_COMPASS_ASSESSMENT.domains[currentDomainIndex - 1];
      setCurrentQuestionIndex(prevDomain.questions.length - 1);
    }
  };

  const handleComplete = async () => {
    setIsCalculating(true);

    try {
      // Calculate stage
      const result = calculateHormoneStage(answers);

      if (!user) {
        // For guest users, just navigate with state
        navigate('/hormone-compass/results', {
          state: {
            stage: result.stage,
            confidence: result.confidence,
            answers
          }
        });
        return;
      }

      // Save assessment to database for authenticated users
      const { data: stageData, error } = await supabase
        .from('hormone_compass_stages')
        .insert({
          user_id: user.id,
          stage: result.stage,
          confidence_score: result.confidence,
          hormone_indicators: { 
            domainScores: answers,
            avgScore: result.avgScore,
            completedAt: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (error) throw error;

      // Navigate with assessment ID for fetching from database
      navigate(`/hormone-compass/results?assessmentId=${stageData.id}`);
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const isLastQuestion = 
    currentDomainIndex === HORMONE_COMPASS_ASSESSMENT.domains.length - 1 &&
    currentQuestionIndex === currentDomain.questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Minimal Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(user ? '/dashboard' : '/');
                }
              }}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Exit
            </Button>
            
            <span className="text-sm text-muted-foreground font-medium">
              {answeredQuestions + 1} of {totalQuestions}
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Domain Context Badge */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-2xl">{currentDomain.icon}</span>
            <span className="text-sm font-medium">{currentDomain.name}</span>
          </div>
        </div>
      </div>

      {/* Main Question Display - Centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-180px)] px-4 py-12">
        <div className="w-full max-w-3xl space-y-8 animate-fade-in">
          {/* Question Text - Large & Prominent */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              {currentQuestion.text}
            </h2>
          </div>

          {/* Answer Cards - Scale Options as Large Interactive Tiles */}
          <div className="grid grid-cols-1 gap-3 animate-scale-in">
            {Array.from(
              { length: currentQuestion.scale.max - currentQuestion.scale.min + 1 }, 
              (_, i) => currentQuestion.scale.min + i
            ).map((value) => {
              const isSelected = answers[currentQuestion.id] === value;
              const isMin = value === currentQuestion.scale.min;
              const isMax = value === currentQuestion.scale.max;
              const label = isMin ? currentQuestion.scale.minLabel : isMax ? currentQuestion.scale.maxLabel : '';
              const scorePercent = ((value - currentQuestion.scale.min) / (currentQuestion.scale.max - currentQuestion.scale.min)) * 100;
              const barColor = scorePercent >= 66 ? 'bg-green-500' : scorePercent >= 33 ? 'bg-yellow-500' : 'bg-red-500';
              
              return (
                <Card
                  key={value}
                  className={`cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                    isSelected
                      ? 'border-purple-500 border-2 bg-purple-500/10 shadow-md'
                      : 'border-border hover:border-purple-500/50'
                  }`}
                  onClick={() => {
                    handleAnswer(value);
                    // Auto-advance after 400ms
                    setTimeout(() => handleNext(), 400);
                  }}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    {/* Value Badge */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isSelected ? 'bg-purple-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {value}
                    </div>
                    
                    {/* Label & Bar */}
                    <div className="flex-1 space-y-2">
                      {label && (
                        <h4 className="font-semibold text-base leading-relaxed">
                          {label}
                        </h4>
                      )}
                      
                      {/* Color-coded Score Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-300`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                      </div>
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
              disabled={currentDomainIndex === 0 && currentQuestionIndex === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {/* Show button if answer is selected */}
            {answers[currentQuestion.id] && (
              <Button
                onClick={handleNext}
                disabled={isCalculating}
                size="lg"
                className="gap-2"
              >
                {isLastQuestion ? (
                  <>
                    {isCalculating ? "Calculating..." : "Complete"}
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Domain Progress Indicators */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {HORMONE_COMPASS_ASSESSMENT.domains.map((domain, index) => (
          <div
            key={domain.id}
            className={`h-2 w-12 rounded-full transition-all ${
              index < currentDomainIndex
                ? 'bg-purple-500'
                : index === currentDomainIndex
                ? 'bg-purple-500/50'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
