export const MENOMAP_ASSESSMENT = {
  id: 'menomap-full',
  name: 'MenoMap™ Complete Assessment',
  description: 'Comprehensive menopause stage and symptom evaluation across 6 key domains',
  duration: '5-7 minutes',
  domains: [
    {
      id: 'cycle',
      name: 'Cycle & Period Patterns',
      icon: '🩸',
      questions: [
        {
          id: 'cycle_regularity',
          text: 'How regular are your menstrual cycles?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very irregular or absent',
            maxLabel: 'Very regular (21-35 days)'
          }
        },
        {
          id: 'flow_changes',
          text: 'Have you noticed changes in your menstrual flow?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Much heavier or lighter',
            maxLabel: 'No change'
          }
        },
        {
          id: 'spotting',
          text: 'Do you experience spotting between periods?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Frequently',
            maxLabel: 'Never'
          }
        },
        {
          id: 'cycle_length',
          text: 'How has your cycle length changed?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significantly shorter/longer',
            maxLabel: 'No change'
          }
        },
        {
          id: 'cramping',
          text: 'How are your menstrual cramps compared to before?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Much worse',
            maxLabel: 'No change or better'
          }
        }
      ]
    },
    {
      id: 'thermoregulation',
      name: 'Sleep & Thermoregulation',
      icon: '🌡️',
      questions: [
        {
          id: 'hot_flashes',
          text: 'How often do you experience hot flashes?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Multiple times daily',
            maxLabel: 'Never'
          }
        },
        {
          id: 'night_sweats',
          text: 'Do you wake up sweating at night?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Every night',
            maxLabel: 'Never'
          }
        },
        {
          id: 'sleep_quality',
          text: 'How would you rate your sleep quality?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very poor',
            maxLabel: 'Excellent'
          }
        },
        {
          id: 'temperature_sensitivity',
          text: 'Do you feel more sensitive to temperature changes?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Extremely sensitive',
            maxLabel: 'Not at all'
          }
        },
        {
          id: 'restless_sleep',
          text: 'How restless is your sleep?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very restless',
            maxLabel: 'Very peaceful'
          }
        }
      ]
    },
    {
      id: 'mood',
      name: 'Mood & Focus',
      icon: '🧠',
      questions: [
        {
          id: 'anxiety',
          text: 'How would you rate your anxiety levels?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Severe anxiety',
            maxLabel: 'No anxiety'
          }
        },
        {
          id: 'irritability',
          text: 'How irritable do you feel?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very irritable',
            maxLabel: 'Not irritable'
          }
        },
        {
          id: 'brain_fog',
          text: 'Do you experience brain fog or difficulty concentrating?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Constantly',
            maxLabel: 'Never'
          }
        },
        {
          id: 'motivation',
          text: 'How is your motivation level?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very low',
            maxLabel: 'Very high'
          }
        },
        {
          id: 'memory',
          text: 'Have you noticed changes in your memory?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant decline',
            maxLabel: 'No change'
          }
        }
      ]
    },
    {
      id: 'energy',
      name: 'Energy & Weight',
      icon: '⚡',
      questions: [
        {
          id: 'fatigue',
          text: 'How is your daily energy level?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Constantly fatigued',
            maxLabel: 'Very energetic'
          }
        },
        {
          id: 'weight_gain',
          text: 'Have you experienced weight gain, especially around your midsection?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant gain',
            maxLabel: 'No change'
          }
        },
        {
          id: 'afternoon_slumps',
          text: 'Do you experience afternoon energy slumps?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Every day',
            maxLabel: 'Never'
          }
        },
        {
          id: 'exercise_recovery',
          text: 'How is your exercise recovery?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very slow',
            maxLabel: 'Very quick'
          }
        },
        {
          id: 'metabolism',
          text: 'Have you noticed changes in your metabolism?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Much slower',
            maxLabel: 'No change'
          }
        }
      ]
    },
    {
      id: 'libido',
      name: 'Libido & Sexual Health',
      icon: '💕',
      questions: [
        {
          id: 'libido_changes',
          text: 'How has your libido changed?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significantly decreased',
            maxLabel: 'No change or increased'
          }
        },
        {
          id: 'vaginal_dryness',
          text: 'Do you experience vaginal dryness?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Severe',
            maxLabel: 'Not at all'
          }
        },
        {
          id: 'intimacy_discomfort',
          text: 'Is intimacy uncomfortable or painful?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very uncomfortable',
            maxLabel: 'Not at all'
          }
        },
        {
          id: 'arousal',
          text: 'How easily do you become aroused?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very difficult',
            maxLabel: 'Easily'
          }
        },
        {
          id: 'satisfaction',
          text: 'How satisfied are you with your sexual health overall?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very dissatisfied',
            maxLabel: 'Very satisfied'
          }
        }
      ]
    },
    {
      id: 'skin',
      name: 'Skin, Hair & Nails',
      icon: '✨',
      questions: [
        {
          id: 'skin_dryness',
          text: 'How is your skin dryness?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very dry',
            maxLabel: 'Well-hydrated'
          }
        },
        {
          id: 'hair_thinning',
          text: 'Have you noticed hair thinning?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant thinning',
            maxLabel: 'No change'
          }
        },
        {
          id: 'skin_changes',
          text: 'Have you noticed changes in skin texture or elasticity?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Significant changes',
            maxLabel: 'No change'
          }
        },
        {
          id: 'acne',
          text: 'Do you experience adult acne or breakouts?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Frequently',
            maxLabel: 'Never'
          }
        },
        {
          id: 'healing',
          text: 'How quickly does your skin heal from cuts or blemishes?',
          type: 'scale',
          scale: {
            min: 1,
            max: 5,
            minLabel: 'Very slowly',
            maxLabel: 'Quickly'
          }
        }
      ]
    }
  ],
  scoring: {
    'pre': { min: 23, max: 30, label: 'Pre-Menopause' },
    'early-peri': { min: 18, max: 22, label: 'Early Perimenopause' },
    'mid-peri': { min: 12, max: 17, label: 'Mid Perimenopause' },
    'late-peri': { min: 6, max: 11, label: 'Late Perimenopause' },
    'post': { min: 1, max: 5, label: 'Post-Menopause' }
  }
};

export const calculateMenoStage = (answers: Record<string, number>) => {
  // Calculate average score across all answers (inverted so lower = more severe symptoms)
  const scores = Object.values(answers);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Determine stage based on score
  let stage: string;
  let confidence: number;

  if (avgScore >= 4.5) {
    stage = 'pre';
    confidence = 90 + (avgScore - 4.5) * 20;
  } else if (avgScore >= 3.5) {
    stage = 'early-peri';
    confidence = 75 + (avgScore - 3.5) * 15;
  } else if (avgScore >= 2.5) {
    stage = 'mid-peri';
    confidence = 80 + (avgScore - 2.5) * 10;
  } else if (avgScore >= 1.5) {
    stage = 'late-peri';
    confidence = 75 + (avgScore - 1.5) * 15;
  } else {
    stage = 'post';
    confidence = 85 + avgScore * 10;
  }

  return {
    stage,
    confidence: Math.min(Math.round(confidence), 100),
    avgScore
  };
};
