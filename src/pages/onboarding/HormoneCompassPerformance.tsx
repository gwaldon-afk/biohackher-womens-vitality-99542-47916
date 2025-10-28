import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
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
      
      // Navigate to results, preserving returnTo parameter
      const resultsPath = returnTo 
        ? `/onboarding/hormone-compass-results?returnTo=${encodeURIComponent(returnTo)}`
        : '/onboarding/hormone-compass-results';
      navigate(resultsPath);
    }
  };

  const question = questions[currentQuestion];
  const currentValue = answers[question.id] || 5;
  const canProceed = answers[question.id] !== undefined;

  const getDestinationName = () => {
    if (!returnTo) return null;
    const path = decodeURIComponent(returnTo);
    if (path.includes('my-goals')) return 'My Goals';
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('protocol')) return 'My Protocol';
    return 'your destination';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gradient-to-b from-background to-muted/20">
      {/* Contextual Banner */}
      {returnTo && (
        <div className="fixed top-0 left-0 right-0 bg-primary/10 backdrop-blur-sm border-b border-primary/20 z-50 py-2 px-4">
          <p className="text-sm text-center">
            📊 Complete this quick assessment to access <span className="font-semibold">{getDestinationName()}</span> • Takes ~2 minutes
          </p>
        </div>
      )}
      
      <div className="fixed top-0 left-0 right-0 h-14 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-40 flex items-center justify-between px-4" style={{ marginTop: returnTo ? '40px' : '0' }}>
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
