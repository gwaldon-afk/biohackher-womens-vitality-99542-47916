// Pre-Built Energy Biohacks & Quick Actions

export interface EnergyBiohack {
  id: string;
  type: 'balance' | 'fuel' | 'calm' | 'recharge';
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pillar: string;
  evidenceLevel: 'very_high' | 'high' | 'moderate';
  benefits: string[];
  instructions?: string[];
  contraindications?: string[];
}

export const ENERGY_BIOHACKS: EnergyBiohack[] = [
  // BALANCE - Circadian & Stress Reset
  {
    id: 'morning-sunlight',
    type: 'balance',
    name: 'Morning Sunlight Exposure',
    description: '10 minutes of natural light within 1 hour of waking',
    duration: '10 minutes',
    difficulty: 'easy',
    pillar: 'balance',
    evidenceLevel: 'very_high',
    benefits: [
      'Regulates cortisol awakening response',
      'Improves circadian rhythm',
      'Enhances afternoon energy',
      'Better sleep quality at night'
    ],
    instructions: [
      'Go outside within 1 hour of waking',
      'Face the sun (no sunglasses)',
      'Stay for 10 minutes minimum',
      'Cloudy days count - UV still penetrates'
    ]
  },
  {
    id: 'box-breathing',
    type: 'balance',
    name: 'Box Breathing (4-4-4-4)',
    description: 'Calms nervous system and reduces acute stress',
    duration: '5 minutes',
    difficulty: 'easy',
    pillar: 'brain',
    evidenceLevel: 'very_high',
    benefits: [
      'Lowers cortisol',
      'Activates parasympathetic nervous system',
      'Improves HRV',
      'Instant stress relief'
    ],
    instructions: [
      'Inhale for 4 counts',
      'Hold for 4 counts',
      'Exhale for 4 counts',
      'Hold for 4 counts',
      'Repeat for 5 minutes'
    ]
  },
  {
    id: 'cold-exposure',
    type: 'balance',
    name: 'Cold Exposure',
    description: '2-minute cold shower to reset stress response',
    duration: '2-3 minutes',
    difficulty: 'hard',
    pillar: 'body',
    evidenceLevel: 'high',
    benefits: [
      'Increases norepinephrine (alertness)',
      'Improves insulin sensitivity',
      'Reduces inflammation',
      'Builds stress resilience'
    ],
    instructions: [
      'Start with warm water',
      'Gradually reduce to cold',
      'Stay for 2-3 minutes',
      'Focus on breath control'
    ],
    contraindications: ['Heart conditions', 'Pregnancy', 'Raynaud\'s syndrome']
  },
  
  // FUEL - Nutrition for Energy
  {
    id: 'protein-breakfast',
    type: 'fuel',
    name: 'Protein-Rich Breakfast',
    description: '30g protein within 90 minutes of waking',
    duration: '20 minutes',
    difficulty: 'easy',
    pillar: 'body',
    evidenceLevel: 'very_high',
    benefits: [
      'Stabilizes blood sugar',
      'Increases satiety',
      'Supports muscle maintenance',
      'Improves afternoon energy'
    ],
    instructions: [
      'Eat within 90 minutes of waking',
      'Aim for 30-40g protein',
      'Examples: 3 eggs, Greek yogurt + nuts, protein smoothie',
      'Pair with healthy fats'
    ]
  },
  {
    id: 'electrolyte-hydration',
    type: 'fuel',
    name: 'Electrolyte Hydration',
    description: 'Add minerals to morning water for cellular energy',
    duration: '5 minutes',
    difficulty: 'easy',
    pillar: 'body',
    evidenceLevel: 'high',
    benefits: [
      'Improves hydration efficiency',
      'Supports mitochondrial function',
      'Reduces fatigue',
      'Enhances muscle recovery'
    ],
    instructions: [
      'Add pinch of sea salt to water',
      'Or use electrolyte powder',
      'Drink first thing in morning',
      'Aim for 16-20oz'
    ]
  },
  {
    id: 'low-gi-meals',
    type: 'fuel',
    name: 'Low-GI Meal Timing',
    description: 'Eat protein + fiber every 3-4 hours',
    duration: 'Ongoing',
    difficulty: 'medium',
    pillar: 'body',
    evidenceLevel: 'very_high',
    benefits: [
      'Prevents energy crashes',
      'Stabilizes blood glucose',
      'Reduces cravings',
      'Supports hormone balance'
    ],
    instructions: [
      'Eat every 3-4 hours',
      'Always pair carbs with protein/fat',
      'Avoid high-sugar foods alone',
      'Include fiber at each meal'
    ]
  },
  
  // CALM - Stress Management
  {
    id: 'adaptogenic-herbs',
    type: 'calm',
    name: 'Adaptogenic Herbs',
    description: 'Ashwagandha or Rhodiola for stress resilience',
    duration: 'Daily',
    difficulty: 'easy',
    pillar: 'balance',
    evidenceLevel: 'high',
    benefits: [
      'Regulates cortisol',
      'Improves stress response',
      'Enhances energy without stimulation',
      'Supports thyroid function'
    ],
    instructions: [
      'Ashwagandha: 300-500mg daily (evening)',
      'Rhodiola: 200-400mg daily (morning)',
      'Start with lower dose',
      'Take with food'
    ],
    contraindications: ['Pregnancy', 'Autoimmune conditions (consult doctor)']
  },
  {
    id: 'forest-bathing',
    type: 'calm',
    name: 'Forest Bathing (Shinrin-yoku)',
    description: '20 minutes in nature for nervous system reset',
    duration: '20 minutes',
    difficulty: 'easy',
    pillar: 'balance',
    evidenceLevel: 'high',
    benefits: [
      'Lowers cortisol',
      'Reduces blood pressure',
      'Improves mood',
      'Enhances immune function'
    ],
    instructions: [
      'Walk slowly in natural setting',
      'Engage all senses',
      'No music or phone',
      'Focus on present moment'
    ]
  },
  {
    id: 'evening-routine',
    type: 'calm',
    name: 'Wind-Down Routine',
    description: '1-hour pre-sleep ritual for deep rest',
    duration: '60 minutes',
    difficulty: 'medium',
    pillar: 'brain',
    evidenceLevel: 'very_high',
    benefits: [
      'Improves sleep quality',
      'Signals circadian system',
      'Reduces next-day fatigue',
      'Enhances REM sleep'
    ],
    instructions: [
      'Dim lights 1 hour before bed',
      'Limit screens (or use blue blockers)',
      'Try reading, stretching, or journaling',
      'Keep room cool (65-68°F)'
    ]
  },
  
  // RECHARGE - Recovery & Sleep
  {
    id: 'magnesium-glycinate',
    type: 'recharge',
    name: 'Magnesium Glycinate',
    description: '300-400mg before bed for deep sleep',
    duration: 'Daily',
    difficulty: 'easy',
    pillar: 'body',
    evidenceLevel: 'very_high',
    benefits: [
      'Improves sleep quality',
      'Relaxes nervous system',
      'Supports muscle recovery',
      'Reduces restless legs'
    ],
    instructions: [
      'Take 300-400mg 30-60 min before bed',
      'Use glycinate form (most absorbable)',
      'Avoid magnesium oxide',
      'Start with 200mg if new'
    ]
  },
  {
    id: 'nap-protocol',
    type: 'recharge',
    name: 'Strategic Power Nap',
    description: '20-minute nap between 1-3 PM for energy boost',
    duration: '20 minutes',
    difficulty: 'easy',
    pillar: 'brain',
    evidenceLevel: 'high',
    benefits: [
      'Restores cognitive function',
      'Improves alertness',
      'Enhances memory',
      'Reduces afternoon slump'
    ],
    instructions: [
      'Nap between 1-3 PM only',
      'Set alarm for exactly 20 minutes',
      'Darken room or use eye mask',
      'Avoid naps after 3 PM'
    ]
  },
  {
    id: 'yoga-nidra',
    type: 'recharge',
    name: 'Yoga Nidra (NSDR)',
    description: 'Non-sleep deep rest for recovery',
    duration: '10-20 minutes',
    difficulty: 'easy',
    pillar: 'brain',
    evidenceLevel: 'high',
    benefits: [
      'Restores dopamine',
      'Reduces cortisol',
      'Improves learning',
      'Enhances neuroplasticity'
    ],
    instructions: [
      'Lie down in quiet space',
      'Follow guided audio (YouTube/apps)',
      'Practice after poor sleep or high stress',
      'Can replace a nap'
    ]
  },
  {
    id: 'sleep-hygiene',
    type: 'recharge',
    name: 'Sleep Environment Optimization',
    description: 'Create perfect conditions for deep sleep',
    duration: 'Setup once',
    difficulty: 'medium',
    pillar: 'brain',
    evidenceLevel: 'very_high',
    benefits: [
      'Increases deep sleep %',
      'Improves REM cycles',
      'Enhances recovery',
      'Better next-day energy'
    ],
    instructions: [
      'Temperature: 65-68°F (18-20°C)',
      'Total darkness (blackout curtains)',
      'Quiet (white noise if needed)',
      'Remove screens from bedroom',
      'Invest in quality mattress/pillow'
    ]
  }
];

export const getBiohacksByType = (type: EnergyBiohack['type']) => 
  ENERGY_BIOHACKS.filter(b => b.type === type);

export const getBiohackById = (id: string) => 
  ENERGY_BIOHACKS.find(b => b.id === id);

export const getQuickBiohacks = () => 
  ENERGY_BIOHACKS.filter(b => b.difficulty === 'easy' && b.duration.includes('minute'));
