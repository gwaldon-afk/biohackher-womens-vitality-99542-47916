/**
 * DEVELOPER TEST PERSONAS
 * 
 * 6 preset test personas for assessment testing.
 * Each represents a different user profile across age, goals, and health states.
 * 
 * Test User ID Convention: test-user-1 through test-user-6
 * These IDs are used to avoid conflicts with real user data.
 */

export interface TestPersonaDemographics {
  age: number;
  dateOfBirth: string;
  weight: number; // kg
  height: number; // cm
  primaryGoal: string;
  secondaryGoals: string[];
  menopauseStage: 'cycling' | 'perimenopause' | 'postmenopause';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface TestPersonaLISData {
  sleepScore: number;
  stressScore: number;
  activityScore: number;
  nutritionScore: number;
  socialScore: number;
  cognitiveScore: number;
  overallScore: number;
  biologicalAgeOffset: number; // Added/subtracted from chronological age
  answers: Record<string, number>; // Question ID to answer value
}

export interface TestPersonaNutritionData {
  proteinScore: number;
  fiberScore: number;
  plantDiversityScore: number;
  gutSymptomScore: number;
  inflammationScore: number;
  cravingPattern: number;
  hydrationScore: number;
  overallScore: number;
  grade: string;
  eatingPersonality: string;
  answers: Record<string, string | number>;
}

export interface TestPersonaHormoneData {
  energyVitalityScore: number;
  sleepRecoveryScore: number;
  moodCognitionScore: number;
  physicalSymptomsScore: number;
  metabolicHealthScore: number;
  intimateWellnessScore: number;
  overallScore: number;
  healthLevel: 'feeling_great' | 'doing_well' | 'having_challenges' | 'really_struggling' | 'need_support';
  answers: Record<string, number>;
}

export interface TestPersonaGoal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
}

export interface TestPersonaProtocol {
  id: string;
  name: string;
  category: string;
  tier: 'immediate' | 'foundation' | 'optimization';
  frequency: string;
  timeOfDay: string;
}

export interface TestPersona {
  id: string;
  name: string;
  description: string;
  testUserId: string;
  subscriptionTier: 'registered' | 'premium';
  dataInputMethod: 'manual' | 'wearable';
  wearableProvider?: 'fitbit' | 'garmin' | 'apple_health' | 'demo';
  demographics: TestPersonaDemographics;
  lisData: TestPersonaLISData;
  nutritionData: TestPersonaNutritionData;
  hormoneData: TestPersonaHormoneData;
  goals: TestPersonaGoal[];
  protocols: TestPersonaProtocol[];
}

// Helper to generate date of birth from age
const getDateOfBirth = (age: number): string => {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  return `${birthYear}-06-15`;
};

