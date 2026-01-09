/**
 * Evidence-Based Exercise Library
 * 
 * This library contains detailed exercise definitions with:
 * - Movement patterns for intelligent swapping
 * - Evidence citations from recognised experts
 * - Safety considerations for midlife women
 * - Video content sources
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ExpertSource {
  name: string;
  credential: string;
  context?: string;
}

export interface ResearchCitation {
  title: string;
  authors?: string;
  year?: number;
  journal?: string;
  doi?: string;
}

export interface EvidenceInfo {
  level: 'high' | 'moderate' | 'emerging' | 'expert-consensus';
  primaryExpert: ExpertSource;
  supportingExperts?: ExpertSource[];
  citations?: ResearchCitation[];
  summary: string;
}

export interface VideoContent {
  provider: 'youtube' | 'vimeo' | 'custom';
  videoId: string;
  title: string;
  startTime?: number; // seconds
  endTime?: number;
  expertName?: string;
}

export interface ExerciseModification {
  type: 'easier' | 'harder' | 'equipment-free' | 'joint-friendly';
  description: string;
  alternativeExerciseKey?: string;
}

export interface Exercise {
  key: string;
  name: string;
  category: 'lower-body' | 'upper-body' | 'core' | 'cardio' | 'mobility' | 'hiit' | 'balance';
  movementPattern: 'squat' | 'hinge' | 'lunge' | 'push' | 'pull' | 'carry' | 'rotation' | 'anti-rotation' | 'locomotion' | 'static';
  muscleGroups: {
    primary: string[];
    secondary?: string[];
  };
  equipment: string[];
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  estimatedDuration: number; // minutes for typical set scheme
  
  // Instructions
  setupCues: string[];
  executionCues: string[];
  breathingCues: string[];
  commonMistakes: string[];
  
  // Safety & Considerations
  contraindications?: string[];
  pelvicFloorSafe: boolean;
  boneLoadingType: 'high-impact' | 'moderate-impact' | 'low-impact' | 'resistance' | 'none';
  jointStress: 'low' | 'moderate' | 'high';
  
  // Modifications
  modifications: ExerciseModification[];
  
  // Evidence
  evidence: EvidenceInfo;
  
  // Video Content
  videos?: VideoContent[];
  
  // Metadata
  tags: string[];
}

// ============================================
// EXPERT DEFINITIONS
// ============================================

export const EXPERTS = {
  stacySims: {
    name: 'Dr. Stacy Sims',
    credential: 'PhD, Exercise Physiologist',
    context: 'Women-specific training and menopause research'
  },
  peterAttia: {
    name: 'Dr. Peter Attia',
    credential: 'MD, Longevity Medicine',
    context: 'Centenarian Decathlon, functional capacity'
  },
  andrewHuberman: {
    name: 'Dr. Andrew Huberman',
    credential: 'PhD, Neuroscience',
    context: 'Neural adaptation and recovery protocols'
  },
  bradSchoenfeld: {
    name: 'Dr. Brad Schoenfeld',
    credential: 'PhD, Exercise Science',
    context: 'Muscle hypertrophy research'
  },
  stuartMcGill: {
    name: 'Dr. Stuart McGill',
    credential: 'PhD, Spine Biomechanics',
    context: 'Core stability and back health'
  },
  kellyStarrett: {
    name: 'Dr. Kelly Starrett',
    credential: 'DPT, Physical Therapist',
    context: 'Mobility and movement quality'
  },
  laynNorton: {
    name: 'Dr. Layne Norton',
    credential: 'PhD, Nutritional Sciences',
    context: 'Resistance training and protein metabolism'
  }
} as const;

// ============================================
// EXERCISE LIBRARY
// ============================================

export const exerciseLibrary: Exercise[] = [
  // ----------------------------------------
  // LOWER BODY - SQUAT PATTERN
  // ----------------------------------------
  {
    key: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'lower-body',
    movementPattern: 'squat',
    muscleGroups: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['core', 'adductors']
    },
    equipment: ['dumbbell', 'kettlebell'],
    difficultyLevel: 2,
    estimatedDuration: 8,
    setupCues: [
      'Hold weight at chest height, elbows pointing down',
      'Feet shoulder-width apart, toes slightly out',
      'Engage core before descending'
    ],
    executionCues: [
      'Push hips back and down simultaneously',
      'Keep chest proud, weight in heels',
      'Descend until thighs are parallel or below',
      'Drive through heels to stand'
    ],
    breathingCues: [
      'Inhale at the top, brace core',
      'Hold breath during descent',
      'Exhale forcefully on the way up'
    ],
    commonMistakes: [
      'Letting knees cave inward',
      'Rising onto toes',
      'Rounding lower back at bottom'
    ],
    contraindications: ['acute knee injury', 'severe hip arthritis'],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Bodyweight squat to box/chair',
        alternativeExerciseKey: 'box-squat'
      },
      {
        type: 'harder',
        description: 'Add pause at bottom (2-3 seconds)',
      },
      {
        type: 'joint-friendly',
        description: 'Reduce depth to above parallel'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      supportingExperts: [EXPERTS.bradSchoenfeld],
      summary: 'Foundational movement for lower body strength. Dr. Sims emphasises goblet position helps maintain upright torso, reducing spinal load while maximising quadriceps and glute engagement.'
    },
    videos: [
      {
        provider: 'youtube',
        videoId: 'MeIiIdhvXT4',
        title: 'Goblet Squat Tutorial',
        expertName: 'Dr. John Rusin'
      }
    ],
    tags: ['foundational', 'quad-dominant', 'beginner-friendly', 'home-workout']
  },
  
  {
    key: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    category: 'lower-body',
    movementPattern: 'squat',
    muscleGroups: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['core', 'adductors']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 5,
    setupCues: [
      'Feet shoulder-width apart, toes slightly out',
      'Arms extended in front for balance',
      'Engage core before descending'
    ],
    executionCues: [
      'Push hips back and down',
      'Keep weight in heels and midfoot',
      'Descend as low as mobility allows',
      'Drive through heels to stand'
    ],
    breathingCues: [
      'Inhale on the way down',
      'Exhale on the way up'
    ],
    commonMistakes: [
      'Knees caving inward',
      'Heels lifting off ground',
      'Excessive forward lean'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'moderate-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Hold onto chair or wall for support'
      },
      {
        type: 'harder',
        description: 'Add pulse at bottom or jump at top'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.peterAttia,
      summary: 'Essential movement pattern for longevity. Dr. Attia includes squat capacity in his Centenarian Decathlon as fundamental to maintaining independence.'
    },
    tags: ['foundational', 'no-equipment', 'beginner', 'mobility']
  },

  {
    key: 'box-squat',
    name: 'Box Squat',
    category: 'lower-body',
    movementPattern: 'squat',
    muscleGroups: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['hamstrings', 'core']
    },
    equipment: ['box', 'bench'],
    difficultyLevel: 1,
    estimatedDuration: 6,
    setupCues: [
      'Position box/bench behind you',
      'Feet shoulder-width apart',
      'Arms extended or crossed at chest'
    ],
    executionCues: [
      'Sit back and down to the box',
      'Lightly touch the box, dont rest fully',
      'Drive through heels to stand'
    ],
    breathingCues: [
      'Inhale as you descend',
      'Exhale as you stand'
    ],
    commonMistakes: [
      'Plopping down onto box',
      'Using momentum to stand',
      'Leaning too far forward'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Use higher box/surface'
      },
      {
        type: 'harder',
        description: 'Add weight or lower box height'
      }
    ],
    evidence: {
      level: 'moderate',
      primaryExpert: EXPERTS.kellyStarrett,
      summary: 'Excellent for building confidence and teaching proper depth. Provides a target and safety net for those building squat capacity.'
    },
    tags: ['regression', 'beginner', 'joint-friendly', 'rehabilitation']
  },

  // ----------------------------------------
  // LOWER BODY - HINGE PATTERN
  // ----------------------------------------
  {
    key: 'romanian-deadlift',
    name: 'Romanian Deadlift (RDL)',
    category: 'lower-body',
    movementPattern: 'hinge',
    muscleGroups: {
      primary: ['hamstrings', 'glutes'],
      secondary: ['erector spinae', 'core']
    },
    equipment: ['dumbbells', 'barbell', 'kettlebell'],
    difficultyLevel: 3,
    estimatedDuration: 8,
    setupCues: [
      'Stand with feet hip-width apart',
      'Hold weights in front of thighs',
      'Soft bend in knees, maintain throughout',
      'Shoulders back and down'
    ],
    executionCues: [
      'Push hips back, keeping spine neutral',
      'Lower weights along thighs and shins',
      'Feel stretch in hamstrings',
      'Squeeze glutes to return to standing'
    ],
    breathingCues: [
      'Inhale and brace at top',
      'Hold during descent',
      'Exhale forcefully on the way up'
    ],
    commonMistakes: [
      'Rounding the lower back',
      'Bending knees too much (turning into squat)',
      'Not hinging from hips',
      'Looking up excessively'
    ],
    contraindications: ['acute lower back injury', 'disc herniation'],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Single dumbbell held with both hands'
      },
      {
        type: 'harder',
        description: 'Single-leg RDL'
      },
      {
        type: 'joint-friendly',
        description: 'Reduce range of motion'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      supportingExperts: [EXPERTS.bradSchoenfeld],
      summary: 'Critical for posterior chain development. Dr. Sims emphasises this movement for preventing age-related muscle loss in glutes and hamstrings, which affects posture and hip stability.'
    },
    videos: [
      {
        provider: 'youtube',
        videoId: 'jEy_czb3RKA',
        title: 'RDL Form Guide',
        expertName: 'Jeff Nippard'
      }
    ],
    tags: ['posterior-chain', 'hip-hinge', 'strength', 'bone-building']
  },

  {
    key: 'kettlebell-deadlift',
    name: 'Kettlebell Deadlift',
    category: 'lower-body',
    movementPattern: 'hinge',
    muscleGroups: {
      primary: ['glutes', 'hamstrings'],
      secondary: ['quadriceps', 'core', 'grip']
    },
    equipment: ['kettlebell'],
    difficultyLevel: 2,
    estimatedDuration: 6,
    setupCues: [
      'Kettlebell between feet, handles parallel',
      'Feet hip-width apart',
      'Hinge at hips to grip handle'
    ],
    executionCues: [
      'Brace core, keep chest up',
      'Drive through heels and squeeze glutes',
      'Stand tall at top',
      'Hinge back down with control'
    ],
    breathingCues: [
      'Inhale and brace before lift',
      'Exhale at the top',
      'Inhale before lowering'
    ],
    commonMistakes: [
      'Rounding back',
      'Squatting instead of hinging',
      'Letting shoulders round forward'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Elevate kettlebell on block to reduce range'
      },
      {
        type: 'harder',
        description: 'Single-leg or deficit deadlift'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stuartMcGill,
      summary: 'Teaches proper hip hinge mechanics with minimal spinal load. Central kettlebell position makes it easier to maintain neutral spine than barbell variations.'
    },
    tags: ['hinge', 'beginner-friendly', 'home-workout', 'functional']
  },

  {
    key: 'glute-bridge',
    name: 'Glute Bridge',
    category: 'lower-body',
    movementPattern: 'hinge',
    muscleGroups: {
      primary: ['glutes'],
      secondary: ['hamstrings', 'core']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 5,
    setupCues: [
      'Lie on back, knees bent, feet flat',
      'Feet hip-width apart, close to glutes',
      'Arms at sides, palms down'
    ],
    executionCues: [
      'Drive through heels to lift hips',
      'Squeeze glutes at top',
      'Create straight line from shoulders to knees',
      'Lower with control'
    ],
    breathingCues: [
      'Exhale as you lift',
      'Inhale as you lower'
    ],
    commonMistakes: [
      'Overarching lower back',
      'Pushing through toes instead of heels',
      'Not fully engaging glutes at top'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Reduce range of motion'
      },
      {
        type: 'harder',
        description: 'Single-leg bridge or add weight on hips'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      summary: 'Essential glute activation exercise. Dr. Sims recommends as part of every warm-up and as a standalone exercise for women experiencing glute amnesia.'
    },
    tags: ['glute-activation', 'beginner', 'no-equipment', 'pelvic-floor-safe']
  },

  // ----------------------------------------
  // LOWER BODY - LUNGE PATTERN
  // ----------------------------------------
  {
    key: 'reverse-lunge',
    name: 'Reverse Lunge',
    category: 'lower-body',
    movementPattern: 'lunge',
    muscleGroups: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['hamstrings', 'core']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 8,
    setupCues: [
      'Stand tall, feet hip-width apart',
      'Hands on hips or weights at sides',
      'Engage core before stepping'
    ],
    executionCues: [
      'Step back with one leg',
      'Lower until both knees at 90 degrees',
      'Keep front knee over ankle',
      'Drive through front heel to return'
    ],
    breathingCues: [
      'Inhale as you step back',
      'Exhale as you push back to start'
    ],
    commonMistakes: [
      'Leaning torso forward',
      'Front knee pushing past toes excessively',
      'Not stepping back far enough'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'moderate-impact',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Hold wall or chair for balance'
      },
      {
        type: 'harder',
        description: 'Add dumbbells or deficit'
      },
      {
        type: 'joint-friendly',
        description: 'Reduce range of motion'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.peterAttia,
      summary: 'Unilateral leg strength is critical for balance and fall prevention. Dr. Attia includes lunge variations in Centenarian Decathlon preparation.'
    },
    tags: ['unilateral', 'balance', 'functional', 'beginner-friendly']
  },

  {
    key: 'split-squat',
    name: 'Split Squat',
    category: 'lower-body',
    movementPattern: 'lunge',
    muscleGroups: {
      primary: ['quadriceps', 'glutes'],
      secondary: ['hamstrings', 'core']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 8,
    setupCues: [
      'Start in staggered stance',
      'Front foot flat, back heel raised',
      'Torso upright, core engaged'
    ],
    executionCues: [
      'Lower straight down',
      'Back knee towards floor',
      'Front knee tracks over toes',
      'Push through front foot to rise'
    ],
    breathingCues: [
      'Inhale as you lower',
      'Exhale as you push up'
    ],
    commonMistakes: [
      'Stance too narrow',
      'Leaning forward excessively',
      'Rising onto front toes'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'moderate-impact',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Use wall for balance support'
      },
      {
        type: 'harder',
        description: 'Add weight or elevate rear foot (Bulgarian split squat)'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.bradSchoenfeld,
      summary: 'Excellent for addressing leg strength imbalances. Research shows similar quadriceps activation to back squat with less spinal load.'
    },
    tags: ['unilateral', 'quad-dominant', 'balance', 'strength']
  },

  // ----------------------------------------
  // UPPER BODY - PUSH PATTERN
  // ----------------------------------------
  {
    key: 'push-up',
    name: 'Push-Up',
    category: 'upper-body',
    movementPattern: 'push',
    muscleGroups: {
      primary: ['chest', 'triceps', 'anterior deltoids'],
      secondary: ['core', 'serratus anterior']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 5,
    setupCues: [
      'Hands slightly wider than shoulders',
      'Body in straight line from head to heels',
      'Core and glutes engaged'
    ],
    executionCues: [
      'Lower chest towards floor',
      'Elbows at 45-degree angle',
      'Touch chest to floor or hover',
      'Push back up to full arm extension'
    ],
    breathingCues: [
      'Inhale on the way down',
      'Exhale as you push up'
    ],
    commonMistakes: [
      'Sagging hips',
      'Flaring elbows to 90 degrees',
      'Not going through full range',
      'Head dropping forward'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Incline push-up on bench or wall',
        alternativeExerciseKey: 'incline-push-up'
      },
      {
        type: 'harder',
        description: 'Decline push-up or add deficit'
      },
      {
        type: 'joint-friendly',
        description: 'Narrow grip or push-up handles'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      supportingExperts: [EXPERTS.peterAttia],
      summary: 'Fundamental upper body pushing pattern. Dr. Sims emphasises importance for women to maintain pushing strength for bone density and functional independence.'
    },
    tags: ['foundational', 'no-equipment', 'upper-body', 'bone-building']
  },

  {
    key: 'incline-push-up',
    name: 'Incline Push-Up',
    category: 'upper-body',
    movementPattern: 'push',
    muscleGroups: {
      primary: ['chest', 'triceps'],
      secondary: ['core', 'anterior deltoids']
    },
    equipment: ['bench', 'box', 'wall'],
    difficultyLevel: 1,
    estimatedDuration: 5,
    setupCues: [
      'Hands on elevated surface',
      'Body in straight line',
      'Core engaged'
    ],
    executionCues: [
      'Lower chest towards surface',
      'Keep elbows at 45 degrees',
      'Push back to start'
    ],
    breathingCues: [
      'Inhale down, exhale up'
    ],
    commonMistakes: [
      'Hips sagging',
      'Not using full range'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Use higher surface (wall)'
      },
      {
        type: 'harder',
        description: 'Use lower surface, progress to floor'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.bradSchoenfeld,
      summary: 'Perfect progression for building towards full push-ups. Allows proper form development with reduced load.'
    },
    tags: ['regression', 'beginner', 'progression', 'upper-body']
  },

  {
    key: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'upper-body',
    movementPattern: 'push',
    muscleGroups: {
      primary: ['anterior deltoids', 'lateral deltoids', 'triceps'],
      secondary: ['core', 'upper trapezius']
    },
    equipment: ['dumbbells'],
    difficultyLevel: 2,
    estimatedDuration: 6,
    setupCues: [
      'Dumbbells at shoulder height',
      'Palms facing forward or neutral',
      'Core braced, spine neutral'
    ],
    executionCues: [
      'Press weights overhead',
      'Fully extend arms at top',
      'Lower with control to shoulders'
    ],
    breathingCues: [
      'Exhale as you press',
      'Inhale as you lower'
    ],
    commonMistakes: [
      'Arching lower back',
      'Pressing weights forward instead of up',
      'Using momentum'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Seated with back support'
      },
      {
        type: 'harder',
        description: 'Single-arm press for core challenge'
      },
      {
        type: 'joint-friendly',
        description: 'Use neutral grip (palms facing each other)'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      summary: 'Essential overhead pushing strength for daily function. Dr. Sims notes overhead strength declines rapidly without training, affecting ability to reach high shelves, lift objects overhead.'
    },
    tags: ['shoulder', 'overhead', 'strength', 'functional']
  },

  // ----------------------------------------
  // UPPER BODY - PULL PATTERN
  // ----------------------------------------
  {
    key: 'dumbbell-row',
    name: 'Dumbbell Row',
    category: 'upper-body',
    movementPattern: 'pull',
    muscleGroups: {
      primary: ['latissimus dorsi', 'rhomboids', 'biceps'],
      secondary: ['rear deltoids', 'core', 'grip']
    },
    equipment: ['dumbbell', 'bench'],
    difficultyLevel: 2,
    estimatedDuration: 8,
    setupCues: [
      'One hand and knee on bench',
      'Back flat, parallel to floor',
      'Weight hanging below shoulder'
    ],
    executionCues: [
      'Pull weight towards hip',
      'Lead with elbow, not hand',
      'Squeeze shoulder blade at top',
      'Lower with control'
    ],
    breathingCues: [
      'Exhale as you row up',
      'Inhale as you lower'
    ],
    commonMistakes: [
      'Rotating torso excessively',
      'Shrugging shoulder up',
      'Using momentum to swing weight'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'resistance',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Lighter weight, focus on form'
      },
      {
        type: 'harder',
        description: 'Pause at top for 2 seconds'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stacySims,
      supportingExperts: [EXPERTS.bradSchoenfeld],
      summary: 'Critical for posture and shoulder health. Dr. Sims emphasises rows for counteracting forward shoulder posture common in desk workers and age-related kyphosis.'
    },
    tags: ['back', 'posture', 'unilateral', 'strength']
  },

  {
    key: 'band-pull-apart',
    name: 'Band Pull-Apart',
    category: 'upper-body',
    movementPattern: 'pull',
    muscleGroups: {
      primary: ['rear deltoids', 'rhomboids'],
      secondary: ['middle trapezius', 'rotator cuff']
    },
    equipment: ['resistance-band'],
    difficultyLevel: 1,
    estimatedDuration: 3,
    setupCues: [
      'Hold band with arms extended in front',
      'Hands shoulder-width apart',
      'Stand tall, core engaged'
    ],
    executionCues: [
      'Pull band apart by squeezing shoulder blades',
      'Bring band to chest level',
      'Keep arms straight throughout',
      'Return slowly to start'
    ],
    breathingCues: [
      'Exhale as you pull apart',
      'Inhale as you return'
    ],
    commonMistakes: [
      'Bending elbows',
      'Shrugging shoulders',
      'Using momentum'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Use lighter band or wider grip'
      },
      {
        type: 'harder',
        description: 'Use heavier band or pause at full contraction'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.kellyStarrett,
      summary: 'Essential for shoulder health and posture. Counteracts forward shoulder posture and activates often-neglected posterior shoulder muscles.'
    },
    tags: ['shoulder-health', 'posture', 'warm-up', 'rehabilitation']
  },

  // ----------------------------------------
  // CORE
  // ----------------------------------------
  {
    key: 'dead-bug',
    name: 'Dead Bug',
    category: 'core',
    movementPattern: 'anti-rotation',
    muscleGroups: {
      primary: ['transverse abdominis', 'rectus abdominis'],
      secondary: ['hip flexors', 'obliques']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 5,
    setupCues: [
      'Lie on back, arms pointing to ceiling',
      'Knees bent 90 degrees over hips',
      'Press lower back into floor'
    ],
    executionCues: [
      'Extend opposite arm and leg',
      'Keep lower back pressed to floor',
      'Return to start with control',
      'Alternate sides'
    ],
    breathingCues: [
      'Exhale as you extend',
      'Inhale as you return'
    ],
    commonMistakes: [
      'Lower back arching off floor',
      'Moving too quickly',
      'Holding breath'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'none',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Move only legs, keep arms static'
      },
      {
        type: 'harder',
        description: 'Hold light weights or add band resistance'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stuartMcGill,
      summary: 'Dr. McGill includes dead bug in his Big 3 for core stability. Teaches core to resist extension and rotation while moving limbs - critical for spine protection.'
    },
    tags: ['core', 'stability', 'beginner', 'mcgill-big-3', 'pelvic-floor-safe']
  },

  {
    key: 'bird-dog',
    name: 'Bird Dog',
    category: 'core',
    movementPattern: 'anti-rotation',
    muscleGroups: {
      primary: ['erector spinae', 'glutes', 'core'],
      secondary: ['shoulders', 'hip stabilisers']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 5,
    setupCues: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Spine neutral, core braced'
    ],
    executionCues: [
      'Extend opposite arm and leg',
      'Keep hips level - dont rotate',
      'Hold for 2-3 seconds',
      'Return with control and alternate'
    ],
    breathingCues: [
      'Exhale as you extend',
      'Breathe steadily while holding'
    ],
    commonMistakes: [
      'Rotating hips as leg extends',
      'Arching lower back',
      'Rushing the movement'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Extend only arm or only leg'
      },
      {
        type: 'harder',
        description: 'Add light ankle/wrist weights or hold longer'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stuartMcGill,
      summary: 'Part of Dr. McGills Big 3. Excellent for training core to stabilise spine during movement while strengthening back extensors and glutes.'
    },
    tags: ['core', 'stability', 'beginner', 'mcgill-big-3', 'back-health']
  },

  {
    key: 'plank',
    name: 'Plank',
    category: 'core',
    movementPattern: 'static',
    muscleGroups: {
      primary: ['transverse abdominis', 'rectus abdominis'],
      secondary: ['shoulders', 'glutes', 'quadriceps']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 3,
    setupCues: [
      'Forearms on ground, elbows under shoulders',
      'Body in straight line from head to heels',
      'Core braced, glutes squeezed'
    ],
    executionCues: [
      'Hold position with perfect form',
      'Dont let hips sag or pike up',
      'Think about pulling elbows to toes',
      'Maintain steady breathing'
    ],
    breathingCues: [
      'Breathe steadily throughout',
      'Short exhales to maintain brace'
    ],
    commonMistakes: [
      'Hips sagging',
      'Hips too high',
      'Holding breath',
      'Looking up (straining neck)'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Plank from knees',
        alternativeExerciseKey: 'kneeling-plank'
      },
      {
        type: 'harder',
        description: 'Add shoulder taps or arm/leg lifts'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stuartMcGill,
      summary: 'Core endurance exercise. Dr. McGill recommends multiple shorter holds (10-15 seconds) rather than single long holds for optimal spine stability training.'
    },
    tags: ['core', 'stability', 'isometric', 'foundational']
  },

  {
    key: 'side-plank',
    name: 'Side Plank',
    category: 'core',
    movementPattern: 'anti-rotation',
    muscleGroups: {
      primary: ['obliques', 'quadratus lumborum'],
      secondary: ['glutes', 'shoulders']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 4,
    setupCues: [
      'Lie on side, elbow under shoulder',
      'Stack feet or stagger for stability',
      'Body in straight line'
    ],
    executionCues: [
      'Lift hips off ground',
      'Create straight line from head to feet',
      'Hold with hips level',
      'Dont let top hip drop back'
    ],
    breathingCues: [
      'Breathe steadily throughout'
    ],
    commonMistakes: [
      'Hips dropping',
      'Rotating forward or backward',
      'Shoulder shrugging up'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Side plank from knees'
      },
      {
        type: 'harder',
        description: 'Add hip dips or top leg raise'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.stuartMcGill,
      summary: 'Part of Dr. McGills Big 3. Critical for lateral core stability and spine health, particularly for preventing and managing back pain.'
    },
    tags: ['core', 'stability', 'mcgill-big-3', 'obliques']
  },

  // ----------------------------------------
  // CARDIO & HIIT
  // ----------------------------------------
  {
    key: 'zone-2-walk',
    name: 'Zone 2 Walk',
    category: 'cardio',
    movementPattern: 'locomotion',
    muscleGroups: {
      primary: ['cardiovascular system'],
      secondary: ['quadriceps', 'hamstrings', 'calves']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 30,
    setupCues: [
      'Wear supportive footwear',
      'Choose flat or gentle terrain',
      'Set comfortable pace'
    ],
    executionCues: [
      'Walk at conversational pace',
      'Should be able to hold conversation',
      'Heart rate 60-70% of max',
      'Maintain good posture'
    ],
    breathingCues: [
      'Nasal breathing if possible',
      'Relaxed, rhythmic breathing'
    ],
    commonMistakes: [
      'Going too fast (out of Zone 2)',
      'Poor posture',
      'Inconsistent pacing'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'moderate-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Shorter duration, slower pace'
      },
      {
        type: 'harder',
        description: 'Add gentle incline or increase duration'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.peterAttia,
      supportingExperts: [EXPERTS.andrewHuberman],
      summary: 'Dr. Attia recommends 3-4 hours of Zone 2 cardio weekly as foundation for metabolic health and longevity. Builds mitochondrial capacity and fat oxidation.'
    },
    tags: ['cardio', 'zone-2', 'recovery', 'metabolic-health', 'beginner']
  },

  {
    key: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'hiit',
    movementPattern: 'locomotion',
    muscleGroups: {
      primary: ['cardiovascular system'],
      secondary: ['shoulders', 'calves', 'quadriceps']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 3,
    setupCues: [
      'Stand with feet together',
      'Arms at sides',
      'Core engaged'
    ],
    executionCues: [
      'Jump feet out wide while raising arms overhead',
      'Jump feet back together, lower arms',
      'Land softly on balls of feet',
      'Maintain rhythm'
    ],
    breathingCues: [
      'Breathe rhythmically with movement'
    ],
    commonMistakes: [
      'Landing with straight legs',
      'Not fully extending arms',
      'Moving too slowly'
    ],
    contraindications: ['pelvic floor dysfunction', 'stress incontinence'],
    pelvicFloorSafe: false,
    boneLoadingType: 'high-impact',
    jointStress: 'moderate',
    modifications: [
      {
        type: 'easier',
        description: 'Step-out jacks (no jumping)',
        alternativeExerciseKey: 'step-jacks'
      },
      {
        type: 'joint-friendly',
        description: 'Low-impact version with step-out'
      }
    ],
    evidence: {
      level: 'moderate',
      primaryExpert: EXPERTS.stacySims,
      summary: 'Effective for elevating heart rate quickly. Dr. Sims notes impact exercises support bone density but recommends low-impact alternatives for those with pelvic floor concerns.'
    },
    tags: ['hiit', 'cardio', 'high-impact', 'warm-up']
  },

  {
    key: 'step-jacks',
    name: 'Step Jacks (Low Impact)',
    category: 'hiit',
    movementPattern: 'locomotion',
    muscleGroups: {
      primary: ['cardiovascular system'],
      secondary: ['shoulders', 'calves']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 3,
    setupCues: [
      'Stand with feet together',
      'Arms at sides'
    ],
    executionCues: [
      'Step one foot out wide while raising arms',
      'Step back to center, lower arms',
      'Alternate sides with rhythm',
      'Keep one foot grounded at all times'
    ],
    breathingCues: [
      'Breathe rhythmically'
    ],
    commonMistakes: [
      'Moving too slowly to elevate heart rate'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'low-impact',
    jointStress: 'low',
    modifications: [
      {
        type: 'harder',
        description: 'Add small hop or increase speed'
      }
    ],
    evidence: {
      level: 'moderate',
      primaryExpert: EXPERTS.stacySims,
      summary: 'Pelvic floor friendly alternative to jumping jacks. Maintains cardiovascular benefit while eliminating impact stress.'
    },
    tags: ['hiit', 'cardio', 'low-impact', 'pelvic-floor-safe']
  },

  // ----------------------------------------
  // MOBILITY
  // ----------------------------------------
  {
    key: 'cat-cow',
    name: 'Cat-Cow Stretch',
    category: 'mobility',
    movementPattern: 'rotation',
    muscleGroups: {
      primary: ['spine extensors', 'spine flexors'],
      secondary: ['core', 'hip flexors']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 3,
    setupCues: [
      'Start on hands and knees',
      'Hands under shoulders, knees under hips',
      'Spine neutral to start'
    ],
    executionCues: [
      'Cow: Drop belly, lift chest and tailbone',
      'Cat: Round spine, tuck tailbone, drop head',
      'Move smoothly between positions',
      'Initiate movement from pelvis'
    ],
    breathingCues: [
      'Inhale into cow (extension)',
      'Exhale into cat (flexion)'
    ],
    commonMistakes: [
      'Moving only from middle back',
      'Rushing the movement',
      'Not breathing with movement'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'none',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Reduce range of motion'
      },
      {
        type: 'joint-friendly',
        description: 'Seated version on chair'
      }
    ],
    evidence: {
      level: 'moderate',
      primaryExpert: EXPERTS.kellyStarrett,
      summary: 'Fundamental spinal mobility drill. Mobilises each vertebral segment and coordinates movement with breath. Essential warm-up for any workout.'
    },
    tags: ['mobility', 'warm-up', 'spine', 'beginner', 'yoga']
  },

  {
    key: 'hip-90-90',
    name: '90/90 Hip Stretch',
    category: 'mobility',
    movementPattern: 'static',
    muscleGroups: {
      primary: ['hip rotators', 'glutes'],
      secondary: ['hip flexors', 'IT band']
    },
    equipment: [],
    difficultyLevel: 2,
    estimatedDuration: 5,
    setupCues: [
      'Sit with front leg bent 90 degrees in front',
      'Back leg bent 90 degrees to side',
      'Sit as upright as possible'
    ],
    executionCues: [
      'Hold position, feel stretch in hips',
      'Gently lean forward over front leg',
      'Keep both sit bones on floor if possible',
      'Switch sides after hold'
    ],
    breathingCues: [
      'Deep, slow breaths',
      'Exhale to deepen stretch'
    ],
    commonMistakes: [
      'Forcing position beyond mobility',
      'Collapsing posture',
      'Holding breath'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'none',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Prop hips up on block or cushion'
      },
      {
        type: 'harder',
        description: 'Add rotation or lean transitions'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.kellyStarrett,
      summary: 'Dr. Starrett identifies hip rotation as critical and often neglected. This position assesses and improves both internal and external hip rotation simultaneously.'
    },
    tags: ['mobility', 'hips', 'flexibility', 'desk-worker']
  },

  {
    key: 'thoracic-rotation',
    name: 'Thoracic Spine Rotation',
    category: 'mobility',
    movementPattern: 'rotation',
    muscleGroups: {
      primary: ['thoracic spine', 'obliques'],
      secondary: ['shoulders', 'lats']
    },
    equipment: [],
    difficultyLevel: 1,
    estimatedDuration: 4,
    setupCues: [
      'Start on hands and knees or side-lying',
      'Keep hips square and stable',
      'One hand behind head'
    ],
    executionCues: [
      'Rotate through mid-back, opening elbow to ceiling',
      'Follow elbow with eyes',
      'Pause at end range',
      'Return with control and repeat'
    ],
    breathingCues: [
      'Exhale as you rotate open',
      'Inhale as you return'
    ],
    commonMistakes: [
      'Rotating from lower back instead of thoracic',
      'Moving hips during rotation',
      'Rushing the movement'
    ],
    pelvicFloorSafe: true,
    boneLoadingType: 'none',
    jointStress: 'low',
    modifications: [
      {
        type: 'easier',
        description: 'Seated rotation against wall'
      },
      {
        type: 'harder',
        description: 'Add resistance band'
      }
    ],
    evidence: {
      level: 'high',
      primaryExpert: EXPERTS.kellyStarrett,
      summary: 'Thoracic mobility is critical for shoulder health, breathing, and posture. Dr. Starrett emphasises daily thoracic mobility work for desk workers and ageing adults.'
    },
    tags: ['mobility', 'thoracic', 'posture', 'desk-worker', 'warm-up']
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get exercise by key
 */
