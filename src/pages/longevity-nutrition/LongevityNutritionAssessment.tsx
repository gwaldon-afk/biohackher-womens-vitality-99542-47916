import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TEST_MODE_ENABLED } from "@/config/testMode";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<any>({});

  const totalSteps = 14;
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
    if (currentStep === 1) {
      navigate('/nutrition');
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Calculate average craving pattern
      const cravingAverage = assessmentData.craving_details
        ? (Object.values(assessmentData.craving_details).reduce((sum: number, val: any) => sum + val, 0) as number) / 4
        : 3;

      const score = calculateLongevityNutritionScore({
        protein_score: assessmentData.protein_score || 0,
        fiber_score: assessmentData.fiber_score || 1,
        plant_diversity_score: assessmentData.plant_diversity_score || 1,
        gut_symptom_score: assessmentData.gut_symptom_score || 0,
        inflammation_score: assessmentData.inflammation_score || 0,
        craving_pattern: cravingAverage,
        hydration_score: assessmentData.hydration_score || 3,
      });

      // TEST MODE FIX: Use guest flow to prevent RLS violations
      const isGuest = !user?.id || TEST_MODE_ENABLED;
      const sessionId = isGuest ? `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null;

      // Store session_id in localStorage for guest-to-user migration
      if (isGuest && sessionId) {
        localStorage.setItem('nutrition_guest_session', sessionId);
      }

      // 1. Save to longevity_nutrition_assessments (audit trail)
      const { data, error } = await supabase.from("longevity_nutrition_assessments").insert({
        user_id: isGuest ? null : user.id,
        session_id: sessionId,
        ...assessmentData,
        longevity_nutrition_score: score,
        completed_at: new Date().toISOString(),
      }).select().single();

      if (error) throw error;

      // 2. OVERWRITE nutrition_preferences for authenticated users
      if (user?.id && !isGuest) {
        const { error: prefsError } = await supabase
          .from("nutrition_preferences")
          .upsert({
            user_id: user.id,
            age: assessmentData.age,
            height_cm: assessmentData.height_cm,
            weight_kg: assessmentData.weight_kg,
            weight: assessmentData.weight_kg,
            goal_primary: assessmentData.goal_primary,
            activity_level: assessmentData.activity_level,
            nutrition_identity_type: assessmentData.nutrition_identity_type,
            protein_score: assessmentData.protein_score,
            protein_sources: assessmentData.protein_sources,
            plant_diversity_score: assessmentData.plant_diversity_score,
            fiber_score: assessmentData.fiber_score,
            gut_symptom_score: assessmentData.gut_symptom_score,
            gut_symptoms: assessmentData.gut_symptoms,
            inflammation_score: assessmentData.inflammation_score,
            inflammation_symptoms: assessmentData.inflammation_symptoms,
            first_meal_hour: assessmentData.first_meal_hour,
            last_meal_hour: assessmentData.last_meal_hour,
            eats_after_8pm: assessmentData.eats_after_8pm,
            chrononutrition_type: assessmentData.chrononutrition_type,
            meal_timing_window: assessmentData.meal_timing_window,
            menopause_stage: assessmentData.menopause_stage,
            craving_pattern: cravingAverage,
            craving_details: assessmentData.craving_details,
            hydration_score: assessmentData.hydration_score,
            caffeine_score: assessmentData.caffeine_score,
            alcohol_intake: assessmentData.alcohol_intake,
            allergies: assessmentData.allergies,
            values_dietary: assessmentData.values_dietary,
            confidence_in_cooking: assessmentData.confidence_in_cooking,
            food_preference_type: assessmentData.food_preference_type,
            metabolic_symptom_flags: assessmentData.metabolic_symptom_flags,
            longevity_nutrition_score: score,
            assessment_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (prefsError) throw prefsError;
        
        // 3. Generate daily nutrition actions
        const { generateAndSaveNutritionActions } = await import('@/services/nutritionActionService');
        await generateAndSaveNutritionActions(user.id, assessmentData, cravingAverage);
      }

      navigate(`/longevity-nutrition/results?id=${data.id}`);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error("Failed to save assessment. Please try again.");
    }
  };

  const steps = [
    null, // Index 0 unused (step numbering starts at 1)
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
        {currentStep >= 1 && (
          <div className="mb-8">
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        )}

        {steps[currentStep]}

        {currentStep >= 1 && (
          <div className="flex justify-between mt-8 max-w-4xl mx-auto">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Back to Nutrition' : 'Back'}
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
