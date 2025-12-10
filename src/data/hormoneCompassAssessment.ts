// MRS (Menopause Rating Scale) Population Norms by Age Group
// Based on published research data for reference
const MRS_POPULATION_NORMS: Record<string, { expected: number; sd: number }> = {
  '25-35': { expected: 7, sd: 4 },   // Pre-hormone transition
  '36-45': { expected: 12, sd: 5 },  // Early transition
  '46-55': { expected: 18, sd: 6 },  // Peak hormone fluctuation
  '56-65': { expected: 14, sd: 5 },  // Post-transition stabilization
  '66+': { expected: 10, sd: 4 }     // Settled post-hormonal
};

// Get expected symptom severity for age
function getExpectedSeverityForAge(age: number): { expected: number; sd: number } {
  if (age <= 35) return MRS_POPULATION_NORMS['25-35'];
  if (age <= 45) return MRS_POPULATION_NORMS['36-45'];
  if (age <= 55) return MRS_POPULATION_NORMS['46-55'];
  if (age <= 65) return MRS_POPULATION_NORMS['56-65'];
  return MRS_POPULATION_NORMS['66+'];
}

export interface HormoneAgeResult {
  hormoneAge: number;
  chronologicalAge: number;
  ageOffset: number;
  severityScore: number;
  healthLevel: string;
  confidence: number;
  avgScore: number;
}

export const HORMONE_COMPASS_ASSESSMENT = {
  id: 'hormone-compass-complete',
  name: 'HormoneCompass™ Complete Assessment',
  description: 'Comprehensive hormone health assessment across 6 key domains—for women at every life stage',
  duration: '5 minutes',
  domains: [
    {
      id: 'cycle-patterns',
      name: 'Cycle & Period Patterns',
      icon: '🩸',
      questions: [
        {
          id: 'cycle_regularity',
          text: 'How regular are your menstrual cycles?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very irregular or absent',
            maxLabel: 'Completely regular'
          }
        },
        {
          id: 'flow_heaviness',
          text: 'How would you describe your period flow?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very heavy or very light',
            maxLabel: 'Normal and consistent'
          }
        },
        {
          id: 'cycle_length',
          text: 'How much does your cycle length vary?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Highly variable (>7 days)',
            maxLabel: 'Very consistent'
          }
        }
      ]
    },
    {
      id: 'sleep-thermo',
      name: 'Sleep & Thermoregulation',
      icon: '🌡️',
      questions: [
        {
          id: 'sleep_quality',
          text: 'How would you rate your overall sleep quality?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very poor',
            maxLabel: 'Excellent'
          }
        },
        {
          id: 'night_sweats',
          text: 'How often do you experience night sweats?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Most nights',
            maxLabel: 'Never'
          }
        },
        {
          id: 'temperature_regulation',
          text: 'How well can you regulate your body temperature?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very poorly (hot flashes)',
            maxLabel: 'Very well'
          }
        }
      ]
    },
    {
      id: 'mood-focus',
      name: 'Mood & Focus',
      icon: '🧠',
      questions: [
        {
          id: 'mood_swings',
          text: 'How stable is your mood throughout the day?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very unstable',
            maxLabel: 'Very stable'
          }
        },
        {
          id: 'anxiety',
          text: 'How would you rate your anxiety levels?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Severe anxiety',
            maxLabel: 'Minimal or none'
          }
        },
        {
          id: 'brain_fog',
          text: 'How often do you experience brain fog or difficulty concentrating?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very frequently',
            maxLabel: 'Rarely or never'
          }
        }
      ]
    },
    {
      id: 'energy-weight',
      name: 'Energy & Weight',
      icon: '⚡',
      questions: [
        {
          id: 'fatigue',
          text: 'How would you rate your overall energy levels?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Constantly fatigued',
            maxLabel: 'Energetic and vital'
          }
        },
        {
          id: 'weight_gain',
          text: 'Have you experienced unexplained weight gain?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant gain',
            maxLabel: 'No change or intentional'
          }
        },
        {
          id: 'energy_crashes',
          text: 'How often do you experience energy crashes?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Multiple times daily',
            maxLabel: 'Rarely or never'
          }
        }
      ]
    },
    {
      id: 'libido-sexual',
      name: 'Libido & Sexual Health',
      icon: '💕',
      questions: [
        {
          id: 'libido',
          text: 'How would you rate your sex drive?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very low or absent',
            maxLabel: 'Strong and healthy'
          }
        },
        {
          id: 'vaginal_dryness',
          text: 'Do you experience vaginal dryness?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Frequently',
            maxLabel: 'Never'
          }
        },
        {
          id: 'discomfort',
          text: 'Do you experience discomfort during intimacy?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Frequently',
            maxLabel: 'Never'
          }
        }
      ]
    },
    {
      id: 'skin-hair-nails',
      name: 'Skin, Hair & Nails',
      icon: '✨',
      questions: [
        {
          id: 'skin_dryness',
          text: 'How would you describe your skin moisture levels?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very dry and irritated',
            maxLabel: 'Well-moisturized'
          }
        },
        {
          id: 'hair_changes',
          text: 'Have you noticed changes in your hair (thinning, loss)?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant changes',
            maxLabel: 'No changes'
          }
        },
        {
          id: 'nail_health',
          text: 'How would you rate your nail health?',
          type: 'scale' as const,
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Brittle and weak',
            maxLabel: 'Strong and healthy'
          }
        }
      ]
    }
  ],
  scoring: {
    ranges: {
      'feeling-great': { min: 4.5, max: 5.0, label: 'Feeling Great' },
      'doing-well': { min: 3.5, max: 4.49, label: 'Doing Well' },
      'having-challenges': { min: 2.5, max: 3.49, label: 'Having Challenges' },
      'really-struggling': { min: 1.5, max: 2.49, label: 'Really Struggling' },
      'need-support': { min: 1.0, max: 1.49, label: 'Need Support Now' }
    }
  }
};