export function getExerciseByKey(key: string): Exercise | undefined {
  return exerciseLibrary.find(ex => ex.key === key);
}

/**
 * Get exercises by category
 */
export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exerciseLibrary.filter(ex => ex.category === category);
}

/**
 * Get exercises by movement pattern
 */
export function getExercisesByMovementPattern(pattern: Exercise['movementPattern']): Exercise[] {
  return exerciseLibrary.filter(ex => ex.movementPattern === pattern);
}

/**
 * Get exercises by equipment
 */
export function getExercisesByEquipment(equipment: string[]): Exercise[] {
  if (equipment.length === 0) {
    // Return bodyweight exercises
    return exerciseLibrary.filter(ex => ex.equipment.length === 0);
  }
  return exerciseLibrary.filter(ex => 
    ex.equipment.length === 0 || 
    ex.equipment.some(eq => equipment.includes(eq))
  );
}

/**
 * Get pelvic floor safe exercises
 */
export function getPelvicFloorSafeExercises(): Exercise[] {
  return exerciseLibrary.filter(ex => ex.pelvicFloorSafe);
}

/**
 * Get exercises by difficulty
 */
export function getExercisesByDifficulty(maxDifficulty: number): Exercise[] {
  return exerciseLibrary.filter(ex => ex.difficultyLevel <= maxDifficulty);
}

