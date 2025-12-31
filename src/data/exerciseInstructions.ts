export interface ExerciseStep {
  name: string;
  description: string;
}

export interface ExerciseDetails {
  key: string;
  exercises: ExerciseStep[];
  tips: string[];
  videoUrl?: string | null;
  beginnerModification?: string;
  source?: string;
}

// Match exercise names to their instruction details
export const exerciseInstructions: Record<string, ExerciseDetails> = {
  'lower-body-compound-lifts': {
    key: 'lowerBodyCompound',
    exercises: [
      { name: 'Squats', description: 'Barbell, goblet, or bodyweight - keep knees tracking over toes' },
      { name: 'Deadlifts', description: 'Romanian or conventional - hinge at hips, flat back' },
      { name: 'Lunges', description: 'Walking or stationary - 90° angle at both knees' },
      { name: 'Hip Thrusts', description: 'Glute-focused - squeeze at top, controlled descent' }
    ],
    tips: [
      'Start with a 5-minute dynamic warm-up',
      'Rest 60-90 seconds between sets',
      'Focus on form over weight - quality reps matter',
      'Breathe out on exertion, in on the easier phase'
    ],
    beginnerModification: 'Start with bodyweight only until form is perfected',
    source: 'Stacey Sims - Next Level (2022)'
  },
  'upper-body-compound-lifts': {
    key: 'upperBodyCompound',
    exercises: [
      { name: 'Push-ups', description: 'Full or modified - chest to floor, elbows 45°' },
      { name: 'Rows', description: 'Dumbbell or barbell - squeeze shoulder blades together' },
      { name: 'Overhead Press', description: 'Dumbbells or barbell - core engaged, no arching' },
      { name: 'Pull-ups/Lat Pulldowns', description: 'Wide or neutral grip - full range of motion' }
    ],
    tips: [
      'Warm up shoulders with arm circles and band pull-aparts',
      'Keep core braced throughout all movements',
      'Use full range of motion for maximum benefit',
      'Rest 60-90 seconds between sets'
    ],
    beginnerModification: 'Use resistance bands or lighter weights, incline push-ups',
    source: 'Stacey Sims - ROAR (2016)'
  },
  'hiit-training': {
    key: 'hiit',
    exercises: [
      { name: 'Sprint Intervals', description: '30 seconds max effort running, cycling, or rowing' },
      { name: 'Active Recovery', description: '60-90 seconds easy pace walking or slow cycling' },
      { name: 'Burpees', description: 'Full body explosive movement - chest to ground, jump up' },
      { name: 'Mountain Climbers', description: 'High plank, drive knees to chest rapidly' }
    ],
    tips: [
      'Warm up for 5-10 minutes first with light cardio',
      'Work at 85-95% max heart rate during intervals',
      'Cool down for 5 minutes with gentle movement',
      'Limit HIIT to 2-3 sessions per week for recovery'
    ],
    beginnerModification: 'Reduce intensity to 70-80% effort, extend recovery periods',
    source: 'Dr. Rhonda Patrick - FoundMyFitness'
  },
  'zone-2-cardio': {
    key: 'zone2',
    exercises: [
      { name: 'Brisk Walking', description: '45-60 minutes at conversational pace' },
      { name: 'Easy Cycling', description: 'Steady state, able to hold a conversation' },
      { name: 'Light Jogging', description: 'Slow, comfortable pace - nose breathing' },
      { name: 'Swimming', description: 'Relaxed laps, focus on technique over speed' }
    ],
    tips: [
      'You should be able to talk comfortably (nasal breathing)',
      'Heart rate around 60-70% of max (roughly 180 minus age)',
      'Duration matters more than intensity',
      'Great for fat oxidation and mitochondrial health'
    ],
    beginnerModification: 'Start with 20-30 minutes and build up gradually',
    source: 'Dr. Peter Attia - Outlive (2023)'
  },
  'yoga-stretching': {
    key: 'yoga',
    exercises: [
      { name: 'Sun Salutations', description: 'Flow sequence linking breath to movement' },
      { name: 'Cat-Cow Stretch', description: 'Spinal mobility - alternate arching and rounding' },
      { name: "Downward Dog", description: 'Hamstring and calf stretch, shoulder opening' },
      { name: "Child's Pose", description: 'Rest position - hips to heels, arms extended' }
    ],
    tips: [
      'Never stretch to the point of pain',
      'Breathe deeply - exhale to deepen stretches',
      'Hold static stretches for 30-60 seconds',
      'Best done after a warm-up or workout'
    ],
    beginnerModification: 'Use blocks and props for support, bend knees as needed',
    source: 'Dr. Sara Gottfried - The Hormone Cure'
  },
  'morning-walk': {
    key: 'morningWalk',
    exercises: [
      { name: 'Light Exposure Walk', description: '10-20 minutes within first hour of waking' },
      { name: 'Grounding Walk', description: 'Barefoot on grass if possible for added benefits' }
    ],
    tips: [
      'Get outside within 30-60 minutes of waking',
      'No sunglasses - let natural light reach your eyes',
      'Helps set circadian rhythm and boost cortisol awakening response',
      'Combine with light stretching if desired'
    ],
    beginnerModification: 'Even 5-10 minutes provides benefit',
    source: 'Dr. Andrew Huberman - Huberman Lab'
  },
  'resistance-training': {
    key: 'resistance',
    exercises: [
      { name: 'Compound Movements', description: 'Multi-joint exercises like squats, deadlifts, presses' },
      { name: 'Isolation Work', description: 'Single-joint exercises for targeted muscle groups' },
      { name: 'Core Exercises', description: 'Planks, dead bugs, pallof press for stability' }
    ],
    tips: [
      'Progressive overload - gradually increase weight or reps',
      'Focus on the 2-3 biggest compound lifts',
      'Train each muscle group 2x per week minimum',
      'Prioritise recovery - muscles grow during rest'
    ],
    beginnerModification: 'Start with machines or bodyweight before free weights',
    source: 'Stacey Sims - Next Level (2022)'
  },
  'strength-training': {
    key: 'strength',
    exercises: [
      { name: 'Squat Variation', description: 'Back squat, front squat, or goblet squat' },
      { name: 'Hinge Variation', description: 'Deadlift, Romanian deadlift, or kettlebell swing' },
      { name: 'Push Variation', description: 'Bench press, overhead press, or push-ups' },
      { name: 'Pull Variation', description: 'Rows, pull-ups, or lat pulldowns' }
    ],
    tips: [
      'Warm up with lighter sets first',
      'Use challenging weights - last 2-3 reps should be hard',
      'Rest 2-3 minutes between heavy compound sets',
      'Track your weights and reps for progressive overload'
    ],
    beginnerModification: 'Focus on form with lighter weights first',
    source: 'ACSM Guidelines for Strength Training'
  }
};

