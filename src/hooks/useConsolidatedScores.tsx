import { useLISData } from "./useLISData";
import { useNutritionScore } from "./useNutritionScore";
import { useHormoneCompass } from "./useHormoneCompass";
import { useHealthProfile } from "./useHealthProfile";
import { 
  calculateOverallBiologicalAge, 
  calculateLifestyleAgeFromLIS,
  type OverallBiologicalAgeResult,
  type DomainType
} from "@/utils/compositeBiologicalAgeCalculator";

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
  
  // Biological Age Data
  chronologicalAge: number | null;
  lifestyleAge: number | null;
  metabolicAge: number | null;
  hormoneAge: number | null;
  
  // Overall Biological Age (composite)
  overallBiologicalAge: number | null;
  bioAgeDelta: number | null;
  bioAgeConfidence: number;
  bioAgeContributors: string[];
  bioAgeMissing: DomainType[];
  bioAgeDisplayMessage: string;
  
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
    metabolicAge,
    completedAt: nutritionCompletedAt,
    loading: nutritionLoading,
    refetch: refetchNutrition
  } = useNutritionScore();

  const {
    currentStage,
    isLoading: hormoneLoading
  } = useHormoneCompass();

  const { profile, loading: profileLoading } = useHealthProfile();

  const loading = lisLoading || nutritionLoading || hormoneLoading || profileLoading;

  // Calculate chronological age from DOB
  const chronologicalAge = profile?.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  // Calculate lifestyle age from LIS score
  const lifestyleAge = chronologicalAge !== null && lisBaselineScore !== null
    ? calculateLifestyleAgeFromLIS(chronologicalAge, lisBaselineScore)
    : null;

  // Get hormone age from hormone compass data
  const hormoneAge = currentStage?.hormone_age ?? null;

  // Calculate overall biological age
  let bioAgeResult: OverallBiologicalAgeResult | null = null;
  if (chronologicalAge !== null) {
    bioAgeResult = calculateOverallBiologicalAge(
      chronologicalAge,
      lifestyleAge,
      metabolicAge,
      hormoneAge
    );
  }

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
    
    // Biological Age Data
    chronologicalAge,
    lifestyleAge,
    metabolicAge,
    hormoneAge,
    
    // Overall Biological Age
    overallBiologicalAge: bioAgeResult?.overallAge ?? null,
    bioAgeDelta: bioAgeResult?.delta ?? null,
    bioAgeConfidence: bioAgeResult?.confidence ?? 0,
    bioAgeContributors: bioAgeResult?.contributingDomains.map(d => d.label) ?? [],
    bioAgeMissing: bioAgeResult?.missingDomains ?? [],
    bioAgeDisplayMessage: bioAgeResult?.displayMessage ?? '',
    
    // Meta
    loading,
    completedCount,
    allComplete,
    
    // Refetch functions
    refetchLIS,
    refetchNutrition
  };
};
