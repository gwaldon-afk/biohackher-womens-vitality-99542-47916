import { useQuery } from "@tanstack/react-query";
import { getRecommendedProducts } from "@/services/productRecommendationService";
import { useAuth } from "./useAuth";

/**
 * Hook to fetch recommended products based on user's assessment data
 */
export const useAssessmentProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['assessment-products', user?.id],
    queryFn: () => getRecommendedProducts(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
