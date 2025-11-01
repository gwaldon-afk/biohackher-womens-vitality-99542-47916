// Evidence-based protocol recommendations from Stacey Sims, Gabrielle Lyon, and contemporary female longevity research

export interface EvidenceBasedIntervention {
  type: 'supplement' | 'exercise' | 'habit' | 'therapy' | 'diet';
  name: string;
  dosage?: string;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[];
  sets_reps?: string; // For exercises
  progressive_overload?: boolean;
  reason: string;
  evidence_source: string;
  evidence_strength: 'weak' | 'moderate' | 'strong' | 'very_strong';
}

// Universal Protein Protocol (Gabrielle Lyon: Minimum 30g per meal, 3x daily)
export const PROTEIN_PROTOCOL: EvidenceBasedIntervention[] = [
  {
    type: 'diet',
    name: 'Protein-Rich Breakfast (30g minimum)',
    dosage: '30-40g protein',
    frequency: 'daily',
    time_of_day: ['morning'],
    reason: 'Muscle protein synthesis requires 30g+ protein per meal for women. Breakfast sets metabolic tone.',
    evidence_source: 'Gabrielle Lyon - Forever Strong (2023)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'diet',
    name: 'Protein-Rich Lunch (30g minimum)',
    dosage: '30-40g protein',
    frequency: 'daily',
    time_of_day: ['afternoon'],
    reason: 'Maintains muscle protein synthesis throughout the day, prevents muscle catabolism.',
    evidence_source: 'Gabrielle Lyon - Forever Strong (2023)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'diet',
    name: 'Protein-Rich Dinner (30g minimum)',
    dosage: '30-40g protein',
    frequency: 'daily',
    time_of_day: ['evening'],
    reason: 'Supports overnight muscle recovery and repair. Essential for metabolic health.',
    evidence_source: 'Gabrielle Lyon - Forever Strong (2023)',
    evidence_strength: 'very_strong',
  },
];

// Resistance Training Protocol (Stacey Sims: 4+ days/week, progressive overload, compound lifts)
export const RESISTANCE_TRAINING_PROTOCOL: EvidenceBasedIntervention[] = [
  {
    type: 'exercise',
    name: 'Lower Body Compound Lifts',
    sets_reps: '3-4 sets x 6-10 reps',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: true,
    reason: 'Squats, deadlifts, lunges build bone density and muscle mass. Critical for perimenopause+.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'exercise',
    name: 'Upper Body Compound Lifts',
    sets_reps: '3-4 sets x 6-10 reps',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: true,
    reason: 'Bench press, overhead press, rows maintain upper body strength and bone density.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'exercise',
    name: 'Power/Explosive Training',
    sets_reps: '3-5 sets x 3-5 reps',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: true,
    reason: 'Jump squats, medicine ball throws maintain fast-twitch fibers. Prevents age-related power loss.',
    evidence_source: 'Stacey Sims - ROAR (2016)',
    evidence_strength: 'strong',
  },
];

// HIIT Protocol (Stacey Sims: 2x/week for perimenopause+)
export const HIIT_PROTOCOL: EvidenceBasedIntervention[] = [
  {
    type: 'exercise',
    name: 'High-Intensity Interval Training',
    sets_reps: '4-6 intervals x 30-60 sec @ 85-95% max HR',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: false,
    reason: 'HIIT stimulates growth hormone, improves insulin sensitivity, and maintains cardiovascular fitness.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'very_strong',
  },
];

