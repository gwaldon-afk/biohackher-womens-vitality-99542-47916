import { useLISData } from "./useLISData";
import { useNutritionScore } from "./useNutritionScore";
import { useHormoneCompass } from "./useHormoneCompass";

export interface ConsolidatedScores {
  // LIS
  lisScore: number | null;
  lisBaselineScore: number | null;
  lisBaselineDate: Date | null;
  lisImprovement: number;
  
  // Nutrition
  nutritionScore: number | null;
  nutritionCompletedAt: Date | null;
  
  // Hormone Compass
  hormoneStage: string | null;
  hormoneConfidenceScore: number | null;
  hormoneCalculatedAt: Date | null;
  
  // Meta
  loading: boolean;
  completedCount: number;
  allComplete: boolean;
  
  // Refetch functions
  refetchLIS: () => Promise<void>;
  refetchNutrition: () => void;
}

export const useConsolidatedScores = (): ConsolidatedScores => {
  const {
    currentScore: lisScore,
    baselineScore: lisBaselineScore,
    baselineDate: lisBaselineDate,
    improvement: lisImprovement,
    loading: lisLoading,
    refetch: refetchLIS
  } = useLISData();

  const {
    latestScore: nutritionScore,
    completedAt: nutritionCompletedAt,
    loading: nutritionLoading,
    refetch: refetchNutrition
  } = useNutritionScore();

  const {
    currentStage,
    isLoading: hormoneLoading
  } = useHormoneCompass();

  const loading = lisLoading || nutritionLoading || hormoneLoading;

  // Count completed assessments
  const lisComplete = lisBaselineScore !== null;
  const nutritionComplete = nutritionScore !== null;
  const hormoneComplete = currentStage !== null;
  
  const completedCount = [lisComplete, nutritionComplete, hormoneComplete].filter(Boolean).length;
  const allComplete = completedCount === 3;

  return {
    // LIS
    lisScore,
    lisBaselineScore,
    lisBaselineDate,
    lisImprovement,
    
    // Nutrition
    nutritionScore,
    nutritionCompletedAt,
    
    // Hormone Compass
    hormoneStage: currentStage?.stage ?? null,
    hormoneConfidenceScore: currentStage?.confidence_score ?? null,
    hormoneCalculatedAt: currentStage?.calculated_at ? new Date(currentStage.calculated_at) : null,
    
    // Meta
    loading,
    completedCount,
    allComplete,
    
    // Refetch functions
    refetchLIS,
    refetchNutrition
  };
};
