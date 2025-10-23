import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const questions = [
  { id: 'energy', label: 'Energy Levels', min: 0, max: 10 },
  { id: 'focus', label: 'Mental Focus', min: 0, max: 10 },
  { id: 'recovery', label: 'Recovery Quality', min: 0, max: 10 },
  { id: 'stress', label: 'Stress Management', min: 0, max: 10 },
  { id: 'sleep', label: 'Sleep Quality', min: 0, max: 10 },
];

const MenoMapPerformance = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const handleAnswer = (value: number) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate bio_score from answers
      const avgScore = Object.values(answers).reduce((a, b) => a + b, 0) / questions.length;
      const bioScore = Math.round((avgScore / 10) * 100);
      localStorage.setItem('bio_score', bioScore.toString());
      navigate('/onboarding/menomap-results');
    }
  };

  const question = questions[currentQuestion];
  const currentValue = answers[question.id] || 5;
  const canProceed = answers[question.id] !== undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-0 left-0 right-0 h-14 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50 flex items-center justify-between px-4">
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => navigate('/onboarding/menomap-entry')}
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
          {!isMobile && <span className="ml-2">Back</span>}
        </Button>
        
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => navigate('/')}
          aria-label="Exit assessment"
        >
          <X className="h-6 w-6" />
          {!isMobile && <span className="ml-2">Exit</span>}
        </Button>
      </div>

      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Performance Assessment</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card className="p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-xl font-medium">{question.label}</Label>
            <div className="space-y-4">
              <Slider
                value={[currentValue]}
                onValueChange={([value]) => handleAnswer(value)}
                min={question.min}
                max={question.max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span className="text-lg font-semibold text-foreground">{currentValue}/10</span>
                <span>High</span>
              </div>
            </div>
          </div>

          <Button onClick={handleNext} disabled={!canProceed} className="w-full" size="lg">
            {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
          </Button>
        </Card>

        <div className="flex justify-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all ${
                index === currentQuestion
                  ? 'bg-primary'
                  : index < currentQuestion
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenoMapPerformance;
