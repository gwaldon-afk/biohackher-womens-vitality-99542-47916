/**
 * Exercise Snacks Protocol Data
 * 
 * Research basis:
 * - Stamatakis et al. (2022) "VILPA" study in Nature Medicine
 * - Found that brief vigorous intermittent lifestyle physical activity (VILPA) 
 *   lasting 1-2 minutes significantly reduces mortality risk
 * - 3-4 daily bouts of 1-minute vigorous activity associated with:
 *   - 38-40% lower all-cause mortality
 *   - 48-49% lower cardiovascular mortality
 *   - 49% lower cancer mortality
 * 
 * Additional research:
 * - Jenkins et al. (2019) - "Exercise snacks" improve glycemic control
 * - Rafiei et al. (2021) - Brief stair climbing improves cardiorespiratory fitness
 */

export interface ExerciseSnack {
  id: string;
  nameKey: string;
  descriptionKey: string;
  durationSeconds: number;
  intensity: 'moderate' | 'vigorous';
  category: 'cardio' | 'strength' | 'mobility';
  equipmentRequired: boolean;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  pillar: 'body';
  researchCitation: string;
}

export const EXERCISE_SNACKS: ExerciseSnack[] = [
  {
    id: 'stair-climb-burst',
    nameKey: 'exerciseSnacks.items.stairClimbBurst.name',
    descriptionKey: 'exerciseSnacks.items.stairClimbBurst.description',
    durationSeconds: 60,
    intensity: 'vigorous',
    category: 'cardio',
    equipmentRequired: false,
    timeOfDay: 'anytime',
    pillar: 'body',
    researchCitation: 'Rafiei et al. (2021) - Brief stair climbing bouts improve cardiorespiratory fitness'
  },
  {
    id: 'jumping-jacks-burst',
    nameKey: 'exerciseSnacks.items.jumpingJacksBurst.name',
    descriptionKey: 'exerciseSnacks.items.jumpingJacksBurst.description',
    durationSeconds: 60,
    intensity: 'vigorous',
    category: 'cardio',
    equipmentRequired: false,
    timeOfDay: 'morning',
    pillar: 'body',
    researchCitation: 'Stamatakis et al. (2022) - VILPA reduces all-cause mortality by 38-40%'
  },
  {
    id: 'high-knees-burst',
    nameKey: 'exerciseSnacks.items.highKneesBurst.name',
    descriptionKey: 'exerciseSnacks.items.highKneesBurst.description',
    durationSeconds: 60,
    intensity: 'vigorous',
    category: 'cardio',
    equipmentRequired: false,
    timeOfDay: 'afternoon',
    pillar: 'body',
    researchCitation: 'Stamatakis et al. (2022) - Brief vigorous activity reduces cardiovascular mortality by 48-49%'
  },
  {
    id: 'squat-pulses',
    nameKey: 'exerciseSnacks.items.squatPulses.name',
    descriptionKey: 'exerciseSnacks.items.squatPulses.description',
    durationSeconds: 60,
    intensity: 'moderate',
    category: 'strength',
    equipmentRequired: false,
    timeOfDay: 'afternoon',
    pillar: 'body',
    researchCitation: 'Jenkins et al. (2019) - Exercise snacks improve glycemic control and muscle function'
  },
  {
    id: 'burpee-burst',
    nameKey: 'exerciseSnacks.items.burpeeBurst.name',
    descriptionKey: 'exerciseSnacks.items.burpeeBurst.description',
    durationSeconds: 60,
    intensity: 'vigorous',
    category: 'cardio',
    equipmentRequired: false,
    timeOfDay: 'morning',
    pillar: 'body',
    researchCitation: 'Stamatakis et al. (2022) - 3-4 daily VILPA bouts reduce cancer mortality by 49%'
  },
  {
    id: 'wall-sit-hold',
    nameKey: 'exerciseSnacks.items.wallSitHold.name',
    descriptionKey: 'exerciseSnacks.items.wallSitHold.description',
    durationSeconds: 60,
    intensity: 'moderate',
    category: 'strength',
    equipmentRequired: false,
    timeOfDay: 'afternoon',
    pillar: 'body',
    researchCitation: 'Isometric exercise reduces blood pressure - multiple studies'
  },
  {
    id: 'mountain-climbers',
    nameKey: 'exerciseSnacks.items.mountainClimbers.name',
    descriptionKey: 'exerciseSnacks.items.mountainClimbers.description',
    durationSeconds: 60,
    intensity: 'vigorous',
    category: 'cardio',
    equipmentRequired: false,
    timeOfDay: 'anytime',
    pillar: 'body',
    researchCitation: 'Stamatakis et al. (2022) - VILPA study in Nature Medicine'
  },
  {
    id: 'desk-pushups',
    nameKey: 'exerciseSnacks.items.deskPushups.name',
    descriptionKey: 'exerciseSnacks.items.deskPushups.description',
    durationSeconds: 60,
    intensity: 'moderate',
    category: 'strength',
    equipmentRequired: false,
    timeOfDay: 'afternoon',
    pillar: 'body',
    researchCitation: 'Brief resistance exercise improves metabolic markers - multiple studies'
  }
];