// Critical Supplements for Women (Evidence-Based)
export const CRITICAL_SUPPLEMENTS: EvidenceBasedIntervention[] = [
  {
    type: 'supplement',
    name: 'Creatine Monohydrate',
    dosage: '5g daily',
    frequency: 'daily',
    time_of_day: ['morning'],
    reason: 'Improves muscle strength, bone density, cognitive function. Safe and effective for women.',
    evidence_source: 'Multiple meta-analyses (2023), Stacey Sims',
    evidence_strength: 'very_strong',
  },
  {
    type: 'supplement',
    name: 'Vitamin D3 + K2',
    dosage: '2000-4000 IU D3 + 100mcg K2',
    frequency: 'daily',
    time_of_day: ['morning'],
    reason: 'Essential for bone health, immune function, mood. Most women are deficient.',
    evidence_source: 'Endocrine Society Guidelines (2023)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'supplement',
    name: 'Glycine',
    dosage: '3g before bed',
    frequency: 'daily',
    time_of_day: ['evening'],
    reason: 'Improves sleep quality, supports collagen synthesis, aids detoxification.',
    evidence_source: 'Sleep Research (2022)',
    evidence_strength: 'strong',
  },
  {
    type: 'supplement',
    name: 'Taurine',
    dosage: '500-1000mg',
    frequency: 'daily',
    time_of_day: ['morning'],
    reason: 'Emerging longevity supplement. Supports cardiovascular health, reduces oxidative stress.',
    evidence_source: 'Science (2023) - Taurine Deficiency and Aging',
    evidence_strength: 'moderate',
  },
  {
    type: 'supplement',
    name: 'Collagen Peptides',
    dosage: '10-20g',
    frequency: 'daily',
    time_of_day: ['morning'],
    reason: 'Supports skin elasticity, joint health, bone density. Particularly important for women 40+.',
    evidence_source: 'Multiple RCTs (2021-2023)',
    evidence_strength: 'strong',
  },
];

// Stage-Specific Protocols (Perimenopause vs Postmenopause)
export const PERIMENOPAUSE_PROTOCOL: EvidenceBasedIntervention[] = [
  {
    type: 'exercise',
    name: 'Aggressive Resistance Training',
    sets_reps: '4 sets x 6-8 reps @ 75-85% 1RM',
    frequency: 'daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: true,
    reason: 'Combat rapid muscle loss during perimenopause. Higher volume and intensity needed.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'exercise',
    name: 'Sprint Interval Training',
    sets_reps: '6-8 x 20-30 sec all-out sprints',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: false,
    reason: 'Counteracts declining estrogen effects on body composition and insulin sensitivity.',
    evidence_source: 'Stacey Sims - ROAR (2016)',
    evidence_strength: 'strong',
  },
];

export const POSTMENOPAUSE_PROTOCOL: EvidenceBasedIntervention[] = [
  {
    type: 'exercise',
    name: 'Moderate Resistance Training with Recovery',
    sets_reps: '3 sets x 8-12 reps @ 65-75% 1RM',
    frequency: 'daily',
    time_of_day: ['morning', 'afternoon'],
    progressive_overload: true,
    reason: 'Maintain bone density and muscle mass. Emphasize recovery due to reduced estrogen.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'very_strong',
  },
  {
    type: 'habit',
    name: 'Extended Recovery Days',
    frequency: 'twice_daily',
    time_of_day: ['morning', 'afternoon', 'evening'],
    reason: 'Recovery capacity decreases post-menopause. Need more rest between intense sessions.',
    evidence_source: 'Stacey Sims - Next Level (2022)',
    evidence_strength: 'strong',
  },
];

// Periodization Guidance
export const PERIODIZATION_GUIDANCE: EvidenceBasedIntervention[] = [
  {
    type: 'habit',
    name: 'Progressive Overload Tracking',
    frequency: 'daily',
    time_of_day: ['morning', 'afternoon'],
    reason: 'Track weight, reps, or volume increases weekly. Essential for continued adaptation.',
    evidence_source: 'Exercise Science Principles',
    evidence_strength: 'very_strong',
  },
  {
    type: 'habit',
    name: 'Deload Week Every 4-6 Weeks',
    frequency: 'weekly',
    time_of_day: ['morning', 'afternoon'],
    reason: 'Reduce volume by 40-50% to prevent overtraining and allow supercompensation.',
    evidence_source: 'Periodization Research',
    evidence_strength: 'strong',
  },
];