export const TEST_PERSONAS: TestPersona[] = [
  // Test1: 35, Weight Loss, Struggling - Registered, Manual Entry
  {
    id: 'test1',
    name: 'Test1',
    description: '35yo, Weight Loss focus, Struggling health state',
    testUserId: '00000000-0000-0000-0000-000000000001',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    demographics: {
      age: 35,
      dateOfBirth: getDateOfBirth(35),
      weight: 85,
      height: 165,
      primaryGoal: 'weight_loss',
      secondaryGoals: ['energy', 'metabolism'],
      menopauseStage: 'cycling',
      activityLevel: 'sedentary',
    },
    lisData: {
      sleepScore: 35,
      stressScore: 30,
      activityScore: 25,
      nutritionScore: 40,
      socialScore: 45,
      cognitiveScore: 50,
      overallScore: 38,
      biologicalAgeOffset: 8,
      answers: {
        sleep_quality: 2, sleep_duration: 2, sleep_consistency: 1,
        stress_level: 4, stress_management: 2, recovery: 2,
        exercise_frequency: 1, exercise_intensity: 1, daily_movement: 2,
        diet_quality: 2, hydration: 2, meal_timing: 2,
        social_connections: 2, community: 3, relationships: 2,
        mental_stimulation: 3, learning: 2, focus: 2,
      },
    },
    nutritionData: {
      proteinScore: 2,
      fiberScore: 2,
      plantDiversityScore: 2,
      gutSymptomScore: 4,
      inflammationScore: 4,
      cravingPattern: 4,
      hydrationScore: 2,
      overallScore: 42,
      grade: 'D',
      eatingPersonality: 'emotional_eater',
      answers: {
        protein_sources: 'rarely',
        fiber_intake: 'low',
        plant_variety: 'limited',
        gut_symptoms: 'frequent',
        inflammation_signs: 'noticeable',
        cravings: 'strong_daily',
        water_intake: 'minimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 2,
      sleepRecoveryScore: 2,
      moodCognitionScore: 3,
      physicalSymptomsScore: 2,
      metabolicHealthScore: 2,
      intimateWellnessScore: 3,
      overallScore: 40,
      healthLevel: 'really_struggling',
      answers: {
        energy_morning: 2, energy_afternoon: 2, energy_evening: 2,
        sleep_quality: 2, sleep_onset: 2, night_waking: 3,
        mood_stability: 3, brain_fog: 2, memory: 3,
        hot_flashes: 1, joint_pain: 3, headaches: 3,
        weight_changes: 4, appetite: 3, blood_sugar: 3,
        libido: 2, vaginal_health: 3, cycle_regularity: 2,
      },
    },
    goals: [
      {
        id: 'goal-1',
        title: 'Lose 10kg in 6 months',
        description: 'Sustainable weight loss through diet and exercise',
        targetDate: '2025-06-08',
        status: 'active',
        progress: 15,
      },
    ],
    protocols: [
      { id: 'prot-1', name: 'Morning Walk', category: 'movement', tier: 'immediate', frequency: 'daily', timeOfDay: 'morning' },
      { id: 'prot-2', name: 'Protein with every meal', category: 'nutrition', tier: 'immediate', frequency: 'daily', timeOfDay: 'all_day' },
    ],
  },

  // Test2: 35, Energy & Fatigue, Fair - Registered, Manual Entry
  {
    id: 'test2',
    name: 'Test2',
    description: '35yo, Energy focus, Fair health state',
    testUserId: '00000000-0000-0000-0000-000000000002',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    demographics: {
      age: 35,
      dateOfBirth: getDateOfBirth(35),
      weight: 65,
      height: 168,
      primaryGoal: 'energy',
      secondaryGoals: ['sleep', 'stress'],
      menopauseStage: 'cycling',
      activityLevel: 'light',
    },
    lisData: {
      sleepScore: 55,
      stressScore: 50,
      activityScore: 60,
      nutritionScore: 65,
      socialScore: 70,
      cognitiveScore: 65,
      overallScore: 61,
      biologicalAgeOffset: 2,
      answers: {
        sleep_quality: 3, sleep_duration: 3, sleep_consistency: 2,
        stress_level: 3, stress_management: 3, recovery: 2,
        exercise_frequency: 3, exercise_intensity: 3, daily_movement: 3,
        diet_quality: 3, hydration: 3, meal_timing: 3,
        social_connections: 4, community: 3, relationships: 3,
        mental_stimulation: 3, learning: 3, focus: 3,
      },
    },
    nutritionData: {
      proteinScore: 3,
      fiberScore: 3,
      plantDiversityScore: 3,
      gutSymptomScore: 2,
      inflammationScore: 2,
      cravingPattern: 3,
      hydrationScore: 3,
      overallScore: 62,
      grade: 'C',
      eatingPersonality: 'busy_grazer',
      answers: {
        protein_sources: 'sometimes',
        fiber_intake: 'moderate',
        plant_variety: 'moderate',
        gut_symptoms: 'occasional',
        inflammation_signs: 'mild',
        cravings: 'moderate',
        water_intake: 'adequate',
      },
    },
    hormoneData: {
      energyVitalityScore: 3,
      sleepRecoveryScore: 3,
      moodCognitionScore: 3,
      physicalSymptomsScore: 3,
      metabolicHealthScore: 3,
      intimateWellnessScore: 4,
      overallScore: 55,
      healthLevel: 'having_challenges',
      answers: {
        energy_morning: 2, energy_afternoon: 3, energy_evening: 3,
        sleep_quality: 3, sleep_onset: 3, night_waking: 2,
        mood_stability: 3, brain_fog: 3, memory: 3,
        hot_flashes: 1, joint_pain: 2, headaches: 2,
        weight_changes: 2, appetite: 3, blood_sugar: 3,
        libido: 3, vaginal_health: 4, cycle_regularity: 3,
      },
    },
    goals: [
      {
        id: 'goal-2',
        title: 'Improve daily energy levels',
        description: 'Reduce afternoon crashes and maintain consistent energy',
        targetDate: '2025-03-08',
        status: 'active',
        progress: 40,
      },
    ],
    protocols: [
      { id: 'prot-3', name: 'Sleep by 10pm', category: 'sleep', tier: 'immediate', frequency: 'daily', timeOfDay: 'evening' },
      { id: 'prot-4', name: 'B-Complex supplement', category: 'supplement', tier: 'foundation', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },

  // Test3: 45, Hormone Balance, Fair - Premium, Wearable (Demo)
  {
    id: 'test3',
    name: 'Test3',
    description: '45yo, Hormone Balance focus, Fair health state',
    testUserId: '00000000-0000-0000-0000-000000000003',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    demographics: {
      age: 45,
      dateOfBirth: getDateOfBirth(45),
      weight: 72,
      height: 162,
      primaryGoal: 'hormone_balance',
      secondaryGoals: ['mood', 'sleep'],
      menopauseStage: 'perimenopause',
      activityLevel: 'moderate',
    },
    lisData: {
      sleepScore: 50,
      stressScore: 55,
      activityScore: 65,
      nutritionScore: 60,
      socialScore: 60,
      cognitiveScore: 55,
      overallScore: 58,
      biologicalAgeOffset: 3,
      answers: {
        sleep_quality: 2, sleep_duration: 3, sleep_consistency: 3,
        stress_level: 3, stress_management: 3, recovery: 3,
        exercise_frequency: 3, exercise_intensity: 3, daily_movement: 4,
        diet_quality: 3, hydration: 3, meal_timing: 3,
        social_connections: 3, community: 3, relationships: 3,
        mental_stimulation: 3, learning: 2, focus: 3,
      },
    },
    nutritionData: {
      proteinScore: 3,
      fiberScore: 3,
      plantDiversityScore: 3,
      gutSymptomScore: 3,
      inflammationScore: 3,
      cravingPattern: 3,
      hydrationScore: 3,
      overallScore: 58,
      grade: 'C',
      eatingPersonality: 'mindful_but_inconsistent',
      answers: {
        protein_sources: 'sometimes',
        fiber_intake: 'moderate',
        plant_variety: 'moderate',
        gut_symptoms: 'occasional',
        inflammation_signs: 'moderate',
        cravings: 'moderate',
        water_intake: 'adequate',
      },
    },
    hormoneData: {
      energyVitalityScore: 3,
      sleepRecoveryScore: 2,
      moodCognitionScore: 2,
      physicalSymptomsScore: 3,
      metabolicHealthScore: 3,
      intimateWellnessScore: 2,
      overallScore: 50,
      healthLevel: 'having_challenges',
      answers: {
        energy_morning: 3, energy_afternoon: 2, energy_evening: 3,
        sleep_quality: 2, sleep_onset: 2, night_waking: 3,
        mood_stability: 2, brain_fog: 3, memory: 2,
        hot_flashes: 3, joint_pain: 2, headaches: 3,
        weight_changes: 3, appetite: 3, blood_sugar: 3,
        libido: 2, vaginal_health: 2, cycle_regularity: 2,
      },
    },
    goals: [
      {
        id: 'goal-3',
        title: 'Balance hormones naturally',
        description: 'Reduce perimenopause symptoms through lifestyle changes',
        targetDate: '2025-06-08',
        status: 'active',
        progress: 25,
      },
    ],
    protocols: [
      { id: 'prot-5', name: 'Magnesium before bed', category: 'supplement', tier: 'immediate', frequency: 'daily', timeOfDay: 'evening' },
      { id: 'prot-6', name: 'Seed cycling', category: 'nutrition', tier: 'foundation', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },

  // Test4: 45, Cognitive/Brain Health, Good - Premium, Wearable (Demo)
  {
    id: 'test4',
    name: 'Test4',
    description: '45yo, Brain Health focus, Good health state',
    testUserId: '00000000-0000-0000-0000-000000000004',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    demographics: {
      age: 45,
      dateOfBirth: getDateOfBirth(45),
      weight: 68,
      height: 170,
      primaryGoal: 'cognitive',
      secondaryGoals: ['focus', 'memory'],
      menopauseStage: 'perimenopause',
      activityLevel: 'active',
    },
    lisData: {
      sleepScore: 75,
      stressScore: 70,
      activityScore: 80,
      nutritionScore: 75,
      socialScore: 70,
      cognitiveScore: 65,
      overallScore: 73,
      biologicalAgeOffset: -2,
      answers: {
        sleep_quality: 4, sleep_duration: 4, sleep_consistency: 3,
        stress_level: 2, stress_management: 4, recovery: 3,
        exercise_frequency: 4, exercise_intensity: 4, daily_movement: 4,
        diet_quality: 4, hydration: 4, meal_timing: 3,
        social_connections: 3, community: 4, relationships: 3,
        mental_stimulation: 3, learning: 3, focus: 3,
      },
    },
    nutritionData: {
      proteinScore: 4,
      fiberScore: 4,
      plantDiversityScore: 4,
      gutSymptomScore: 1,
      inflammationScore: 2,
      cravingPattern: 2,
      hydrationScore: 4,
      overallScore: 78,
      grade: 'B+',
      eatingPersonality: 'health_conscious',
      answers: {
        protein_sources: 'frequently',
        fiber_intake: 'high',
        plant_variety: 'diverse',
        gut_symptoms: 'rare',
        inflammation_signs: 'minimal',
        cravings: 'occasional',
        water_intake: 'optimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 4,
      sleepRecoveryScore: 4,
      moodCognitionScore: 3,
      physicalSymptomsScore: 4,
      metabolicHealthScore: 4,
      intimateWellnessScore: 3,
      overallScore: 70,
      healthLevel: 'doing_well',
      answers: {
        energy_morning: 4, energy_afternoon: 4, energy_evening: 3,
        sleep_quality: 4, sleep_onset: 4, night_waking: 2,
        mood_stability: 3, brain_fog: 3, memory: 3,
        hot_flashes: 1, joint_pain: 1, headaches: 1,
        weight_changes: 1, appetite: 4, blood_sugar: 4,
        libido: 3, vaginal_health: 3, cycle_regularity: 3,
      },
    },
    goals: [
      {
        id: 'goal-4',
        title: 'Optimize cognitive function',
        description: 'Improve focus, memory and mental clarity',
        targetDate: '2025-04-08',
        status: 'active',
        progress: 55,
      },
    ],
    protocols: [
      { id: 'prot-7', name: 'Omega-3 supplement', category: 'supplement', tier: 'immediate', frequency: 'daily', timeOfDay: 'morning' },
      { id: 'prot-8', name: 'Brain training 15min', category: 'cognitive', tier: 'foundation', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },

  // Test5: 60, Sleep Optimization, Fair - Registered, Manual Entry
  {
    id: 'test5',
    name: 'Test5',
    description: '60yo, Sleep focus, Fair health state',
    testUserId: '00000000-0000-0000-0000-000000000005',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    demographics: {
      age: 60,
      dateOfBirth: getDateOfBirth(60),
      weight: 75,
      height: 160,
      primaryGoal: 'sleep',
      secondaryGoals: ['recovery', 'stress'],
      menopauseStage: 'postmenopause',
      activityLevel: 'light',
    },
    lisData: {
      sleepScore: 45,
      stressScore: 60,
      activityScore: 55,
      nutritionScore: 65,
      socialScore: 75,
      cognitiveScore: 60,
      overallScore: 60,
      biologicalAgeOffset: 4,
      answers: {
        sleep_quality: 2, sleep_duration: 2, sleep_consistency: 2,
        stress_level: 2, stress_management: 3, recovery: 3,
        exercise_frequency: 3, exercise_intensity: 2, daily_movement: 3,
        diet_quality: 3, hydration: 3, meal_timing: 4,
        social_connections: 4, community: 4, relationships: 4,
        mental_stimulation: 3, learning: 3, focus: 3,
      },
    },
    nutritionData: {
      proteinScore: 3,
      fiberScore: 4,
      plantDiversityScore: 3,
      gutSymptomScore: 2,
      inflammationScore: 2,
      cravingPattern: 2,
      hydrationScore: 3,
      overallScore: 68,
      grade: 'C+',
      eatingPersonality: 'traditional_homecook',
      answers: {
        protein_sources: 'sometimes',
        fiber_intake: 'high',
        plant_variety: 'moderate',
        gut_symptoms: 'occasional',
        inflammation_signs: 'mild',
        cravings: 'occasional',
        water_intake: 'adequate',
      },
    },
    hormoneData: {
      energyVitalityScore: 3,
      sleepRecoveryScore: 2,
      moodCognitionScore: 3,
      physicalSymptomsScore: 3,
      metabolicHealthScore: 3,
      intimateWellnessScore: 3,
      overallScore: 55,
      healthLevel: 'having_challenges',
      answers: {
        energy_morning: 3, energy_afternoon: 3, energy_evening: 2,
        sleep_quality: 2, sleep_onset: 2, night_waking: 4,
        mood_stability: 3, brain_fog: 2, memory: 3,
        hot_flashes: 2, joint_pain: 3, headaches: 2,
        weight_changes: 2, appetite: 3, blood_sugar: 3,
        libido: 2, vaginal_health: 3, cycle_regularity: 5,
      },
    },
    goals: [
      {
        id: 'goal-5',
        title: 'Improve sleep quality',
        description: 'Reduce night waking and increase deep sleep',
        targetDate: '2025-03-08',
        status: 'active',
        progress: 30,
      },
    ],
    protocols: [
      { id: 'prot-9', name: 'No screens after 8pm', category: 'sleep', tier: 'immediate', frequency: 'daily', timeOfDay: 'evening' },
      { id: 'prot-10', name: 'Glycine supplement', category: 'supplement', tier: 'foundation', frequency: 'daily', timeOfDay: 'evening' },
    ],
  },

  // Test6: 60, Longevity/Anti-aging, Optimal - Premium, Wearable (Demo)
  {
    id: 'test6',
    name: 'Test6',
    description: '60yo, Longevity focus, Optimal health state',
    testUserId: '00000000-0000-0000-0000-000000000006',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    demographics: {
      age: 60,
      dateOfBirth: getDateOfBirth(60),
      weight: 62,
      height: 165,
      primaryGoal: 'longevity',
      secondaryGoals: ['vitality', 'prevention'],
      menopauseStage: 'postmenopause',
      activityLevel: 'very_active',
    },
    lisData: {
      sleepScore: 85,
      stressScore: 80,
      activityScore: 90,
      nutritionScore: 88,
      socialScore: 85,
      cognitiveScore: 82,
      overallScore: 85,
      biologicalAgeOffset: -8,
      answers: {
        sleep_quality: 4, sleep_duration: 5, sleep_consistency: 4,
        stress_level: 1, stress_management: 4, recovery: 4,
        exercise_frequency: 5, exercise_intensity: 4, daily_movement: 5,
        diet_quality: 5, hydration: 4, meal_timing: 4,
        social_connections: 4, community: 4, relationships: 5,
        mental_stimulation: 4, learning: 4, focus: 4,
      },
    },
    nutritionData: {
      proteinScore: 5,
      fiberScore: 5,
      plantDiversityScore: 5,
      gutSymptomScore: 1,
      inflammationScore: 1,
      cravingPattern: 1,
      hydrationScore: 5,
      overallScore: 92,
      grade: 'A',
      eatingPersonality: 'longevity_optimized',
      answers: {
        protein_sources: 'always',
        fiber_intake: 'very_high',
        plant_variety: 'extensive',
        gut_symptoms: 'none',
        inflammation_signs: 'none',
        cravings: 'rarely',
        water_intake: 'optimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 5,
      sleepRecoveryScore: 4,
      moodCognitionScore: 5,
      physicalSymptomsScore: 4,
      metabolicHealthScore: 5,
      intimateWellnessScore: 4,
      overallScore: 88,
      healthLevel: 'feeling_great',
      answers: {
        energy_morning: 5, energy_afternoon: 5, energy_evening: 4,
        sleep_quality: 4, sleep_onset: 4, night_waking: 1,
        mood_stability: 5, brain_fog: 1, memory: 5,
        hot_flashes: 1, joint_pain: 1, headaches: 1,
        weight_changes: 1, appetite: 5, blood_sugar: 5,
        libido: 4, vaginal_health: 4, cycle_regularity: 5,
      },
    },
    goals: [
      {
        id: 'goal-6',
        title: 'Maintain optimal healthspan',
        description: 'Continue longevity practices and monitor biomarkers',
        targetDate: '2025-12-08',
        status: 'active',
        progress: 75,
      },
    ],
    protocols: [
      { id: 'prot-11', name: 'Zone 2 cardio 45min', category: 'movement', tier: 'foundation', frequency: 'daily', timeOfDay: 'morning' },
      { id: 'prot-12', name: 'NMN supplement', category: 'supplement', tier: 'optimization', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },
  // Test7: 35, Strength Focus - Premium, Wearable
  {
    id: 'test7',
    name: 'StrengthSara',
    description: '35yo, Strength & Muscle focus, Premium wearable user',
    testUserId: '00000000-0000-0000-0000-000000000007',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    demographics: {
      age: 35,
      dateOfBirth: getDateOfBirth(35),
      weight: 68,
      height: 170,
      primaryGoal: 'strength',
      secondaryGoals: ['muscle', 'energy'],
      menopauseStage: 'cycling',
      activityLevel: 'very_active',
    },
    lisData: {
      sleepScore: 78,
      stressScore: 72,
      activityScore: 92,
      nutritionScore: 85,
      socialScore: 70,
      cognitiveScore: 75,
      overallScore: 79,
      biologicalAgeOffset: -4,
      answers: {
        sleep_quality: 4, sleep_duration: 4, sleep_consistency: 3,
        stress_level: 2, stress_management: 4, recovery: 4,
        exercise_frequency: 5, exercise_intensity: 5, daily_movement: 5,
        diet_quality: 4, hydration: 5, meal_timing: 4,
        social_connections: 3, community: 4, relationships: 3,
        mental_stimulation: 4, learning: 3, focus: 4,
      },
    },
    nutritionData: {
      proteinScore: 5,
      fiberScore: 4,
      plantDiversityScore: 4,
      gutSymptomScore: 1,
      inflammationScore: 1,
      cravingPattern: 2,
      hydrationScore: 5,
      overallScore: 85,
      grade: 'A-',
      eatingPersonality: 'high_protein_performer',
      answers: {
        protein_sources: 'always',
        fiber_intake: 'high',
        plant_variety: 'diverse',
        gut_symptoms: 'rare',
        inflammation_signs: 'minimal',
        cravings: 'occasional',
        water_intake: 'optimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 5,
      sleepRecoveryScore: 4,
      moodCognitionScore: 4,
      physicalSymptomsScore: 4,
      metabolicHealthScore: 5,
      intimateWellnessScore: 4,
      overallScore: 78,
      healthLevel: 'doing_well',
      answers: {
        energy_morning: 5, energy_afternoon: 5, energy_evening: 4,
        sleep_quality: 4, sleep_onset: 4, night_waking: 2,
        mood_stability: 4, brain_fog: 1, memory: 4,
        hot_flashes: 1, joint_pain: 1, headaches: 1,
        weight_changes: 1, appetite: 5, blood_sugar: 5,
        libido: 4, vaginal_health: 4, cycle_regularity: 4,
      },
    },
    goals: [
      {
        id: 'goal-7',
        title: 'Build lean muscle mass',
        description: 'Gain 3kg lean muscle while maintaining body fat',
        targetDate: '2025-06-08',
        status: 'active',
        progress: 45,
      },
    ],
    protocols: [
      { id: 'prot-13', name: 'Strength training 4x/week', category: 'movement', tier: 'foundation', frequency: '4x_weekly', timeOfDay: 'morning' },
      { id: 'prot-14', name: 'Creatine supplement', category: 'supplement', tier: 'optimization', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },

  // Test8: 50, Biological Age Optimisation - Premium, Wearable
  {
    id: 'test8',
    name: 'BioAgeBeth',
    description: '50yo, Biological Age optimisation, Premium wearable user',
    testUserId: '00000000-0000-0000-0000-000000000008',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    demographics: {
      age: 50,
      dateOfBirth: getDateOfBirth(50),
      weight: 65,
      height: 165,
      primaryGoal: 'longevity',
      secondaryGoals: ['biological_age', 'vitality'],
      menopauseStage: 'perimenopause',
      activityLevel: 'active',
    },
    lisData: {
      sleepScore: 82,
      stressScore: 78,
      activityScore: 85,
      nutritionScore: 90,
      socialScore: 80,
      cognitiveScore: 85,
      overallScore: 83,
      biologicalAgeOffset: -6,
      answers: {
        sleep_quality: 4, sleep_duration: 4, sleep_consistency: 4,
        stress_level: 2, stress_management: 4, recovery: 4,
        exercise_frequency: 4, exercise_intensity: 4, daily_movement: 5,
        diet_quality: 5, hydration: 5, meal_timing: 4,
        social_connections: 4, community: 4, relationships: 4,
        mental_stimulation: 4, learning: 4, focus: 4,
      },
    },
    nutritionData: {
      proteinScore: 5,
      fiberScore: 5,
      plantDiversityScore: 5,
      gutSymptomScore: 1,
      inflammationScore: 1,
      cravingPattern: 1,
      hydrationScore: 5,
      overallScore: 90,
      grade: 'A',
      eatingPersonality: 'longevity_optimized',
      answers: {
        protein_sources: 'always',
        fiber_intake: 'very_high',
        plant_variety: 'extensive',
        gut_symptoms: 'none',
        inflammation_signs: 'none',
        cravings: 'rarely',
        water_intake: 'optimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 4,
      sleepRecoveryScore: 4,
      moodCognitionScore: 4,
      physicalSymptomsScore: 3,
      metabolicHealthScore: 4,
      intimateWellnessScore: 3,
      overallScore: 72,
      healthLevel: 'doing_well',
      answers: {
        energy_morning: 4, energy_afternoon: 4, energy_evening: 4,
        sleep_quality: 4, sleep_onset: 4, night_waking: 2,
        mood_stability: 4, brain_fog: 1, memory: 4,
        hot_flashes: 2, joint_pain: 1, headaches: 1,
        weight_changes: 1, appetite: 4, blood_sugar: 4,
        libido: 3, vaginal_health: 3, cycle_regularity: 3,
      },
    },
    goals: [
      {
        id: 'goal-8',
        title: 'Reduce biological age by 8 years',
        description: 'Comprehensive longevity protocol for optimal ageing',
        targetDate: '2025-12-08',
        status: 'active',
        progress: 60,
      },
    ],
    protocols: [
      { id: 'prot-15', name: 'Zone 2 cardio 5x/week', category: 'movement', tier: 'foundation', frequency: '5x_weekly', timeOfDay: 'morning' },
      { id: 'prot-16', name: 'Resveratrol + NMN stack', category: 'supplement', tier: 'optimization', frequency: 'daily', timeOfDay: 'morning' },
    ],
  },

  // Test9: 48, Perimenopause Heavy Symptoms - Registered, Manual Entry
  {
    id: 'test9',
    name: 'HormoneHolly',
    description: '48yo, Deep perimenopause symptoms, Registered manual entry',
    testUserId: '00000000-0000-0000-0000-000000000009',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    demographics: {
      age: 48,
      dateOfBirth: getDateOfBirth(48),
      weight: 74,
      height: 163,
      primaryGoal: 'hormone_balance',
      secondaryGoals: ['sleep', 'mood'],
      menopauseStage: 'perimenopause',
      activityLevel: 'light',
    },
    lisData: {
      sleepScore: 40,
      stressScore: 35,
      activityScore: 45,
      nutritionScore: 55,
      socialScore: 60,
      cognitiveScore: 45,
      overallScore: 47,
      biologicalAgeOffset: 6,
      answers: {
        sleep_quality: 2, sleep_duration: 2, sleep_consistency: 2,
        stress_level: 4, stress_management: 2, recovery: 2,
        exercise_frequency: 2, exercise_intensity: 2, daily_movement: 2,
        diet_quality: 3, hydration: 3, meal_timing: 2,
        social_connections: 3, community: 3, relationships: 3,
        mental_stimulation: 2, learning: 2, focus: 2,
      },
    },
    nutritionData: {
      proteinScore: 3,
      fiberScore: 3,
      plantDiversityScore: 2,
      gutSymptomScore: 4,
      inflammationScore: 4,
      cravingPattern: 5,
      hydrationScore: 2,
      overallScore: 48,
      grade: 'D+',
      eatingPersonality: 'emotional_eater',
      answers: {
        protein_sources: 'sometimes',
        fiber_intake: 'moderate',
        plant_variety: 'limited',
        gut_symptoms: 'frequent',
        inflammation_signs: 'noticeable',
        cravings: 'strong_daily',
        water_intake: 'minimal',
      },
    },
    hormoneData: {
      energyVitalityScore: 2,
      sleepRecoveryScore: 1,
      moodCognitionScore: 2,
      physicalSymptomsScore: 2,
      metabolicHealthScore: 2,
      intimateWellnessScore: 2,
      overallScore: 35,
      healthLevel: 'really_struggling',
      answers: {
        energy_morning: 2, energy_afternoon: 2, energy_evening: 1,
        sleep_quality: 1, sleep_onset: 2, night_waking: 5,
        mood_stability: 2, brain_fog: 4, memory: 2,
        hot_flashes: 5, joint_pain: 3, headaches: 4,
        weight_changes: 4, appetite: 3, blood_sugar: 3,
        libido: 1, vaginal_health: 2, cycle_regularity: 1,
      },
    },
    goals: [
      {
        id: 'goal-9',
        title: 'Manage perimenopause symptoms',
        description: 'Reduce hot flashes, improve sleep, stabilise mood',
        targetDate: '2025-06-08',
        status: 'active',
        progress: 10,
      },
    ],
    protocols: [
      { id: 'prot-17', name: 'Evening primrose oil', category: 'supplement', tier: 'immediate', frequency: 'daily', timeOfDay: 'evening' },
      { id: 'prot-18', name: 'Cooling sleep environment', category: 'sleep', tier: 'immediate', frequency: 'daily', timeOfDay: 'evening' },
    ],
  },
];

// Helper function to get a persona by ID
export const getTestPersona = (id: string): TestPersona | undefined => {
  return TEST_PERSONAS.find(p => p.id === id);
};

// Helper function to get all test user IDs
export const getTestUserIds = (): string[] => {
  return TEST_PERSONAS.map(p => p.testUserId);
};

// Check if a user ID is a test user
export const isTestUserId = (userId: string): boolean => {
  return userId.startsWith('00000000-0000-0000-0000-00000000000');
};
