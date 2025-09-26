import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Sample assessment questions - would normally come from a database
const assessmentQuestions = {
  "hot-flashes": [
    {
      id: 1,
      question: "How often do you experience hot flashes?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily (1-3 times per day)" },
        { value: "frequent", label: "Frequently (4+ times per day)" }
      ]
    },
    {
      id: 2,
      question: "How severe are your hot flashes typically?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild - barely noticeable" },
        { value: "moderate", label: "Moderate - uncomfortable but manageable" },
        { value: "severe", label: "Severe - significantly disruptive" },
        { value: "extreme", label: "Extreme - debilitating" }
      ]
    },
    {
      id: 3,
      question: "When do your hot flashes typically occur?",
      type: "radio",
      options: [
        { value: "anytime", label: "Any time of day" },
        { value: "night", label: "Primarily at night" },
        { value: "day", label: "Primarily during the day" },
        { value: "triggers", label: "When triggered by specific situations" }
      ]
    },
    {
      id: 4,
      question: "What triggers seem to make your hot flashes worse?",
      type: "textarea",
      placeholder: "Describe any triggers you've noticed (stress, certain foods, activities, etc.)"
    }
  ],
  "sleep": [
    {
      id: 1,
      question: "How would you describe your sleep quality?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - I sleep well most nights" },
        { value: "good", label: "Good - occasional sleep issues" },
        { value: "fair", label: "Fair - frequent sleep disruptions" },
        { value: "poor", label: "Poor - chronic sleep problems" }
      ]
    },
    {
      id: 2,
      question: "How long does it typically take you to fall asleep?",
      type: "radio",
      options: [
        { value: "quick", label: "Less than 15 minutes" },
        { value: "normal", label: "15-30 minutes" },
        { value: "slow", label: "30-60 minutes" },
        { value: "very-slow", label: "More than 60 minutes" }
      ]
    },
    {
      id: 3,
      question: "How often do you wake up during the night?",
      type: "radio",
      options: [
        { value: "rarely", label: "Rarely - sleep through the night" },
        { value: "sometimes", label: "Sometimes - 1-2 times per night" },
        { value: "often", label: "Often - 3-4 times per night" },
        { value: "frequently", label: "Frequently - 5+ times per night" }
      ]
    }
  ],
  // Add more assessments for other symptoms...
  "joint-pain": [
    {
      id: 1,
      question: "Where do you primarily experience joint pain?",
      type: "radio",
      options: [
        { value: "hands", label: "Hands and fingers" },
        { value: "knees", label: "Knees" },
        { value: "hips", label: "Hips" },
        { value: "multiple", label: "Multiple joints" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your pain on average?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild (1-3/10)" },
        { value: "moderate", label: "Moderate (4-6/10)" },
        { value: "severe", label: "Severe (7-8/10)" },
        { value: "extreme", label: "Extreme (9-10/10)" }
      ]
    }
  ]
};

const SymptomAssessment = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const questions = symptomId ? assessmentQuestions[symptomId as keyof typeof assessmentQuestions] : [];
  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeAssessment = async () => {
    if (!user || !symptomId) return;

    try {
      // Save assessment results to database
      const { error } = await supabase
        .from('user_symptoms')
        .upsert({
          user_id: user.id,
          symptom_id: symptomId,
          is_active: true,
          severity: 'Moderate', // This would be calculated based on answers
          frequency: 'Weekly', // This would be calculated based on answers
          notes: JSON.stringify(answers),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsComplete(true);
      toast({
        title: "Assessment Complete",
        description: "Your responses have been saved and recommendations are ready."
      });
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast({
        variant: "destructive",
        title: "Error saving assessment",
        description: "Please try again later."
      });
    }
  };

  const getSymptomName = (id: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flashes",
      "sleep": "Sleep Issues",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "energy-levels": "Low Energy",
      "bloating": "Bloating",
      "weight-changes": "Weight Changes",
      "hair-thinning": "Hair Thinning",
      "anxiety": "Anxiety",
      "irregular-periods": "Irregular Periods",
      "headaches": "Headaches",
      "night-sweats": "Night Sweats",
      "memory-issues": "Memory Issues"
    };
    return nameMap[id] || id;
  };

  if (!symptomId || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Assessment Not Available</h1>
            <p className="text-muted-foreground mb-6">
              This symptom assessment is not yet available.
            </p>
            <Button onClick={() => navigate('/symptoms')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Symptoms
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <CardDescription>
                Thank you for completing the {getSymptomName(symptomId)} assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your responses have been analyzed and personalized recommendations are being prepared.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/symptoms')}>
                  View More Symptoms
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/symptoms')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Symptoms
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{getSymptomName(symptomId)} Assessment</h1>
            <p className="text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <Progress value={progress} className="mt-4" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQ.type === "radio" && currentQ.options && (
              <RadioGroup
                value={currentAnswer || ""}
                onValueChange={(value) => handleAnswer(currentQ.id, value)}
              >
                {currentQ.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQ.type === "textarea" && (
              <Textarea
                placeholder={('placeholder' in currentQ) ? currentQ.placeholder : "Enter your response..."}
                value={currentAnswer || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
                rows={4}
              />
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!currentAnswer}
              >
                {currentQuestion === questions.length - 1 ? "Complete" : "Next"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SymptomAssessment;