export const EXERCISE_SNACKS_PROTOCOL = {
  id: 'exercise-snacks',
  nameKey: 'exerciseSnacks.protocol.name',
  descriptionKey: 'exerciseSnacks.protocol.description',
  categoryKey: 'exerciseSnacks.protocol.category',
  pillar: 'body' as const,
  frequency: 'daily',
  recommendedBouts: 3,
  totalDailyMinutes: 3,
  evidenceLevel: 'strong',
  researchSummaryKey: 'exerciseSnacks.protocol.researchSummary',
  citations: [
    {
      authors: 'Stamatakis E, et al.',
      title: 'Association of wearable device-measured vigorous intermittent lifestyle physical activity with mortality',
      journal: 'Nature Medicine',
      year: 2022,
      doi: '10.1038/s41591-022-02100-x'
    },
    {
      authors: 'Jenkins EM, et al.',
      title: 'Do stair climbing exercise "snacks" improve cardiorespiratory fitness?',
      journal: 'Applied Physiology, Nutrition, and Metabolism',
      year: 2019,
      doi: '10.1139/apnm-2018-0675'
    },
    {
      authors: 'Rafiei H, et al.',
      title: 'Short bouts of stair climbing improve cardiorespiratory fitness',
      journal: 'Journal of Sports Sciences',
      year: 2021,
      doi: '10.1080/02640414.2021.1903680'
    }
  ]
};

/**
 * Get recommended exercise snacks based on time of day and user preferences
 */
export const getRecommendedExerciseSnacks = (
  timeOfDay: 'morning' | 'afternoon' | 'evening',
  preferredIntensity?: 'moderate' | 'vigorous',
  count: number = 3
): ExerciseSnack[] => {
  let filtered = EXERCISE_SNACKS.filter(
    snack => snack.timeOfDay === timeOfDay || snack.timeOfDay === 'anytime'
  );
  
  if (preferredIntensity) {
    filtered = filtered.filter(snack => snack.intensity === preferredIntensity);
  }
  
  // Shuffle and return requested count
  return filtered
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
};

/**
 * Generate daily exercise snack schedule
 */
export const generateDailyExerciseSnackSchedule = (): {
  morning: ExerciseSnack;
  afternoon: ExerciseSnack;
  evening: ExerciseSnack;
} => {
  const morningSnacks = EXERCISE_SNACKS.filter(s => s.timeOfDay === 'morning' || s.timeOfDay === 'anytime');
  const afternoonSnacks = EXERCISE_SNACKS.filter(s => s.timeOfDay === 'afternoon' || s.timeOfDay === 'anytime');
  const eveningSnacks = EXERCISE_SNACKS.filter(s => s.timeOfDay === 'anytime');
  
  return {
    morning: morningSnacks[Math.floor(Math.random() * morningSnacks.length)],
    afternoon: afternoonSnacks[Math.floor(Math.random() * afternoonSnacks.length)],
    evening: eveningSnacks[Math.floor(Math.random() * eveningSnacks.length)]
  };
};