/**
 * Calculate Hormone Age based on symptom severity compared to age-normalized MRS population norms
 * 
 * Formula: Hormone Age = Chronological Age + Age Offset
 * Where Age Offset = (User Severity - Expected Severity for Age) × Multiplier
 * 
 * A higher symptom severity relative to age-expected norms results in "older" hormone age
 */
export function calculateHormoneAge(
  answers: Record<string, number>, 
  chronologicalAge: number
): HormoneAgeResult {
  const scores = Object.values(answers);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Step 1: Calculate symptom severity (reverse of wellness scores)
  // Current scale: 1 = severe symptoms, 5 = no symptoms
  // Convert to severity: 5 - score = severity (0-4 scale per question)
  // Total severity range: 0-72 for 18 questions (18 × 4 = 72)
  let totalSeverity = 0;
  for (const score of scores) {
    totalSeverity += (5 - score); // Convert wellness to severity
  }
  
  // Normalize to MRS-comparable scale (0-44 typical range)
  // Our 18 questions × 4 max = 72, MRS uses 11 questions × 4 = 44
  // Scale factor: 44/72 ≈ 0.61
  const normalizedSeverity = totalSeverity * (44 / 72);
  
  // Step 2: Get expected severity for user's age
  const { expected: expectedSeverity, sd } = getExpectedSeverityForAge(chronologicalAge);
  
  // Step 3: Calculate deviation from expected
  // Positive deviation = more symptoms than expected = "older" hormone age
  // Negative deviation = fewer symptoms than expected = "younger" hormone age
  const deviation = normalizedSeverity - expectedSeverity;
  
  // Step 4: Convert deviation to years using multiplier
  // Each standard deviation roughly equals 3-5 years of "hormone aging"
  // Multiplier calibrated so 1 SD ≈ 4 years
  const yearsPerSD = 4;
  const ageOffset = Math.round((deviation / sd) * yearsPerSD);
  
  // Step 5: Apply bounds (±15 years from chronological age)
  const boundedOffset = Math.max(-15, Math.min(15, ageOffset));
  const hormoneAge = chronologicalAge + boundedOffset;
  
  // Step 6: Determine health level for backward compatibility
  const { scoring } = HORMONE_COMPASS_ASSESSMENT;
  let healthLevel = 'having-challenges';
  let confidence = 0;
  
  for (const [key, range] of Object.entries(scoring.ranges)) {
    if (averageScore >= range.min && averageScore <= range.max) {
      healthLevel = key;
      const rangeMid = (range.min + range.max) / 2;
      const rangeSize = range.max - range.min;
      const distanceFromMid = Math.abs(averageScore - rangeMid);
      confidence = Math.max(0.6, 1 - (distanceFromMid / rangeSize));
      break;
    }
  }
  
  return {
    hormoneAge: Math.max(18, Math.min(100, hormoneAge)), // Reasonable bounds
    chronologicalAge,
    ageOffset: boundedOffset,
    severityScore: Math.round(normalizedSeverity),
    healthLevel,
    confidence: Math.min(Math.round(confidence * 100), 100),
    avgScore: averageScore
  };
}

// Legacy function for backward compatibility (no age provided)
export function calculateHormoneHealth(answers: Record<string, number>) {
  const scores = Object.values(answers);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const { scoring } = HORMONE_COMPASS_ASSESSMENT;
  
  let healthLevel = 'having-challenges';
  let confidence = 0;
  
  for (const [key, range] of Object.entries(scoring.ranges)) {
    if (averageScore >= range.min && averageScore <= range.max) {
      healthLevel = key;
      const rangeMid = (range.min + range.max) / 2;
      const rangeSize = range.max - range.min;
      const distanceFromMid = Math.abs(averageScore - rangeMid);
      confidence = Math.max(0.6, 1 - (distanceFromMid / rangeSize));
      break;
    }
  }
  
  return { 
    stage: healthLevel, 
    confidence: Math.min(Math.round(confidence * 100), 100),
    avgScore: averageScore
  };
}

// Legacy export for backward compatibility
export const calculateHormoneStage = calculateHormoneHealth;
