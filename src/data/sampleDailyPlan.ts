// Sample daily plan data for guest/new users to preview functionality

// Sample goals for guest users
export const SAMPLE_GOALS = [
  {
    id: 'sample-goal-1',
    title: 'Build Muscle Strength & Longevity',
    description: 'Progressive resistance training for metabolic health',
    target_value: 90,
    current_value: 60,
    status: 'active',
    progress_percentage: 67,
    days_active: 12
  },
  {
    id: 'sample-goal-2',
    title: 'Optimize Sleep Quality',
    description: 'Consistent 7-8 hours with deep sleep phases',
    target_value: 90,
    current_value: 40,
    status: 'active',
    progress_percentage: 45,
    days_active: 8
  }
];

export const SAMPLE_DAILY_ACTIONS = [
  // Morning Actions
  {
    id: 'sample-1',
    title: 'Morning Sunlight Exposure',
    description: 'Get 10-15 minutes of direct sunlight to optimize circadian rhythm',
    category: 'foundation' as const,
    timeOfDay: ['morning'],
    estimatedMinutes: 15,
    priority: 8,
    completed: false,
    type: 'protocol' as const,
    pillar: 'balance'
  },
  {
    id: 'sample-2',
    title: 'Longevity Stack Supplements',
    description: 'Take your morning supplements: NAD+ precursor, CoQ10, Omega-3',
    category: 'supplement' as const,
    timeOfDay: ['morning'],
    estimatedMinutes: 2,
    priority: 9,
    completed: false,
    type: 'protocol' as const,
    pillar: 'body'
  },
  {
    id: 'sample-3',
    title: 'Protein-Rich Breakfast',
    description: '30g protein to support muscle synthesis and metabolic health',
    category: 'nutrition' as const,
    timeOfDay: ['morning'],
    estimatedMinutes: 20,
    priority: 7,
    completed: false,
    type: 'protocol' as const,
    pillar: 'body'
  },
  {
    id: 'sample-4',
    title: 'Morning Movement',
    description: '20-minute walk or yoga to activate circulation and boost energy',
    category: 'movement' as const,
    timeOfDay: ['morning'],
    estimatedMinutes: 20,
    priority: 6,
    completed: false,
    type: 'protocol' as const,
    pillar: 'body'
  },
  
  // Afternoon Actions
  {
    id: 'sample-5',
    title: 'Hydration Check',
    description: 'Drink 16oz water with electrolytes for optimal cellular function',
    category: 'foundation' as const,
    timeOfDay: ['afternoon'],
    estimatedMinutes: 2,
    priority: 5,
    completed: false,
    type: 'protocol' as const,
    pillar: 'body'
  },
  {
    id: 'sample-6',
    title: 'Brain Training',
    description: '10 minutes cognitive exercises or learning new skill',
    category: 'cognitive' as const,
    timeOfDay: ['afternoon'],
    estimatedMinutes: 10,
    priority: 6,
    completed: false,
    type: 'protocol' as const,
    pillar: 'brain'
  },
  {
    id: 'sample-7',
    title: 'Strength Training',
    description: '30-minute resistance workout for muscle longevity',
    category: 'movement' as const,
    timeOfDay: ['afternoon'],
    estimatedMinutes: 30,
    priority: 8,
    completed: false,
    type: 'protocol' as const,
    pillar: 'body'
  },
  
  // Evening Actions
  {
    id: 'sample-8',
    title: 'Evening Skincare Routine',
    description: 'Retinol application and collagen support for skin longevity',
    category: 'beauty' as const,
    timeOfDay: ['evening'],
    estimatedMinutes: 10,
    priority: 5,
    completed: false,
    type: 'protocol' as const,
    pillar: 'beauty'
  },
  {
    id: 'sample-9',
    title: 'Stress Management',
    description: '15-minute meditation or breathwork for nervous system regulation',
    category: 'foundation' as const,
    timeOfDay: ['evening'],
    estimatedMinutes: 15,
    priority: 7,
    completed: false,
    type: 'protocol' as const,
    pillar: 'balance'
  },
  {
    id: 'sample-10',
    title: 'Sleep Optimization',
    description: 'Blue light blocking, room cooling, and magnesium for deep sleep',
    category: 'foundation' as const,
    timeOfDay: ['evening'],
    estimatedMinutes: 10,
    priority: 9,
    completed: false,
    type: 'protocol' as const,
    pillar: 'balance'
  },
];
