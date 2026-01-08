/**
 * DEVELOPER TEST PERSONAS
 * 
 * 9 realistic Australian women test personas for assessment testing.
 * Each represents a different user profile with detailed backstory, demographics, and health states.
 * 
 * Test User ID Convention: test-user-1 through test-user-9
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

export interface TestPersonaBackstory {
  fullName: string;
  nickname: string;
  occupation: string;
  location: string;
  familySituation: string;
  whyTheyreHere: string;
  challenges: string[];
  personality: string;
  typicalDay: string;
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
  backstory: TestPersonaBackstory;
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
  // Mia Chen - 35, Weight Loss, Struggling - Registered, Manual Entry
  {
    id: 'test1',
    name: 'Mia Chen',
    description: 'Marketing manager, mum of 2, emotional eater',
    testUserId: '00000000-0000-0000-0000-000000000001',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    backstory: {
      fullName: 'Mia Chen',
      nickname: 'Mia',
      occupation: 'Marketing Manager at a tech startup',
      location: 'Sydney, Inner West',
      familySituation: 'Married, two kids (3 and 6), husband works long hours in finance',
      whyTheyreHere: "Gained 15kg since having kids, tried every diet, nothing sticks. Her GP mentioned she's pre-diabetic and it scared her.",
      challenges: ['Emotional eating when stressed', 'No time for herself', 'Exhausted by evening', 'Relies on convenience foods'],
      personality: 'Ambitious but burnt out, perfectionist who beats herself up when she "fails", needs quick wins to stay motivated',
      typicalDay: '6am wake with kids, rush to daycare/school, back-to-back meetings, grabs lunch at desk, picks up kids at 5:30pm, dinner/bath/bed chaos, collapses on couch with wine at 9pm',
    },
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

  // Jessica Nguyen - 35, Energy Focus, Fair - Registered, Manual Entry
  {
    id: 'test2',
    name: 'Jessica Nguyen',
    description: 'Primary school teacher, afternoon energy crashes',
    testUserId: '00000000-0000-0000-0000-000000000002',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    backstory: {
      fullName: 'Jessica Nguyen',
      nickname: 'Jess',
      occupation: 'Primary school teacher',
      location: 'Melbourne, Bayside',
      familySituation: 'Single, lives alone with her cat, close to her Vietnamese-Australian parents',
      whyTheyreHere: 'Constant afternoon energy crashes, surviving on coffee, worried she\'s burning out before 40. Friends suggested she try tracking her habits.',
      challenges: ['3pm slump every day', 'Poor sleep despite being exhausted', 'Stress from demanding classroom', 'Skips meals then overeats at night'],
      personality: 'Caring and gives too much to others, struggles to prioritise herself, methodical and likes data/tracking',
      typicalDay: '5:30am alarm, coffee before school, on feet all day with 28 kids, grabs a muffin at recess, crashes at 3pm, drags herself to yoga sometimes, in bed by 9pm but can\'t sleep',
    },
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

  // Karen Mitchell - 45, Hormone Balance, Fair - Premium, Wearable (Garmin)
  {
    id: 'test3',
    name: 'Karen Mitchell',
    description: 'Single mum, practice manager, perimenopause pioneer',
    testUserId: '00000000-0000-0000-0000-000000000003',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'garmin',
    backstory: {
      fullName: 'Karen Mitchell',
      nickname: 'Kaz',
      occupation: 'Practice Manager at a medical centre',
      location: 'Brisbane, Northside',
      familySituation: 'Divorced 3 years ago, two teenagers (14 and 17), shares custody',
      whyTheyreHere: 'Perimenopause hit her hard. Brain fog at work is embarrassing, mood swings are affecting her kids, night sweats wrecking sleep. Her doctor dismissed her concerns.',
      challenges: ['Feeling invisible and "past it"', 'Hormonal symptoms she doesn\'t understand', 'Juggling single parenting with demanding job', 'Doesn\'t know who to trust for advice'],
      personality: 'Organised and efficient, fiercely independent since divorce, secretly scared about ageing, wants evidence-based solutions',
      typicalDay: '6am wake (often after broken sleep), gets teens sorted, at work by 8am managing chaos, lunch at desk, home by 5:30pm, dinner prep, helps with homework, in bed by 10pm but lies awake',
    },
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

  // Dr Priya Sharma - 45, Cognitive/Brain Health, Good - Premium, Wearable (Apple Watch)
  {
    id: 'test4',
    name: 'Priya Sharma',
    description: 'Anaesthetist, high achiever, fears cognitive decline',
    testUserId: '00000000-0000-0000-0000-000000000004',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'apple_health',
    backstory: {
      fullName: 'Dr Priya Sharma',
      nickname: 'Priya',
      occupation: 'Anaesthetist at a major hospital',
      location: 'Perth, Western Suburbs',
      familySituation: 'Married to a fellow doctor, one daughter (12), both sets of parents in India',
      whyTheyreHere: 'Noticed her recall isn\'t as sharp in theatre. Her specialty requires precision. Watched her mother develop early dementia and is terrified. Wants to be proactive.',
      challenges: ['Shift work disrupts circadian rhythm', 'High-stakes job requires constant mental clarity', 'Perimenopause starting', 'Family history of Alzheimer\'s'],
      personality: 'Analytical and research-driven, high achiever, struggles to accept normal ageing, wants optimal everything',
      typicalDay: 'Varies with shifts - some days 6am starts, some 12-hour nights. On days off: gym at 6am, clinical reading, quality time with daughter, meditation practice, strict sleep protocol',
    },
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
        title: 'Optimise cognitive function',
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

  // Margaret "Marg" Thompson - 60, Sleep Focus, Fair - Registered, Manual Entry
  {
    id: 'test5',
    name: 'Margaret Thompson',
    description: 'Recently widowed, struggling with sleep and loneliness',
    testUserId: '00000000-0000-0000-0000-000000000005',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    backstory: {
      fullName: 'Margaret Thompson',
      nickname: 'Marg',
      occupation: 'Semi-retired bookkeeper, works part-time from home',
      location: 'Adelaide, Adelaide Hills',
      familySituation: 'Widowed 2 years ago, three adult children, four grandchildren, recently got a dog for company',
      whyTheyreHere: 'Since her husband passed, she can\'t sleep through the night. Lies awake at 3am with racing thoughts. Exhausted but doesn\'t want sleeping pills. Her daughter set up the app for her.',
      challenges: ['Grief and loneliness affecting sleep', 'Adjusting to living alone', 'Unsure about technology', 'Night waking 3-4 times', 'Feels like she\'s "just existing"'],
      personality: 'Traditional and sceptical of "wellness trends", practical country sensibility, devoted to grandkids, needs things explained simply',
      typicalDay: 'Wakes at 5am (can\'t sleep longer), walks dog at sunrise, bookkeeping work 9am-2pm, watches grandkids some afternoons, TV with dinner, tries to read but falls asleep on couch, wakes at 2am alert',
    },
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

  // Dr Christine "Chrissie" Walsh - 60, Longevity/Anti-aging, Optimal - Premium, Wearable (Oura Ring via demo)
  {
    id: 'test6',
    name: 'Christine Walsh',
    description: 'Retired GP, wellness coach, longevity exemplar',
    testUserId: '00000000-0000-0000-0000-000000000006',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'demo',
    backstory: {
      fullName: 'Dr Christine Walsh',
      nickname: 'Chrissie',
      occupation: 'Retired GP, now health and wellness coach',
      location: 'Byron Bay, NSW',
      familySituation: 'Married 35 years, three adult children, one grandchild on the way',
      whyTheyreHere: 'Living proof that longevity practices work. Biological age tests 8 years younger. Uses the app to track and optimise, and to recommend to her coaching clients.',
      challenges: ['Staying ahead of the curve', 'Avoiding complacency', 'Helping others without being preachy', 'Maintaining muscle mass as she ages'],
      personality: 'Warm and knowledgeable, walks the talk, evidence-based but open to integrative approaches, natural teacher, radiates vitality',
      typicalDay: '5:30am sunrise swim or yoga, cold plunge, green smoothie, coaching clients 9am-1pm, long walk on beach, reading latest research, dinner with husband, in bed by 9pm with excellent sleep hygiene',
    },
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

  // Sarah "Saz" O'Brien - 35, Strength Focus - Premium, Wearable (Garmin)
  {
    id: 'test7',
    name: 'Sarah O\'Brien',
    description: 'PT and gym owner, strength advocate, planning pregnancy',
    testUserId: '00000000-0000-0000-0000-000000000007',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'garmin',
    backstory: {
      fullName: 'Sarah O\'Brien',
      nickname: 'Saz',
      occupation: 'Personal trainer and gym owner',
      location: 'Gold Coast, QLD',
      familySituation: 'Partner (also a trainer), no kids yet but thinking about it, big Irish-Australian family',
      whyTheyreHere: 'Practices what she preaches. Uses the app to track her own protocols and demonstrate to female clients. Focused on proving women don\'t need to fear lifting heavy.',
      challenges: ['Balancing training with recovery', 'Managing a business', 'Helping clients overcome "bulky" fears', 'Optimising for potential pregnancy'],
      personality: 'Energetic and motivating, no-BS attitude, passionate about women\'s strength, competitive but supportive, science-backed',
      typicalDay: '5am wake, morning clients 6-9am, own training 10am, business admin, afternoon clients 4-7pm, protein-rich dinner, foam rolling while watching TV, 9:30pm bed',
    },
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

  // Elizabeth "Beth" Harrison - 50, Biological Age Optimisation - Premium, Wearable (Apple Watch)
  {
    id: 'test8',
    name: 'Elizabeth Harrison',
    description: 'CFO, empty-nester, fighting the corporate cliff',
    testUserId: '00000000-0000-0000-0000-000000000008',
    subscriptionTier: 'premium',
    dataInputMethod: 'wearable',
    wearableProvider: 'apple_health',
    backstory: {
      fullName: 'Elizabeth Harrison',
      nickname: 'Beth',
      occupation: 'Chief Financial Officer at a mid-sized company',
      location: 'Canberra, ACT',
      familySituation: 'Married, empty-nester (twins at university in Sydney), husband is an architect',
      whyTheyreHere: 'Terrified of the corporate "cliff" for women over 50. Invests in her health like she invests in her career. Wants to be the fittest, sharpest 50-year-old in the boardroom.',
      challenges: ['Perimenopause in a male-dominated industry (can\'t show weakness)', 'Travel disrupts routines', 'Perfectionist tendencies', 'Wants measurable results'],
      personality: 'Strategic and disciplined, competitive with herself, results-driven, has disposable income to invest in health, reads every longevity study',
      typicalDay: '5am wake, 45min Zone 2 cardio, cold shower, board meetings 8am-6pm, often business dinners, tracks everything, 10pm strict bedtime with blue-light blocking',
    },
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

  // Holly Brennan - 48, Perimenopause Heavy Symptoms - Registered, Manual Entry
  {
    id: 'test9',
    name: 'Holly Brennan',
    description: 'Nurse, mum of 3, perimenopause is ruining her life',
    testUserId: '00000000-0000-0000-0000-000000000009',
    subscriptionTier: 'registered',
    dataInputMethod: 'manual',
    backstory: {
      fullName: 'Holly Brennan',
      nickname: 'Holly',
      occupation: 'Part-time nurse (reduced hours due to symptoms)',
      location: 'Hobart, Tasmania',
      familySituation: 'Married, three kids (11, 14, 17), husband is a builder',
      whyTheyreHere: 'Perimenopause is ruining her life. Can\'t sleep, hot flashes during patient care are mortifying, brain fog made her cut her hours. Tried HRT but reacted badly. Desperate for natural solutions.',
      challenges: ['Severe symptoms (5+ hot flashes daily)', 'Anxiety she never had before', 'Weight gain despite eating the same', 'Feels like she\'s losing herself', 'Limited budget for supplements'],
      personality: 'Caring and selfless (puts everyone first), starting to feel resentful, needs hope, overwhelmed by conflicting advice, wants simple steps',
      typicalDay: '5am wake (drenched from night sweats), hospital shift 7am-1pm (changed shirts twice), home to kids\' chaos, too tired to exercise, comfort eating after dinner, can\'t fall asleep until midnight despite exhaustion',
    },
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