// Helper to find exercise details by action title
export const getExerciseDetails = (title: string): ExerciseDetails | null => {
  const normalised = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  // Direct match
  if (exerciseInstructions[normalised]) {
    return exerciseInstructions[normalised];
  }
  
  // Partial match
  for (const [key, details] of Object.entries(exerciseInstructions)) {
    if (normalised.includes(key) || key.includes(normalised)) {
      return details;
    }
    // Also check if title contains keywords from the key
    const keyWords = key.split('-');
    if (keyWords.some(word => normalised.includes(word) && word.length > 3)) {
      return details;
    }
  }
  
  // Keyword-based fallback
  if (normalised.includes('lower') || normalised.includes('leg') || normalised.includes('squat')) {
    return exerciseInstructions['lower-body-compound-lifts'];
  }
  if (normalised.includes('upper') || normalised.includes('push') || normalised.includes('pull')) {
    return exerciseInstructions['upper-body-compound-lifts'];
  }
  if (normalised.includes('hiit') || normalised.includes('interval') || normalised.includes('sprint')) {
    return exerciseInstructions['hiit-training'];
  }
  if (normalised.includes('zone') || normalised.includes('cardio') || normalised.includes('walk')) {
    return exerciseInstructions['zone-2-cardio'];
  }
  if (normalised.includes('yoga') || normalised.includes('stretch') || normalised.includes('mobility')) {
    return exerciseInstructions['yoga-stretching'];
  }
  if (normalised.includes('resistance') || normalised.includes('strength') || normalised.includes('lift')) {
    return exerciseInstructions['resistance-training'];
  }
  
  return null;
};
