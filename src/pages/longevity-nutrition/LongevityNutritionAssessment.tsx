import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AssessmentWelcome } from "@/components/longevity-nutrition/AssessmentWelcome";
import { CoreDetailsStep } from "@/components/longevity-nutrition/CoreDetailsStep";
import { PrimaryGoalStep } from "@/components/longevity-nutrition/PrimaryGoalStep";
import { ActivityLevelStep } from "@/components/longevity-nutrition/ActivityLevelStep";
import { EatingPersonalityStep } from "@/components/longevity-nutrition/EatingPersonalityStep";
import { ProteinIntakeStep } from "@/components/longevity-nutrition/ProteinIntakeStep";
import { FiberGutHealthStep } from "@/components/longevity-nutrition/FiberGutHealthStep";
import { InflammationStep } from "@/components/longevity-nutrition/InflammationStep";
import { ChronoNutritionStep } from "@/components/longevity-nutrition/ChronoNutritionStep";
import { MenopauseStageStep } from "@/components/longevity-nutrition/MenopauseStageStep";
import { CravingsStep } from "@/components/longevity-nutrition/CravingsStep";
import { HydrationStimulantsStep } from "@/components/longevity-nutrition/HydrationStimulantsStep";
import { AllergiesDietaryStep } from "@/components/longevity-nutrition/AllergiesDietaryStep";
import { CookingConfidenceStep } from "@/components/longevity-nutrition/CookingConfidenceStep";
import { MetabolicSymptomsStep } from "@/components/longevity-nutrition/MetabolicSymptomsStep";
import { calculateLongevityNutritionScore } from "@/utils/longevityNutritionScoring";
import { toast } from "sonner";

export default function LongevityNutritionAssessment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [assessmentData, setAssessmentData] = useState<any>({});

  const totalSteps = 15;
  const progress = (currentStep / totalSteps) * 100;

  const updateData = (field: string, value: any) => {
    setAssessmentData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const score = calculateLongevityNutritionScore({
        protein_score: assessmentData.protein_score || 0,
        fiber_score: assessmentData.fiber_score || 1,
        plant_diversity_score: assessmentData.plant_diversity_score || 1,
        gut_symptom_score: assessmentData.gut_symptom_score || 0,
        inflammation_score: assessmentData.inflammation_score || 0,
        craving_pattern: assessmentData.craving_details
          ? Object.values(assessmentData.craving_details).reduce((sum: number, val: any) => sum + val, 0) / 4
          : 3,
        hydration_score: assessmentData.hydration_score || 3,
      });

      const sessionId = user?.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const { data, error } = await supabase.from("longevity_nutrition_assessments").insert({
        user_id: user?.id || null,
        session_id: !user?.id ? sessionId : null,
        ...assessmentData,
        longevity_nutrition_score: score,
        completed_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      navigate(`/longevity-nutrition/results?id=${data.id}`);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    }
  };

  const steps = [
    <AssessmentWelcome onStart={() => setCurrentStep(1)} />,
    <CoreDetailsStep data={assessmentData} onChange={updateData} />,
    <PrimaryGoalStep data={assessmentData} onChange={updateData} />,
    <ActivityLevelStep data={assessmentData} onChange={updateData} />,
    <EatingPersonalityStep data={assessmentData} onChange={updateData} />,
    <ProteinIntakeStep data={assessmentData} onChange={updateData} />,
    <FiberGutHealthStep data={assessmentData} onChange={updateData} />,
    <InflammationStep data={assessmentData} onChange={updateData} />,
    <ChronoNutritionStep data={assessmentData} onChange={updateData} />,
    <MenopauseStageStep data={assessmentData} onChange={updateData} />,
    <CravingsStep data={assessmentData} onChange={updateData} />,
    <HydrationStimulantsStep data={assessmentData} onChange={updateData} />,
    <AllergiesDietaryStep data={assessmentData} onChange={updateData} />,
    <CookingConfidenceStep data={assessmentData} onChange={updateData} />,
    <MetabolicSymptomsStep data={assessmentData} onChange={updateData} />,
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {currentStep > 0 && (
          <div className="mb-8">
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        )}

        {steps[currentStep]}

        {currentStep > 0 && (
          <div className="flex justify-between mt-8 max-w-4xl mx-auto">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === totalSteps ? "Complete Assessment" : "Next"}
              {currentStep < totalSteps && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
