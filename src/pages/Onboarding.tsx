import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, X, CheckCircle, Brain, Heart, Zap, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  age: string;
  stage: string;
  goals: string[];
  symptoms: string[];
  lifestyle: {
    sleepHours: string;
    activityLevel: string;
    stressLevel: string;
  };
}

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    age: "",
    stage: "",
    goals: [],
    symptoms: [],
    lifestyle: {
      sleepHours: "",
      activityLevel: "",
      stressLevel: ""
    }
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeOnboarding, updateProgress } = useUserProgress();
  const { toast } = useToast();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = async () => {
    if (currentStep < totalSteps) {
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
      navigate("/dashboard");
      return;
    }

    try {
      // Save onboarding data to profile
      await supabase
        .from('profiles')
        .update({
          preferred_name: formData.age || 'User'
        })
        .eq('user_id', user.id);

      // Mark onboarding as complete
      await completeOnboarding();

      toast({
        title: "Welcome to BiohackHer! 🎉",
        description: "Your personalized health journey begins now.",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Setup complete",
        description: "Welcome to your health journey!",
      });
      navigate("/dashboard");
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">What's your age range?</CardTitle>
              <CardDescription>
                This helps us personalise your biohacking journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.age} 
                onValueChange={(value) => setFormData({...formData, age: value})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="25-35" id="age-1" />
                  <Label htmlFor="age-1">25-35 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="35-45" id="age-2" />
                  <Label htmlFor="age-2">35-45 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="45-55" id="age-3" />
                  <Label htmlFor="age-3">45-55 years</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="55+" id="age-4" />
                  <Label htmlFor="age-4">55+ years</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );
      
      case 2:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">What's your current stage?</CardTitle>
              <CardDescription>
                Understanding your hormonal stage helps us provide targeted recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={formData.stage} 
                onValueChange={(value) => setFormData({...formData, stage: value})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular-cycles" id="stage-1" />
                  <Label htmlFor="stage-1">Regular cycles</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="perimenopause" id="stage-2" />
                  <Label htmlFor="stage-2">Perimenopause</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="menopause" id="stage-3" />
                  <Label htmlFor="stage-3">Menopause (12+ months no period)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="postmenopause" id="stage-4" />
                  <Label htmlFor="stage-4">Postmenopause</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        );
      
      case 3:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">What are your main goals?</CardTitle>
              <CardDescription>
                Select all that apply - we'll customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Improve sleep quality",
                  "Manage symptoms naturally",
                  "Increase energy levels",
                  "Optimise nutrition",
                  "Build resilience",
                  "Track biomarkers"
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.goals.includes(goal)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            goals: [...formData.goals, goal]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            goals: formData.goals.filter((g) => g !== goal)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={goal} className="cursor-pointer">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 4:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">Current Symptoms</CardTitle>
              <CardDescription>
                What symptoms are you currently experiencing?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Brain fog",
                  "Low energy",
                  "Sleep issues",
                  "Anxiety/Stress",
                  "Hormonal imbalance",
                  "Digestive issues",
                  "Joint pain",
                  "Skin concerns"
                ].map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={formData.symptoms.includes(symptom)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            symptoms: [...formData.symptoms, symptom]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            symptoms: formData.symptoms.filter((s) => s !== symptom)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={symptom} className="cursor-pointer">
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 5:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">Lifestyle Baseline</CardTitle>
              <CardDescription>
                Help us understand your current routine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Average sleep per night</Label>
                <RadioGroup
                  value={formData.lifestyle.sleepHours}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, sleepHours: value }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="<5" id="sleep-1" />
                    <Label htmlFor="sleep-1">Less than 5 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5-7" id="sleep-2" />
                    <Label htmlFor="sleep-2">5-7 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7-9" id="sleep-3" />
                    <Label htmlFor="sleep-3">7-9 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value=">9" id="sleep-4" />
                    <Label htmlFor="sleep-4">More than 9 hours</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Activity level</Label>
                <RadioGroup
                  value={formData.lifestyle.activityLevel}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, activityLevel: value }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sedentary" id="activity-1" />
                    <Label htmlFor="activity-1">Sedentary (little to no exercise)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="activity-2" />
                    <Label htmlFor="activity-2">Light (1-3 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="activity-3" />
                    <Label htmlFor="activity-3">Moderate (3-5 days/week)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="active" id="activity-4" />
                    <Label htmlFor="activity-4">Very Active (6-7 days/week)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Current stress level</Label>
                <RadioGroup
                  value={formData.lifestyle.stressLevel}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      lifestyle: { ...formData.lifestyle, stressLevel: value }
                    })
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="stress-1" />
                    <Label htmlFor="stress-1">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="stress-2" />
                    <Label htmlFor="stress-2">Moderate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="stress-3" />
                    <Label htmlFor="stress-3">High</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="very-high" id="stress-4" />
                    <Label htmlFor="stress-4">Very High</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 6:
        return (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">Meet the 4 Pillars</CardTitle>
              <CardDescription>
                Your personalized health journey is organized around four key areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <Brain className="h-8 w-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold">Brain</h3>
                  <p className="text-xs text-muted-foreground">Mental clarity & focus</p>
                </div>
                <div className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <Heart className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold">Body</h3>
                  <p className="text-xs text-muted-foreground">Physical vitality</p>
                </div>
                <div className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <Zap className="h-8 w-8 text-green-600 mb-2" />
                  <h3 className="font-semibold">Balance</h3>
                  <p className="text-xs text-muted-foreground">Inner calm & peace</p>
                </div>
                <div className="p-4 rounded-lg border bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
                  <Sparkles className="h-8 w-8 text-pink-600 mb-2" />
                  <h3 className="font-semibold">Beauty</h3>
                  <p className="text-xs text-muted-foreground">Radiant appearance</p>
                </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">You're all set!</p>
                <p className="text-xs text-muted-foreground">
                  Complete pillar assessments to get personalized recommendations
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header with logo and close button */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 max-w-4xl mx-auto">
        <button 
          onClick={() => navigate("/")}
          className="text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
        >
          Biohack<em>her</em>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
        
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !formData.age) ||
              (currentStep === 2 && !formData.stage) ||
              (currentStep === 5 && (!formData.lifestyle.sleepHours || !formData.lifestyle.activityLevel || !formData.lifestyle.stressLevel))
            }
            className="primary-gradient"
          >
            {currentStep === totalSteps ? "Start My Journey" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
        
        <div className="text-center mt-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;