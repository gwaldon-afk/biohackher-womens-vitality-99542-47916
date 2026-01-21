import { useConsolidatedScores } from "@/hooks/useConsolidatedScores";

export const useBiologicalAgeSelectors = () => {
  const {
    overallBiologicalAge,
    chronologicalAge,
    lisScore,
    loading,
  } = useConsolidatedScores();

  return {
    biologicalAge: overallBiologicalAge,
    chronologicalAge,
    lisScore,
    loading,
  };
};
