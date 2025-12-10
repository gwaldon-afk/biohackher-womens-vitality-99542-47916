/**
 * Metabolic Age Calculator
 * 
 * Calculates Metabolic Age based on longevity nutrition assessment data.
 * Uses a proprietary algorithm informed by:
 * - NHANES metabolic biomarker population norms
 * - Levine et al. Phenotypic Age Calculator methodology
 * - Metabolic syndrome research and body composition studies
 * 
 * Formula: Metabolic Age = Chronological Age + Age Offset
 * Where Age Offset is derived from metabolic risk indicators vs age-expected norms
 */

interface MetabolicAgeInput {
  protein_score: number;          // 1-5 (higher = better protein intake)
  fiber_score: number;            // 1-5 (higher = better fiber intake)
  plant_diversity_score: number;  // 1-5 (higher = more diverse)
  gut_symptom_score: number;      // 0-5+ (higher = more symptoms, worse)
  inflammation_score: number;     // 0-8+ (higher = more symptoms, worse)
  hydration_score: number;        // 1-5 (higher = better hydration)
  craving_pattern: number;        // 1-5 (higher = more cravings, worse)
  metabolic_symptom_flags?: string[]; // Array of metabolic symptom indicators
  activity_level?: string;        // sedentary, light, moderate, active, very_active
  weight_kg?: number;
  height_cm?: number;
}

export interface MetabolicAgeResult {
  metabolicAge: number;
  chronologicalAge: number;
  ageOffset: number;
  severityScore: number;
  healthLevel: string;
  confidence: number;
}

/**
 * Age-normalized expected metabolic severity based on NHANES population data
 * Returns expected severity score and standard deviation for age group
 */
function getExpectedMetabolicSeverityForAge(age: number): { expected: number; sd: number } {
  // Metabolic health typically declines with age
  // Scale: 0-100 severity score where higher = worse metabolic function
  // Values derived from metabolic syndrome prevalence by age (NHANES data patterns)
  
  if (age < 30) {
    return { expected: 18, sd: 8 };  // Young adults - lower baseline
  } else if (age < 40) {
    return { expected: 25, sd: 9 };  // Early adult - slight increase
  } else if (age < 50) {
    return { expected: 35, sd: 10 }; // Middle age - moderate increase
  } else if (age < 60) {
    return { expected: 45, sd: 11 }; // Late middle age - higher prevalence
  } else if (age < 70) {
    return { expected: 52, sd: 12 }; // Senior - further increase
  } else {
    return { expected: 58, sd: 13 }; // Elderly - highest prevalence
  }
}

/**
 * Calculate metabolic severity score from assessment inputs
 * Returns a 0-100 score where higher = worse metabolic health
 */
function calculateMetabolicSeverity(input: MetabolicAgeInput): number {
  let severityScore = 0;
  
  // Protein deficiency contribution (inverted - low protein = high severity)
  // Weight: 15 points max
  const proteinDeficiency = Math.max(0, 5 - (input.protein_score || 3));
  severityScore += proteinDeficiency * 3; // 0-12 points
  
  // Fiber deficiency contribution
  // Weight: 12 points max
  const fiberDeficiency = Math.max(0, 5 - (input.fiber_score || 3));
  severityScore += fiberDeficiency * 2.4; // 0-9.6 points
  
  // Plant diversity deficiency
  // Weight: 10 points max
  const diversityDeficiency = Math.max(0, 5 - (input.plant_diversity_score || 3));
  severityScore += diversityDeficiency * 2; // 0-8 points
  
  // Gut symptom burden (direct - more symptoms = higher severity)
  // Weight: 15 points max
  const gutSymptoms = Math.min(input.gut_symptom_score || 0, 5);
  severityScore += gutSymptoms * 3; // 0-15 points
  
  // Inflammation burden (direct - more symptoms = higher severity)
  // Weight: 20 points max (inflammation is a major metabolic driver)
  const inflammationSymptoms = Math.min(input.inflammation_score || 0, 8);
  severityScore += inflammationSymptoms * 2.5; // 0-20 points
  
  // Hydration deficiency
  // Weight: 8 points max
  const hydrationDeficiency = Math.max(0, 5 - (input.hydration_score || 3));
  severityScore += hydrationDeficiency * 1.6; // 0-6.4 points
  
  // Craving patterns (higher = worse metabolic signaling)
  // Weight: 10 points max
  const cravingBurden = Math.max(0, (input.craving_pattern || 3) - 1);
  severityScore += cravingBurden * 2.5; // 0-10 points
  
  // Metabolic symptom flags (each flag adds severity)
  // Weight: 16 points max (8 symptoms × 2 points each)
  const metabolicSymptomCount = (input.metabolic_symptom_flags || []).length;
  severityScore += metabolicSymptomCount * 2; // 0-16 points
  
  // Activity level adjustment
  // Sedentary adds severity, active reduces
  const activityAdjustment = {
    'sedentary': 6,
    'light': 3,
    'moderate': 0,
    'active': -3,
    'very_active': -6
  }[input.activity_level || 'moderate'] || 0;
  severityScore += activityAdjustment;
  
  // BMI contribution if available
  if (input.weight_kg && input.height_cm) {
    const bmi = input.weight_kg / Math.pow(input.height_cm / 100, 2);
    if (bmi < 18.5) {
      severityScore += 4; // Underweight
    } else if (bmi >= 25 && bmi < 30) {
      severityScore += 5; // Overweight
    } else if (bmi >= 30) {
      severityScore += 10; // Obese
    }
  }
  
  // Normalize to 0-100 range
  return Math.max(0, Math.min(100, severityScore));
}

