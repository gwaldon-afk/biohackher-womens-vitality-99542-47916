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

// Calculate hormone health level from assessment answers
export function calculateHormoneHealth(answers: Record<string, number>) {
  const scores = Object.values(answers);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  const { scoring } = HORMONE_COMPASS_ASSESSMENT;
  
  // Determine health level based on score
  let healthLevel = 'having-challenges';
  let confidence = 0;
  
  for (const [key, range] of Object.entries(scoring.ranges)) {
    if (averageScore >= range.min && averageScore <= range.max) {
      healthLevel = key;
      // Calculate confidence based on how close to range center
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