/**
 * Find similar exercises for swapping
 */
export function findSimilarExercises(
  exerciseKey: string, 
  userEquipment: string[] = [],
  limit: number = 5
): Exercise[] {
  const exercise = getExerciseByKey(exerciseKey);
  if (!exercise) return [];

  const candidates = exerciseLibrary
    .filter(ex => ex.key !== exerciseKey)
    .map(ex => {
      let score = 0;
      
      // Movement pattern match (highest weight)
      if (ex.movementPattern === exercise.movementPattern) score += 40;
      
      // Primary muscle group overlap
      const primaryOverlap = ex.muscleGroups.primary.filter(
        m => exercise.muscleGroups.primary.includes(m)
      ).length;
      score += primaryOverlap * 15;
      
      // Equipment compatibility
      const hasEquipment = ex.equipment.length === 0 || 
        ex.equipment.some(eq => userEquipment.includes(eq));
      if (hasEquipment) score += 20;
      
      // Difficulty similarity
      const diffDiff = Math.abs(ex.difficultyLevel - exercise.difficultyLevel);
      score += Math.max(0, 10 - diffDiff * 3);
      
      // Bone loading type match
      if (ex.boneLoadingType === exercise.boneLoadingType) score += 5;
      
      return { exercise: ex, score };
    })
    .filter(({ score }) => score >= 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ exercise }) => exercise);

  return candidates;
}

export default exerciseLibrary;