/**
 * Determine health level category based on severity and age offset
 */
function determineHealthLevel(ageOffset: number, severity: number): string {
  if (ageOffset <= -5) {
    return 'optimal';
  } else if (ageOffset <= -2) {
    return 'excellent';
  } else if (ageOffset <= 2) {
    return 'good';
  } else if (ageOffset <= 5) {
    return 'fair';
  } else if (ageOffset <= 10) {
    return 'needs-attention';
  } else {
    return 'critical';
  }
}

/**
 * Calculate Metabolic Age based on assessment data and chronological age
 * 
 * @param input - Assessment data including nutrition scores
 * @param chronologicalAge - User's actual age in years
 * @returns MetabolicAgeResult with metabolic age, offset, and health categorization
 */
export function calculateMetabolicAge(
  input: MetabolicAgeInput,
  chronologicalAge: number
): MetabolicAgeResult {
  // Step 1: Calculate metabolic severity from assessment inputs
  const severityScore = calculateMetabolicSeverity(input);
  
  // Step 2: Get expected severity for user's age
  const { expected: expectedSeverity, sd } = getExpectedMetabolicSeverityForAge(chronologicalAge);
  
  // Step 3: Calculate deviation from expected
  // Positive deviation = worse than expected = "older" metabolic age
  // Negative deviation = better than expected = "younger" metabolic age
  const deviation = severityScore - expectedSeverity;
  
  // Step 4: Convert deviation to years using calibrated multiplier
  // Each standard deviation roughly equals 4 years of "metabolic aging"
  const yearsPerSD = 4;
  const ageOffset = Math.round((deviation / sd) * yearsPerSD);
  
  // Step 5: Apply bounds (±15 years from chronological age)
  const boundedOffset = Math.max(-15, Math.min(15, ageOffset));
  const metabolicAge = chronologicalAge + boundedOffset;
  
  // Step 6: Determine health level
  const healthLevel = determineHealthLevel(boundedOffset, severityScore);
  
  // Step 7: Calculate confidence based on data completeness
  let confidence = 80; // Base confidence
  if (input.metabolic_symptom_flags && input.metabolic_symptom_flags.length > 0) {
    confidence += 5;
  }
  if (input.activity_level) {
    confidence += 5;
  }
  if (input.weight_kg && input.height_cm) {
    confidence += 5;
  }
  confidence = Math.min(confidence, 95); // Cap at 95%
  
  return {
    metabolicAge: Math.max(18, Math.min(100, metabolicAge)), // Reasonable bounds
    chronologicalAge,
    ageOffset: boundedOffset,
    severityScore: Math.round(severityScore),
    healthLevel,
    confidence
  };
}

/**
 * Legacy function for cases where chronological age is not available
 * Returns just the severity score and health category
 */
export function calculateMetabolicHealth(input: MetabolicAgeInput) {
  const severityScore = calculateMetabolicSeverity(input);
  
  let healthLevel: string;
  if (severityScore < 20) {
    healthLevel = 'optimal';
  } else if (severityScore < 35) {
    healthLevel = 'excellent';
  } else if (severityScore < 50) {
    healthLevel = 'good';
  } else if (severityScore < 65) {
    healthLevel = 'fair';
  } else if (severityScore < 80) {
    healthLevel = 'needs-attention';
  } else {
    healthLevel = 'critical';
  }
  
  return {
    severityScore: Math.round(severityScore),
    healthLevel,
    confidence: 75 // Lower confidence without age context
  };
}
