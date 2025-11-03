/**
 * Calculate 5-year biological age impact based on sustained LIS score
 * Algorithm extracted from LongevityProjection component
 */
export const calculate5YearBioAgeImpact = (lis: number): number => {
  let baseImpact = 0;
  
  // Base 5-year impact calculation
  if (lis >= 60 && lis < 70) {
    baseImpact = 1.5 + ((lis - 60) / 10) * (2.5 - 1.5); // +1.5 to +2.5
  } else if (lis >= 70 && lis < 80) {
    baseImpact = 0.8 + ((lis - 70) / 10) * (1.5 - 0.8); // +0.8 to +1.5
  } else if (lis >= 80 && lis < 90) {
    baseImpact = 0.2 + ((lis - 80) / 10) * (0.8 - 0.2); // +0.2 to +0.8
  } else if (lis >= 90 && lis <= 110) {
    baseImpact = -0.2 + ((lis - 90) / 20) * (0.2 - (-0.2)); // -0.2 to +0.2
  } else if (lis > 110 && lis <= 120) {
    baseImpact = -0.8 + ((lis - 110) / 10) * (-0.2 - (-0.8)); // -0.8 to -0.2
  } else if (lis > 120 && lis <= 130) {
    baseImpact = -1.5 + ((lis - 120) / 10) * (-0.8 - (-1.5)); // -1.5 to -0.8
  } else if (lis > 130 && lis <= 140) {
    baseImpact = -2.5 + ((lis - 130) / 10) * (-1.5 - (-2.5)); // -2.5 to -1.5
  } else if (lis < 60) {
    baseImpact = 2.5; // Maximum negative impact for very low scores
  } else if (lis > 140) {
    baseImpact = -2.5; // Maximum positive impact for very high scores
  }
  
  return baseImpact;
};

/**
 * Estimate potential LIS based on daily completion rate
 * Assumes moving from baseline towards optimal (135) proportionally to completion
 */
export const estimateLISFromCompletion = (completionRate: number, currentBaseline: number = 100): number => {
  // If completion is high, assume moving towards optimal (135)
  const maxGain = 135 - currentBaseline;
  const dailyGain = (maxGain / 90) * (completionRate / 100);
  
  return Math.round(currentBaseline + dailyGain);
};
