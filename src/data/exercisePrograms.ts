/**
 * Exercise Programs
 * 
 * Structured workout programs with weekly schedules and detailed workouts.
 * Each program is designed for specific goals and fitness levels.
 */

import type { Exercise } from './exerciseLibrary';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ExerciseSet {
  exerciseKey: string;
  sets: number;
  reps: string; // e.g., "8-12" or "30 seconds"
  rest: string; // e.g., "60s" or "90s"
  rpe?: number; // Rate of Perceived Exertion 1-10
  tempo?: string; // e.g., "3-1-2-0" (eccentric-pause-concentric-pause)
  notes?: string;
}

export interface WorkoutBlock {
  name: string;
  type: 'warmup' | 'main' | 'cooldown' | 'circuit' | 'superset';
  exercises: ExerciseSet[];
  restBetweenRounds?: string;
  rounds?: number;
}

export interface DayWorkout {
  dayNumber: number;
  name: string;
  focus: string;
  estimatedDuration: number; // minutes
  blocks: WorkoutBlock[];
  notes?: string;
}

export interface WeekStructure {
  weekNumber: number;
  theme?: string;
  days: DayWorkout[];
  progressionNotes?: string;
}

export interface ExerciseProgram {
  key: string;
  name: string;
  description: string;
  detailedDescription: string;
  durationWeeks: number;
  sessionsPerWeek: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  equipmentRequired: string[];
  equipmentOptional?: string[];
  suitableFor: string[];
  focusAreas: string[];
  benefits: string[];
  weeklyStructure: WeekStructure[];
  
  // Matching criteria for Smart Match
  matchingCriteria: {
    minEquipmentMatch: number; // 0-1 percentage
    intensityLevel: 'low' | 'moderate' | 'high';
    timePerSession: { min: number; max: number };
    daysPerWeek: { min: number; max: number };
    suitableGoals: string[];
    suitableConsiderations: string[];
  };
}

// ============================================
// PROGRAM DEFINITIONS
// ============================================

