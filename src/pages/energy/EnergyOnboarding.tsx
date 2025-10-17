import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Activity, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const EnergyOnboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      title: "Welcome to Energy Loop",
      description: "Your personalized energy optimization system",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Energy Loop helps you understand and optimize your daily energy patterns using:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <span>Real-time biometric tracking from wearables</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <span>AI-powered insights and pattern detection</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <span>Personalized action recommendations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <span>Goal alignment and progress tracking</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "How It Works",
      description: "Close the loop between data and action",
      icon: Activity,
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Track Your Energy</h3>
              <p className="text-sm text-muted-foreground">
                Daily check-ins capture your energy levels, sleep quality, stress, and movement
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Get AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes patterns and identifies what's impacting your energy
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Take Action</h3>
              <p className="text-sm text-muted-foreground">
                Receive personalized recommendations and track what works for you
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Ready to Begin?",
      description: "Let's activate your Energy Loop",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            We'll start by setting up your first energy check-in. This will help establish your baseline 
            and begin tracking patterns.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h3 className="font-semibold mb-2">What to expect:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Quick daily check-ins (2 minutes)</li>
              <li>• Weekly insights and recommendations</li>
              <li>• Integration with your health goals</li>
              <li>• Personalized action suggestions</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Enable energy loop in profile
      const { error } = await supabase
        .from('profiles')
        .update({
          energy_loop_enabled: true,
          energy_loop_onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Energy Loop Activated!",
        description: "Let's record your first check-in",
      });

      navigate('/energy-loop/check-in');
    } catch (error) {
      console.error('Error enabling energy loop:', error);
      toast({
        title: "Error",
        description: "Could not activate Energy Loop",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "w-8 bg-primary"
                    : index < currentStep
                    ? "w-2 bg-primary"
                    : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStepData.content}

            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  "Activating..."
                ) : currentStep === steps.length - 1 ? (
                  <>
                    Complete Setup
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EnergyOnboarding;
