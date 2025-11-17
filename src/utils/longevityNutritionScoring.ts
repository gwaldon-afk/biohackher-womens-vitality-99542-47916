// Longevity Nutrition Assessment Scoring Logic

export interface LongevityNutritionData {
  protein_score: number; // 0-4
  fiber_score: number; // 1-4
  plant_diversity_score: number; // 1-4
  gut_symptom_score: number; // 0-4
  inflammation_score: number; // 0-6
  craving_pattern: number; // 1-5
  hydration_score: number; // 1-5
}

export interface ScoreResult {
  score: number;
  category: string;
  grade: string;
  color: string;
  description: string;
}

export interface PillarScore {
  name: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
}

/**
 * Calculate longevity nutrition score from assessment data
 * Formula: (protein + fiber + plant_diversity + (5-gut_symptoms) + (6-inflammation) + (5-craving) + hydration) / 7 * 20
 */
export function calculateLongevityNutritionScore(data: LongevityNutritionData): number {
  const {
    protein_score,
    fiber_score,
    plant_diversity_score,
    gut_symptom_score,
    inflammation_score,
    craving_pattern,
    hydration_score,
  } = data;

  // Invert negative scores (higher symptoms = worse score)
  const invertedGutScore = 5 - gut_symptom_score;
  const invertedInflammationScore = 6 - inflammation_score;
  const invertedCravingScore = 5 - craving_pattern;

  const totalScore =
    protein_score +
    fiber_score +
    plant_diversity_score +
    invertedGutScore +
    invertedInflammationScore +
    invertedCravingScore +
    hydration_score;

  // Scale to 0-100
  const longevityScore = (totalScore / 7) * 20;

  return Math.round(longevityScore * 10) / 10; // Round to 1 decimal
}

/**
 * Get score category and details
 */
export function getScoreCategory(score: number): ScoreResult {
  if (score >= 90) {
    return {
      score,
      category: 'Optimal',
      grade: 'A',
      color: 'text-green-600',
      description:
        'Your nutrition is exceptionally well-optimized for longevity. You\'re supporting cellular health, hormonal balance, and metabolic resilience.',
    };
  } else if (score >= 80) {
    return {
      score,
      category: 'Excellent',
      grade: 'B+',
      color: 'text-emerald-600',
      description:
        'You have a strong nutritional foundation. With a few targeted optimizations, you can reach peak longevity nutrition.',
    };
  } else if (score >= 70) {
    return {
      score,
      category: 'Good',
      grade: 'B',
      color: 'text-blue-600',
      description:
        'Your nutrition supports general health. There are clear opportunities to enhance longevity markers through targeted improvements.',
    };
  } else if (score >= 60) {
    return {
      score,
      category: 'Fair',
      grade: 'C',
      color: 'text-yellow-600',
      description:
        'Your nutrition has a foundation, but several key areas need attention to optimize for longevity and hormonal health.',
    };
  } else if (score >= 50) {
    return {
      score,
      category: 'Needs Improvement',
      grade: 'D',
      color: 'text-orange-600',
      description:
        'Significant nutritional gaps are impacting your longevity potential. Targeted changes can create meaningful improvements.',
    };
  } else {
    return {
      score,
      category: 'Critical Attention Needed',
      grade: 'F',
      color: 'text-red-600',
      description:
        'Your nutrition requires immediate attention. These patterns may be accelerating aging and disrupting metabolic health. Let\'s create a supportive plan.',
    };
  }
}

/**
 * Calculate pillar-specific scores
 */
export function calculatePillarScores(data: LongevityNutritionData & {
  activity_level?: string;
  menopause_stage?: string;
}): Record<string, PillarScore> {
  const { protein_score, fiber_score, plant_diversity_score, gut_symptom_score, inflammation_score, hydration_score } = data;

  return {
    BODY: {
      name: 'BODY',
      score: protein_score,
      maxScore: 4,
      percentage: (protein_score / 4) * 100,
      status: protein_score >= 3 ? 'excellent' : protein_score >= 2 ? 'good' : 'needs-improvement',
    },
    BRAIN: {
      name: 'BRAIN',
      score: 6 - inflammation_score,
      maxScore: 6,
      percentage: ((6 - inflammation_score) / 6) * 100,
      status: inflammation_score <= 1 ? 'excellent' : inflammation_score <= 3 ? 'good' : 'needs-improvement',
    },
    BALANCE: {
      name: 'BALANCE',
      score: gut_symptom_score === 0 ? 4 : 5 - gut_symptom_score,
      maxScore: 4,
      percentage: ((5 - gut_symptom_score) / 4) * 100,
      status: gut_symptom_score === 0 ? 'excellent' : gut_symptom_score <= 2 ? 'good' : 'needs-improvement',
    },
    BEAUTY: {
      name: 'BEAUTY',
      score: Math.round((hydration_score + plant_diversity_score + fiber_score) / 3),
      maxScore: 5,
      percentage: ((hydration_score + plant_diversity_score + fiber_score) / 15) * 100,
      status:
        (hydration_score + plant_diversity_score + fiber_score) / 3 >= 4
          ? 'excellent'
          : (hydration_score + plant_diversity_score + fiber_score) / 3 >= 3
            ? 'good'
            : 'needs-improvement',
    },
  };
}