export const exercisePrograms: ExerciseProgram[] = [
  // ----------------------------------------
  // FOUNDATION STRENGTH
  // ----------------------------------------
  {
    key: 'foundation-strength',
    name: 'Foundation Strength',
    description: 'Build a strong base with fundamental movement patterns',
    detailedDescription: 'A beginner-friendly program focusing on the essential movement patterns: squat, hinge, push, pull, and carry. Perfect for those new to strength training or returning after a break. Emphasises proper form and progressive overload.',
    durationWeeks: 4,
    sessionsPerWeek: 3,
    difficultyLevel: 'beginner',
    equipmentRequired: ['dumbbells'],
    equipmentOptional: ['resistance-band', 'bench'],
    suitableFor: ['beginner', 'returning-to-exercise', 'over-40', 'menopause'],
    focusAreas: ['full-body-strength', 'movement-quality', 'muscle-building'],
    benefits: [
      'Learn fundamental movement patterns safely',
      'Build baseline strength for daily activities',
      'Improve posture and body awareness',
      'Prepare for more advanced programs'
    ],
    matchingCriteria: {
      minEquipmentMatch: 0.5,
      intensityLevel: 'moderate',
      timePerSession: { min: 30, max: 45 },
      daysPerWeek: { min: 2, max: 4 },
      suitableGoals: ['build-strength', 'improve-fitness', 'maintain-independence'],
      suitableConsiderations: ['beginner', 'joint-concerns', 'time-limited']
    },
    weeklyStructure: [
      {
        weekNumber: 1,
        theme: 'Movement Foundations',
        days: [
          {
            dayNumber: 1,
            name: 'Day 1: Lower Body Focus',
            focus: 'Squat & Hinge Patterns',
            estimatedDuration: 35,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '10', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 2, reps: '8', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '10-12', rest: '90s', rpe: 7, notes: 'Focus on depth and control' },
                  { exerciseKey: 'romanian-deadlift', sets: 3, reps: '10-12', rest: '90s', rpe: 7 },
                  { exerciseKey: 'reverse-lunge', sets: 3, reps: '8 each leg', rest: '60s', rpe: 6 },
                  { exerciseKey: 'glute-bridge', sets: 3, reps: '12-15', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Day 2: Upper Body Focus',
            focus: 'Push & Pull Patterns',
            estimatedDuration: 35,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'incline-push-up', sets: 2, reps: '8', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'push-up', sets: 3, reps: '8-12', rest: '90s', rpe: 7, notes: 'Use incline if needed' },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '10-12 each arm', rest: '60s', rpe: 7 },
                  { exerciseKey: 'dumbbell-shoulder-press', sets: 3, reps: '10-12', rest: '90s', rpe: 7 },
                  { exerciseKey: 'band-pull-apart', sets: 3, reps: '15', rest: '45s', rpe: 6 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '8 each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Day 3: Full Body & Core',
            focus: 'Movement Integration',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '6 each side', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 1, reps: '10', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '10', rest: '60s', rpe: 7 },
                  { exerciseKey: 'push-up', sets: 3, reps: '8-10', rest: '60s', rpe: 7 },
                  { exerciseKey: 'kettlebell-deadlift', sets: 3, reps: '10', rest: '60s', rpe: 7 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '10 each arm', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Core Circuit',
                type: 'circuit',
                rounds: 2,
                restBetweenRounds: '60s',
                exercises: [
                  { exerciseKey: 'dead-bug', sets: 1, reps: '8 each side', rest: '15s' },
                  { exerciseKey: 'bird-dog', sets: 1, reps: '8 each side', rest: '15s' },
                  { exerciseKey: 'side-plank', sets: 1, reps: '20s each side', rest: '15s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '45s each side', rest: '0s' }
                ]
              }
            ]
          }
        ],
        progressionNotes: 'Focus on form this week. If exercises feel easy at RPE 7, note it for next week.'
      },
      {
        weekNumber: 2,
        theme: 'Building Confidence',
        days: [
          {
            dayNumber: 1,
            name: 'Day 1: Lower Body Focus',
            focus: 'Squat & Hinge Patterns',
            estimatedDuration: 35,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 2, reps: '10', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '12', rest: '90s', rpe: 7, notes: 'Increase weight slightly if Week 1 was easy' },
                  { exerciseKey: 'romanian-deadlift', sets: 3, reps: '12', rest: '90s', rpe: 7 },
                  { exerciseKey: 'split-squat', sets: 3, reps: '10 each leg', rest: '60s', rpe: 7 },
                  { exerciseKey: 'glute-bridge', sets: 3, reps: '15', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Day 2: Upper Body Focus',
            focus: 'Push & Pull Patterns',
            estimatedDuration: 35,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '15', rest: '30s' },
                  { exerciseKey: 'incline-push-up', sets: 2, reps: '10', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'push-up', sets: 3, reps: '10-12', rest: '90s', rpe: 7 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '12 each arm', rest: '60s', rpe: 7 },
                  { exerciseKey: 'dumbbell-shoulder-press', sets: 3, reps: '12', rest: '90s', rpe: 7 },
                  { exerciseKey: 'band-pull-apart', sets: 3, reps: '15', rest: '45s', rpe: 7 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '10 each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Day 3: Full Body & Core',
            focus: 'Movement Integration',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '8 each side', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 1, reps: '12', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '12', rest: '60s', rpe: 7 },
                  { exerciseKey: 'push-up', sets: 3, reps: '10-12', rest: '60s', rpe: 7 },
                  { exerciseKey: 'kettlebell-deadlift', sets: 3, reps: '12', rest: '60s', rpe: 7 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '12 each arm', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Core Circuit',
                type: 'circuit',
                rounds: 3,
                restBetweenRounds: '60s',
                exercises: [
                  { exerciseKey: 'dead-bug', sets: 1, reps: '10 each side', rest: '15s' },
                  { exerciseKey: 'bird-dog', sets: 1, reps: '10 each side', rest: '15s' },
                  { exerciseKey: 'side-plank', sets: 1, reps: '25s each side', rest: '15s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' }
                ]
              }
            ]
          }
        ],
        progressionNotes: 'Slightly increase reps or weight from Week 1. Add one round to core circuit.'
      },
      {
        weekNumber: 3,
        theme: 'Progressive Challenge',
        days: [
          {
            dayNumber: 1,
            name: 'Day 1: Lower Body Focus',
            focus: 'Squat & Hinge Patterns',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'goblet-squat', sets: 1, reps: '8', rest: '30s', notes: 'Light weight warm-up' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 4, reps: '10-12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'romanian-deadlift', sets: 4, reps: '10-12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'split-squat', sets: 3, reps: '10 each leg', rest: '60s', rpe: 7 },
                  { exerciseKey: 'glute-bridge', sets: 3, reps: '15', rest: '60s', rpe: 8, notes: 'Add weight on hips if available' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Day 2: Upper Body Focus',
            focus: 'Push & Pull Patterns',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '15', rest: '30s' },
                  { exerciseKey: 'push-up', sets: 1, reps: '6', rest: '30s', notes: 'Warm-up set' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'push-up', sets: 4, reps: '10-12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'dumbbell-row', sets: 4, reps: '10-12 each arm', rest: '60s', rpe: 8 },
                  { exerciseKey: 'dumbbell-shoulder-press', sets: 4, reps: '10-12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'band-pull-apart', sets: 3, reps: '15', rest: '45s', rpe: 7 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '10 each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Day 3: Full Body & Core',
            focus: 'Movement Integration',
            estimatedDuration: 45,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '8 each side', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 1, reps: '12', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '12', rest: '60s', rpe: 8 },
                  { exerciseKey: 'push-up', sets: 3, reps: '12', rest: '60s', rpe: 8 },
                  { exerciseKey: 'romanian-deadlift', sets: 3, reps: '12', rest: '60s', rpe: 8 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '12 each arm', rest: '60s', rpe: 8 },
                  { exerciseKey: 'reverse-lunge', sets: 3, reps: '10 each leg', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Core Circuit',
                type: 'circuit',
                rounds: 3,
                restBetweenRounds: '45s',
                exercises: [
                  { exerciseKey: 'dead-bug', sets: 1, reps: '12 each side', rest: '10s' },
                  { exerciseKey: 'plank', sets: 1, reps: '30s', rest: '10s' },
                  { exerciseKey: 'side-plank', sets: 1, reps: '25s each side', rest: '10s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' }
                ]
              }
            ]
          }
        ],
        progressionNotes: 'Add 4th set to main exercises. Increase weight if RPE 8 feels comfortable.'
      },
      {
        weekNumber: 4,
        theme: 'Consolidation',
        days: [
          {
            dayNumber: 1,
            name: 'Day 1: Lower Body Focus',
            focus: 'Squat & Hinge Patterns',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'goblet-squat', sets: 1, reps: '8', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 4, reps: '10-12', rest: '90s', rpe: 8, notes: 'Best weight of the program' },
                  { exerciseKey: 'romanian-deadlift', sets: 4, reps: '10-12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'split-squat', sets: 3, reps: '12 each leg', rest: '60s', rpe: 8 },
                  { exerciseKey: 'glute-bridge', sets: 3, reps: '15', rest: '60s', rpe: 8 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Day 2: Upper Body Focus',
            focus: 'Push & Pull Patterns',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '15', rest: '30s' },
                  { exerciseKey: 'push-up', sets: 1, reps: '6', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'push-up', sets: 4, reps: '12-15', rest: '90s', rpe: 8 },
                  { exerciseKey: 'dumbbell-row', sets: 4, reps: '12 each arm', rest: '60s', rpe: 8 },
                  { exerciseKey: 'dumbbell-shoulder-press', sets: 4, reps: '12', rest: '90s', rpe: 8 },
                  { exerciseKey: 'band-pull-apart', sets: 3, reps: '20', rest: '45s', rpe: 7 }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '10 each side', rest: '0s' },
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Day 3: Full Body & Core',
            focus: 'Movement Integration',
            estimatedDuration: 45,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '8 each side', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 1, reps: '12', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '12', rest: '60s', rpe: 8 },
                  { exerciseKey: 'push-up', sets: 3, reps: '12-15', rest: '60s', rpe: 8 },
                  { exerciseKey: 'romanian-deadlift', sets: 3, reps: '12', rest: '60s', rpe: 8 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '12 each arm', rest: '60s', rpe: 8 },
                  { exerciseKey: 'reverse-lunge', sets: 3, reps: '12 each leg', rest: '60s', rpe: 8 }
                ]
              },
              {
                name: 'Core Circuit',
                type: 'circuit',
                rounds: 3,
                restBetweenRounds: '45s',
                exercises: [
                  { exerciseKey: 'dead-bug', sets: 1, reps: '12 each side', rest: '10s' },
                  { exerciseKey: 'plank', sets: 1, reps: '45s', rest: '10s' },
                  { exerciseKey: 'side-plank', sets: 1, reps: '30s each side', rest: '10s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' }
                ]
              }
            ],
            notes: 'Final week - celebrate your progress! Compare how you feel now vs Week 1.'
          }
        ],
        progressionNotes: 'Maintain intensity from Week 3. Focus on quality execution. Celebrate progress!'
      }
    ]
  },

  // ----------------------------------------
  // BONE BUILDER
  // ----------------------------------------
  {
    key: 'bone-builder',
    name: 'Bone Builder',
    description: 'Evidence-based program for bone density support',
    detailedDescription: 'Designed specifically for bone health using research-backed loading patterns. Combines resistance training with appropriate impact exercises to stimulate bone remodelling. Safe progressions with attention to form.',
    durationWeeks: 8,
    sessionsPerWeek: 3,
    difficultyLevel: 'intermediate',
    equipmentRequired: ['dumbbells'],
    equipmentOptional: ['barbell', 'resistance-band'],
    suitableFor: ['bone-health', 'menopause', 'postmenopause', 'osteopenia-prevention'],
    focusAreas: ['bone-density', 'strength', 'balance', 'posture'],
    benefits: [
      'Stimulate bone remodelling through progressive loading',
      'Improve balance to reduce fall risk',
      'Build strength in key areas for bone support',
      'Evidence-based approach from osteoporosis research'
    ],
    matchingCriteria: {
      minEquipmentMatch: 0.6,
      intensityLevel: 'moderate',
      timePerSession: { min: 35, max: 50 },
      daysPerWeek: { min: 2, max: 4 },
      suitableGoals: ['bone-health', 'prevent-osteoporosis', 'maintain-strength'],
      suitableConsiderations: ['menopause', 'postmenopause', 'family-history-osteoporosis']
    },
    weeklyStructure: [
      {
        weekNumber: 1,
        theme: 'Foundation for Bones',
        days: [
          {
            dayNumber: 1,
            name: 'Day 1: Lower Body Strength',
            focus: 'Hip & Spine Loading',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 2, reps: '10', rest: '30s' }
                ]
              },
              {
                name: 'Main Workout - Strength',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 4, reps: '8-10', rest: '120s', rpe: 8, notes: 'Heavy enough to challenge' },
                  { exerciseKey: 'romanian-deadlift', sets: 4, reps: '8-10', rest: '120s', rpe: 8, notes: 'Focus on hip loading' },
                  { exerciseKey: 'split-squat', sets: 3, reps: '8 each leg', rest: '90s', rpe: 7 },
                  { exerciseKey: 'reverse-lunge', sets: 3, reps: '8 each leg', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Balance Challenge',
                type: 'main',
                exercises: [
                  { exerciseKey: 'split-squat', sets: 2, reps: '30s hold each side', rest: '30s', notes: 'Static hold at bottom position' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '60s each side', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Day 2: Upper Body & Spine',
            focus: 'Spine & Wrist Loading',
            estimatedDuration: 40,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '15', rest: '30s' },
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '8 each side', rest: '0s' }
                ]
              },
              {
                name: 'Main Workout',
                type: 'main',
                exercises: [
                  { exerciseKey: 'push-up', sets: 4, reps: '8-12', rest: '90s', rpe: 8, notes: 'Wrist loading for bone health' },
                  { exerciseKey: 'dumbbell-row', sets: 4, reps: '8-10 each arm', rest: '60s', rpe: 8 },
                  { exerciseKey: 'dumbbell-shoulder-press', sets: 4, reps: '8-10', rest: '90s', rpe: 8 },
                  { exerciseKey: 'plank', sets: 3, reps: '30s', rest: '45s', notes: 'Wrist bone loading' }
                ]
              },
              {
                name: 'Posture Work',
                type: 'main',
                exercises: [
                  { exerciseKey: 'band-pull-apart', sets: 3, reps: '15', rest: '30s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '8 each side', rest: '30s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'thoracic-rotation', sets: 1, reps: '8 each side', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Day 3: Full Body Power',
            focus: 'Impact & Strength Combo',
            estimatedDuration: 45,
            blocks: [
              {
                name: 'Warm-Up',
                type: 'warmup',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '10', rest: '30s' },
                  { exerciseKey: 'step-jacks', sets: 1, reps: '30s', rest: '30s' }
                ]
              },
              {
                name: 'Impact Circuit',
                type: 'circuit',
                rounds: 3,
                restBetweenRounds: '90s',
                exercises: [
                  { exerciseKey: 'step-jacks', sets: 1, reps: '20', rest: '30s', notes: 'Low impact option' },
                  { exerciseKey: 'bodyweight-squat', sets: 1, reps: '15', rest: '30s' }
                ]
              },
              {
                name: 'Strength Work',
                type: 'main',
                exercises: [
                  { exerciseKey: 'goblet-squat', sets: 3, reps: '10', rest: '90s', rpe: 7 },
                  { exerciseKey: 'push-up', sets: 3, reps: '10', rest: '60s', rpe: 7 },
                  { exerciseKey: 'kettlebell-deadlift', sets: 3, reps: '10', rest: '90s', rpe: 7 },
                  { exerciseKey: 'dumbbell-row', sets: 3, reps: '10 each', rest: '60s', rpe: 7 }
                ]
              },
              {
                name: 'Core & Balance',
                type: 'main',
                exercises: [
                  { exerciseKey: 'dead-bug', sets: 2, reps: '10 each side', rest: '30s' },
                  { exerciseKey: 'side-plank', sets: 2, reps: '20s each side', rest: '30s' }
                ]
              },
              {
                name: 'Cool-Down',
                type: 'cooldown',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 1, reps: '45s each side', rest: '0s' }
                ]
              }
            ]
          }
        ],
        progressionNotes: 'Week 1 establishes baseline. Focus on heavier weights than typical - bone responds to challenge.'
      }
      // Weeks 2-8 would follow similar progressive structure
    ]
  },

  // ----------------------------------------
  // MOBILITY MASTERY
  // ----------------------------------------
  {
    key: 'mobility-mastery',
    name: 'Mobility Mastery',
    description: 'Restore movement quality and flexibility',
    detailedDescription: 'A gentle but effective program focused on restoring and maintaining joint mobility, flexibility, and movement quality. Perfect as a standalone program or complement to strength training.',
    durationWeeks: 4,
    sessionsPerWeek: 4,
    difficultyLevel: 'beginner',
    equipmentRequired: [],
    equipmentOptional: ['yoga-mat', 'foam-roller', 'resistance-band'],
    suitableFor: ['beginner', 'recovery', 'desk-worker', 'stiffness', 'flexibility'],
    focusAreas: ['mobility', 'flexibility', 'joint-health', 'recovery'],
    benefits: [
      'Reduce stiffness and improve range of motion',
      'Support joint health and longevity',
      'Complement strength training recovery',
      'Improve posture and body awareness'
    ],
    matchingCriteria: {
      minEquipmentMatch: 0,
      intensityLevel: 'low',
      timePerSession: { min: 15, max: 30 },
      daysPerWeek: { min: 3, max: 7 },
      suitableGoals: ['improve-flexibility', 'reduce-stiffness', 'recover-better'],
      suitableConsiderations: ['desk-worker', 'joint-stiffness', 'recovery-focused']
    },
    weeklyStructure: [
      {
        weekNumber: 1,
        theme: 'Foundation Mobility',
        days: [
          {
            dayNumber: 1,
            name: 'Morning Flow',
            focus: 'Spine & Hips',
            estimatedDuration: 20,
            blocks: [
              {
                name: 'Spinal Mobility',
                type: 'main',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 2, reps: '10 each direction', rest: '0s' },
                  { exerciseKey: 'thoracic-rotation', sets: 2, reps: '8 each side', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '6 each side', rest: '0s' }
                ]
              },
              {
                name: 'Hip Mobility',
                type: 'main',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 2, reps: '45s each side', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '10 with 3s hold', rest: '0s' }
                ]
              }
            ]
          },
          {
            dayNumber: 2,
            name: 'Upper Body Focus',
            focus: 'Shoulders & Thoracic',
            estimatedDuration: 20,
            blocks: [
              {
                name: 'Shoulder Mobility',
                type: 'main',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 1, reps: '8 each direction', rest: '0s' },
                  { exerciseKey: 'thoracic-rotation', sets: 3, reps: '10 each side', rest: '0s' },
                  { exerciseKey: 'band-pull-apart', sets: 2, reps: '15', rest: '30s', notes: 'Focus on squeezing shoulder blades' }
                ]
              }
            ]
          },
          {
            dayNumber: 3,
            name: 'Lower Body Focus',
            focus: 'Hips & Ankles',
            estimatedDuration: 20,
            blocks: [
              {
                name: 'Hip Opening',
                type: 'main',
                exercises: [
                  { exerciseKey: 'hip-90-90', sets: 3, reps: '60s each side', rest: '0s' },
                  { exerciseKey: 'glute-bridge', sets: 2, reps: '12', rest: '30s' },
                  { exerciseKey: 'bodyweight-squat', sets: 2, reps: '10 with 3s pause at bottom', rest: '30s' }
                ]
              }
            ]
          },
          {
            dayNumber: 4,
            name: 'Full Body Integration',
            focus: 'Movement Flow',
            estimatedDuration: 25,
            blocks: [
              {
                name: 'Complete Flow',
                type: 'main',
                exercises: [
                  { exerciseKey: 'cat-cow', sets: 2, reps: '10 each', rest: '0s' },
                  { exerciseKey: 'bird-dog', sets: 2, reps: '8 each side', rest: '0s' },
                  { exerciseKey: 'thoracic-rotation', sets: 2, reps: '8 each side', rest: '0s' },
                  { exerciseKey: 'hip-90-90', sets: 2, reps: '45s each side', rest: '0s' },
                  { exerciseKey: 'bodyweight-squat', sets: 2, reps: '8', rest: '0s' }
                ]
              }
            ]
          }
        ],
        progressionNotes: 'Focus on breathing and relaxation into positions. Never force range of motion.'
      }
      // Weeks 2-4 would progressively increase hold times and add variations
    ]
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get program by key
 */
