import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    stage: "",
    goals: []
  });
  const navigate = useNavigate();

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding and redirect to dashboard
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
                  <Label key={goal} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-border"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData, 
                            goals: [...formData.goals, goal]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            goals: formData.goals.filter(g => g !== goal)
                          });
                        }
                      }}
                    />
                    <span>{goal}</span>
                  </Label>
                ))}
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
            disabled={currentStep === 1 && !formData.age}
            className="primary-gradient"
          >
            {currentStep === totalSteps ? "Complete Setup" : "Next"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;