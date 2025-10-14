// Main onboarding flow component
import { useState } from "react";
import { OnboardingProgress } from "./OnboardingProgress";
import { WelcomeStep } from "./WelcomeStep";
import { GoalSelectionStep } from "./GoalSelectionStep";
import { AssessmentStep } from "./AssessmentStep";
import { ProtocolPreviewStep } from "./ProtocolPreviewStep";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const STEP_LABELS = ["Welcome", "Goals", "Assessment", "Protocol"];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoalSelection = (goals: string[]) => {
    setSelectedGoals(goals);
    setCurrentStep(3);
  };

  const handleAssessmentComplete = (completed: boolean) => {
    setAssessmentCompleted(completed);
    setCurrentStep(4);
  };

  const handleSkipAssessment = () => {
    setCurrentStep(4);
  };

  const handleComplete = async () => {
    // Mark onboarding as completed in profile
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Welcome aboard!",
          description: "Your health journey begins now.",
        });

        navigate('/dashboard');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to complete onboarding. Please try again.",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <OnboardingProgress 
          currentStep={currentStep} 
          totalSteps={4} 
          stepLabels={STEP_LABELS}
        />

        <div className="mt-12">
          {currentStep === 1 && (
            <WelcomeStep 
              onNext={() => setCurrentStep(2)}
              userName={profile?.preferred_name}
            />
          )}

          {currentStep === 2 && (
            <GoalSelectionStep
              onNext={handleGoalSelection}
              onBack={() => setCurrentStep(1)}
              initialSelection={selectedGoals}
            />
          )}

          {currentStep === 3 && (
            <AssessmentStep
              onNext={handleAssessmentComplete}
              onBack={() => setCurrentStep(2)}
              onSkip={handleSkipAssessment}
            />
          )}

          {currentStep === 4 && (
            <ProtocolPreviewStep
              onComplete={handleComplete}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