/**
 * Get eating personality insights
 */
export function getEatingPersonalityInsights(type: string): {
  title: string;
  description: string;
  challenges: string[];
  recommendations: string[];
} {
  const insights: Record<string, any> = {
    'grazer': {
      title: 'The Grazer',
      description: 'You prefer frequent small meals throughout the day rather than structured eating windows.',
      challenges: [
        'Blood sugar instability from constant eating',
        'Reduced autophagy and cellular repair',
        'Difficulty tracking total daily intake',
      ],
      recommendations: [
        'Gradually extend time between meals to 3-4 hours',
        'Front-load protein and fiber in first meal',
        'Try a 12-hour overnight fast (8pm to 8am)',
      ],
    },
    'emotional-eater': {
      title: 'The Emotional Eater',
      description: 'You use food as comfort, stress relief, or emotional regulation.',
      challenges: [
        'Consuming calories beyond physical hunger',
        'Choosing hyperpalatable processed foods',
        'Guilt cycles affecting relationship with food',
      ],
      recommendations: [
        'Practice 5-minute pause before eating when stressed',
        'Keep stress-relief toolkit (walk, breathing, journaling)',
        'Stock kitchen with nourishing comfort foods (herbal tea, dark chocolate 85%)',
      ],
    },
    'under-eater': {
      title: 'The Under-Eater',
      description: 'You consistently eat less than your body needs, often skipping meals.',
      challenges: [
        'Slowed metabolism and hormone disruption',
        'Muscle loss and reduced bone density',
        'Energy crashes and poor recovery',
      ],
      recommendations: [
        'Set meal reminders for consistent timing',
        'Start with calorie-dense foods (nuts, avocado, salmon)',
        'Track protein intake to ensure 100g+ daily',
      ],
    },
    'late-night-snacker': {
      title: 'The Late-Night Snacker',
      description: 'You eat late into the evening, often after dinner.',
      challenges: [
        'Disrupted circadian metabolism',
        'Poor sleep quality and recovery',
        'Elevated fasting glucose and insulin',
      ],
      recommendations: [
        'Set firm kitchen-closed time (3 hours before bed)',
        'Have satisfying dinner with protein and fiber',
        'Try herbal tea or sparkling water for evening ritual',
      ],
    },
    'over-scheduled-skipper': {
      title: 'The Over-Scheduled Skipper',
      description: 'Your busy schedule leads to inconsistent meal timing and frequent skipping.',
      challenges: [
        'Erratic blood sugar and energy crashes',
        'Poor food choices when finally eating',
        'Stress hormone elevation from undereating',
      ],
      recommendations: [
        'Batch prep grab-and-go meals on Sunday',
        'Keep emergency protein snacks in bag (nuts, protein bar)',
        'Schedule meals like important meetings',
      ],
    },
    'sugar-rollercoaster': {
      title: 'The Sugar Rollercoaster',
      description: 'You experience blood sugar swings with intense cravings and energy crashes.',
      challenges: [
        'Insulin resistance development',
        'Accelerated aging from glycation',
        'Mood instability and brain fog',
      ],
      recommendations: [
        'Always pair carbs with protein and fat',
        'Start day with savory protein breakfast',
        'Swap refined sugar for berries, dates, or stevia',
      ],
    },
    'high-protein-performer': {
      title: 'The High-Protein Performer',
      description: 'You prioritize protein and performance nutrition.',
      challenges: [
        'Potential neglect of plant diversity',
        'May lack sufficient fiber for gut health',
        'Could benefit from chrono-nutrition timing',
      ],
      recommendations: [
        'Add 30g plants daily while maintaining protein',
        'Time protein around workouts for optimal synthesis',
        'Include fermented foods for gut microbiome',
      ],
    },
    'gut-healer': {
      title: 'The Gut Healer',
      description: 'You\'re actively working to improve digestive health and reduce symptoms.',
      challenges: [
        'Navigating trigger foods and restrictions',
        'Ensuring adequate nutrient intake',
        'Balancing elimination with reintroduction',
      ],
      recommendations: [
        'Work with elimination protocol (low-FODMAP, gluten-free)',
        'Prioritize bone broth, collagen, and omega-3s',
        'Systematic reintroduction testing every 2 weeks',
      ],
    },
  };

  return insights[type] || insights['grazer'];
}