export function getProgramByKey(key: string): ExerciseProgram | undefined {
  return exercisePrograms.find(p => p.key === key);
}

/**
 * Get programs suitable for user's equipment
 */
export function getProgramsByEquipment(userEquipment: string[]): ExerciseProgram[] {
  return exercisePrograms.filter(program => {
    if (program.equipmentRequired.length === 0) return true;
    const matchedEquipment = program.equipmentRequired.filter(eq => 
      userEquipment.includes(eq)
    );
    const matchRatio = matchedEquipment.length / program.equipmentRequired.length;
    return matchRatio >= program.matchingCriteria.minEquipmentMatch;
  });
}

/**
 * Get today's workout for a user's active program
 */
export function getTodaysWorkout(
  programKey: string,
  currentWeek: number,
  currentDay: number
): DayWorkout | undefined {
  const program = getProgramByKey(programKey);
  if (!program) return undefined;

  const week = program.weeklyStructure.find(w => w.weekNumber === currentWeek);
  if (!week) return undefined;

  return week.days.find(d => d.dayNumber === currentDay);
}

/**
 * Calculate program match score for Smart Match
 */
export function calculateProgramMatchScore(
  program: ExerciseProgram,
  userPreferences: {
    equipment: string[];
    sessionDuration: number;
    daysPerWeek: number;
    intensity: 'low' | 'moderate' | 'high';
    goals: string[];
    considerations: string[];
  }
): number {
  let score = 0;
  const criteria = program.matchingCriteria;

  // Equipment match (30 points max)
  if (program.equipmentRequired.length === 0) {
    score += 30;
  } else {
    const matchedEquipment = program.equipmentRequired.filter(eq => 
      userPreferences.equipment.includes(eq)
    );
    const matchRatio = matchedEquipment.length / program.equipmentRequired.length;
    score += Math.round(matchRatio * 30);
  }

  // Session duration fit (20 points max)
  if (
    userPreferences.sessionDuration >= criteria.timePerSession.min &&
    userPreferences.sessionDuration <= criteria.timePerSession.max
  ) {
    score += 20;
  } else if (
    userPreferences.sessionDuration >= criteria.timePerSession.min - 10 ||
    userPreferences.sessionDuration <= criteria.timePerSession.max + 10
  ) {
    score += 10;
  }

  // Days per week fit (15 points max)
  if (
    userPreferences.daysPerWeek >= criteria.daysPerWeek.min &&
    userPreferences.daysPerWeek <= criteria.daysPerWeek.max
  ) {
    score += 15;
  } else if (
    userPreferences.daysPerWeek >= criteria.daysPerWeek.min - 1 ||
    userPreferences.daysPerWeek <= criteria.daysPerWeek.max + 1
  ) {
    score += 8;
  }

  // Intensity match (15 points max)
  if (userPreferences.intensity === criteria.intensityLevel) {
    score += 15;
  } else {
    score += 5; // Partial credit for different intensity
  }

  // Goal alignment (10 points max)
  const matchedGoals = userPreferences.goals.filter(g => 
    criteria.suitableGoals.includes(g)
  );
  score += Math.min(10, matchedGoals.length * 5);

  // Considerations match (10 points max)
  const matchedConsiderations = userPreferences.considerations.filter(c => 
    criteria.suitableConsiderations.includes(c)
  );
  score += Math.min(10, matchedConsiderations.length * 5);

  return Math.min(100, score);
}

export default exercisePrograms;
