import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const questions = [
  {
    id: 'stage',
    label: 'What stage are you in?',
    type: 'radio' as const,
    options: ['Perimenopause', 'Menopause', 'Post-menopause', 'Not sure'],
  },
  { id: 'hot_flush', label: 'Hot Flush Frequency', type: 'slider' as const, min: 0, max: 10 },
  { id: 'sleep', label: 'Sleep Quality', type: 'slider' as const, min: 0, max: 10 },
  { id: 'mood', label: 'Mood Stability', type: 'slider' as const, min: 0, max: 10 },
  { id: 'energy', label: 'Energy Levels', type: 'slider' as const, min: 0, max: 10 },
  { id: 'skin', label: 'Skin Health', type: 'slider' as const, min: 0, max: 10 },
];

const MenoMapMenopause = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});

  const handleSliderAnswer = (value: number) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleRadioAnswer = (value: string) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const numericAnswers = Object.entries(answers)
        .filter(([_, v]) => typeof v === 'number')
        .map(([_, v]) => v as number);
      const avgScore = numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length;
      const bioScore = Math.round((avgScore / 10) * 100);
      
      // Save both bio_score for backward compatibility AND structured answers for insights
      localStorage.setItem('bio_score', bioScore.toString());
      localStorage.setItem('menomap_answers', JSON.stringify(answers));
      localStorage.setItem('menomap_assessment_type', 'quick');
      
      navigate('/onboarding/menomap-results');
    }
  };

  const question = questions[currentQuestion];
  const currentValue = answers[question.id];
  const canProceed = currentValue !== undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Menopause Assessment</h1>
          <p className="text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>

        <Card className="p-8 space-y-8">
          <div className="space-y-4">
            <Label className="text-xl font-medium">{question.label}</Label>

            {question.type === 'slider' && (
              <div className="space-y-4">
                <Slider
                  value={[typeof currentValue === 'number' ? currentValue : 5]}
                  onValueChange={([value]) => handleSliderAnswer(value)}
                  min={question.min}
                  max={question.max}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Low</span>
                  <span className="text-lg font-semibold text-foreground">
                    {typeof currentValue === 'number' ? currentValue : 5}/10
                  </span>
                  <span>High</span>
                </div>
              </div>
            )}

            {question.type === 'radio' && question.options && (
              <RadioGroup value={currentValue as string} onValueChange={handleRadioAnswer}>
                {question.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
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

export default MenoMapMenopause;
