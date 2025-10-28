import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { HORMONE_COMPASS_ASSESSMENT, calculateHormoneStage } from "@/data/hormoneCompassAssessment";
import { Moon, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function HormoneCompassAssessment() {
  const navigate = useNavigate();
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

      // Navigate to results
      navigate('/hormone-compass/results', {
        state: {
          stage: result.stage,
          confidence: result.confidence,
          answers
        }
      });
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast({
        title: "Error",
        description: "Failed to calculate results. Please try again.",
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
    <div className="container max-w-3xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Plan
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Moon className="w-8 h-8 text-primary" />
              HormoneCompass™ Assessment
            </h1>
            <p className="text-muted-foreground">
              Answer honestly to get the most accurate stage mapping
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Question {answeredQuestions + 1} of {totalQuestions}
              </span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Card */}
        <Card className="border-2">
          <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-2xl">{currentDomain.icon}</span>
                <span>{currentDomain.name}</span>
              </div>
              <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            {/* Slider */}
            <div className="space-y-6">
              <Slider
                value={[answers[currentQuestion.id] || 3]}
                onValueChange={([value]) => handleAnswer(value)}
                min={currentQuestion.scale.min}
                max={currentQuestion.scale.max}
                step={1}
                className="w-full"
              />

              {/* Value Display */}
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {answers[currentQuestion.id] || 3}
                </p>
              </div>

              {/* Scale Labels */}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="text-left max-w-[45%]">
                  {currentQuestion.scale.minLabel}
                </span>
                <span className="text-right max-w-[45%]">
                  {currentQuestion.scale.maxLabel}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentDomainIndex === 0 && currentQuestionIndex === 0}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] || isCalculating}
                className="flex-1 gap-2"
              >
                {isLastQuestion ? (
                  <>
                    {isCalculating ? "Calculating..." : "Complete"}
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Domain Progress Indicators */}
        <div className="flex gap-2 justify-center">
          {HORMONE_COMPASS_ASSESSMENT.domains.map((domain, index) => (
            <div
              key={domain.id}
              className={`h-2 flex-1 rounded-full transition-all ${
                index < currentDomainIndex
                  ? 'bg-primary'
                  : index === currentDomainIndex
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
