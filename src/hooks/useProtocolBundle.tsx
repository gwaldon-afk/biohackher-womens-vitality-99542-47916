import { useQuery } from "@tanstack/react-query";
import { calculateBundlePrice, BundleCalculation } from "@/services/protocolBundleService";

export const useProtocolBundle = (protocolId: string | undefined) => {
  return useQuery<BundleCalculation>({
    queryKey: ["protocol-bundle", protocolId],
    queryFn: () => {
      if (!protocolId) {
        return Promise.resolve({
          items: [],
          totalItems: 0,
          basePrice: 0,
          discountPercentage: 0,
          discountAmount: 0,
          finalPrice: 0,
          eligibleForDiscount: false,
        });
      }
      return calculateBundlePrice(protocolId);
    },
    enabled: !!protocolId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
