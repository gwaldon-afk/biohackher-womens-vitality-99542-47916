import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import { calculateMetabolicAge } from "@/utils/metabolicAgeCalculator";
import { toast } from "sonner";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useSessionMetrics } from "@/hooks/useSessionMetrics";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { useGuestAssessmentGate } from "@/hooks/useGuestAssessmentGate";
import { GuestAssessmentGate } from "@/components/onboarding/GuestAssessmentGate";

export default function LongevityNutritionAssessment() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProgress } = useAssessmentProgress();
  const { profile, loading: profileLoading, createOrUpdateProfile } = useHealthProfile();
  const { metrics: sessionMetrics } = useSessionMetrics();
  const { showGate, checkGuestGate, closeGate, recordGuestAssessment } = useGuestAssessmentGate();
  const [currentStep, setCurrentStep] = useState(1);
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [isPrePopulated, setIsPrePopulated] = useState(false);

  // Check guest gate on mount
  useEffect(() => {
    if (!user && checkGuestGate('nutrition')) {
      // Gate will show modal - user already did another assessment
    }
  }, [user, checkGuestGate]);

  // Pre-populate from existing profile data (authenticated) or session storage (guest)
  useEffect(() => {
    if (isPrePopulated || profileLoading) return;

    // For authenticated users, use profile data
    if (profile) {
      const age = profile.date_of_birth 
        ? new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()
        : undefined;
      
      setAssessmentData((prev: any) => ({
        ...prev,
        age: prev.age || age,
        height_cm: prev.height_cm || profile.height_cm,
        weight_kg: prev.weight_kg || profile.weight_kg,
        activity_level: prev.activity_level || profile.activity_level || 
          (profile.training_experience === 'beginner' ? 'sedentary' : 
           profile.training_experience === 'intermediate' ? 'moderate' : 
           profile.training_experience === 'advanced' ? 'active' : undefined),
      }));
      setIsPrePopulated(true);
    } 
    // For guests, use session storage
    else if (!user && sessionMetrics) {
      const age = sessionMetrics.date_of_birth 
        ? new Date().getFullYear() - new Date(sessionMetrics.date_of_birth).getFullYear()
        : undefined;
      
      setAssessmentData((prev: any) => ({
        ...prev,
        age: prev.age || age,
        height_cm: prev.height_cm || sessionMetrics.height_cm,
        weight_kg: prev.weight_kg || sessionMetrics.weight_kg,
        activity_level: prev.activity_level || sessionMetrics.activity_level,
      }));
      setIsPrePopulated(true);
    }
  }, [profile, profileLoading, user, sessionMetrics, isPrePopulated]);

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

      // Calculate Metabolic Age if age is available
      const chronologicalAge = assessmentData.age;
      let metabolicAgeResult = null;
      
      if (chronologicalAge && chronologicalAge > 0) {
        metabolicAgeResult = calculateMetabolicAge({
          protein_score: assessmentData.protein_score || 3,
          fiber_score: assessmentData.fiber_score || 3,
          plant_diversity_score: assessmentData.plant_diversity_score || 3,
          gut_symptom_score: assessmentData.gut_symptom_score || 0,
          inflammation_score: assessmentData.inflammation_score || 0,
          hydration_score: assessmentData.hydration_score || 3,
          craving_pattern: cravingAverage,
          metabolic_symptom_flags: assessmentData.metabolic_symptom_flags,
          activity_level: assessmentData.activity_level,
          weight_kg: assessmentData.weight_kg,
          height_cm: assessmentData.height_cm,
        }, chronologicalAge);
      }

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
        // Metabolic Age fields
        metabolic_age: metabolicAgeResult?.metabolicAge || null,
        chronological_age: chronologicalAge || null,
        metabolic_age_offset: metabolicAgeResult?.ageOffset || null,
        metabolic_severity_score: metabolicAgeResult?.severityScore || null,
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
        
        // 3. Calculate and store personalized protein/calorie targets in user_health_profile
        if (assessmentData.weight_kg) {
          const weight = assessmentData.weight_kg.toString();
          const activityLevel = assessmentData.activity_level || 'moderate';
          const goal = assessmentData.goal_primary || 'maintenance';
          
          // Calculate protein targets based on activity level
          let proteinMultipliers;
          switch (activityLevel) {
            case "sedentary": proteinMultipliers = { min: 1.4, max: 1.6 }; break;
            case "moderate": proteinMultipliers = { min: 1.6, max: 2.0 }; break;
            case "active": proteinMultipliers = { min: 2.0, max: 2.4 }; break;
            case "athlete": proteinMultipliers = { min: 2.4, max: 2.8 }; break;
            default: proteinMultipliers = { min: 1.6, max: 2.0 };
          }
          
          const proteinMin = Math.round(assessmentData.weight_kg * proteinMultipliers.min * 10) / 10;
          const proteinMax = Math.round(assessmentData.weight_kg * proteinMultipliers.max * 10) / 10;
          
          // Calculate calorie target
          let bmr = assessmentData.weight_kg * 22;
          let activityMultiplier;
          switch (activityLevel) {
            case "sedentary": activityMultiplier = 1.2; break;
            case "moderate": activityMultiplier = 1.5; break;
            case "active": activityMultiplier = 1.7; break;
            case "athlete": activityMultiplier = 1.9; break;
            default: activityMultiplier = 1.5;
          }
          
          let calories = bmr * activityMultiplier;
          switch (goal) {
            case "weight-loss": calories = calories * 0.85; break;
            case "muscle-gain": calories = calories * 1.15; break;
            default: break;
          }
          
          // Update user_health_profile with calculated targets
          await createOrUpdateProfile({
            recommended_protein_min: proteinMin,
            recommended_protein_max: proteinMax,
            recommended_daily_calories: Math.round(calories),
            nutrition_calculation_date: new Date().toISOString().split('T')[0],
            activity_level: activityLevel,
          });
        }
        
        // 4. Generate daily nutrition actions
        const { generateAndSaveNutritionActions } = await import('@/services/nutritionActionService');
        await generateAndSaveNutritionActions(user.id, assessmentData, cravingAverage);

        // 5. Update assessment progress tracking
        updateProgress({
          nutrition_completed: true,
          nutrition_completed_at: new Date().toISOString(),
        });

        // 6. Trigger incremental AI analysis (non-blocking)
        try {
          await supabase.functions.invoke('analyze-cross-assessments', {
            body: { trigger_assessment: 'nutrition' }
          });
        } catch (e) {
          console.error('Analysis trigger failed:', e);
          // Non-blocking - don't fail the assessment completion
        }
      }

      // Record guest assessment completion for gate tracking
      if (!user) {
        recordGuestAssessment('nutrition');
      }

      navigate(`/longevity-nutrition/results?id=${data.id}`);
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error(t('nutritionAssessment.failedToSave'));
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
      <GuestAssessmentGate 
        isOpen={showGate} 
        onClose={closeGate} 
        assessmentName={t('nutritionAssessment.title')} 
      />
    </div>
  );
}
