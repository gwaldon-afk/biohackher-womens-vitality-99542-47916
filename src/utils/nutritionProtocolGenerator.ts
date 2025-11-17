export interface ProtocolItem {
  name: string;
  description: string;
  category: 'immediate' | 'foundation' | 'optimization';
  relevance: string;
  productKeywords?: string[];
  frequency?: 'daily' | 'twice_daily' | 'three_times_daily';
  time_of_day?: string;
}

export interface NutritionProtocol {
  immediate: ProtocolItem[];
  foundation: ProtocolItem[];
  optimization: ProtocolItem[];
}

/**
 * Generate personalized nutrition protocol based on assessment findings
 */
export function generateNutritionProtocol(assessmentData: {
  protein_score: number;
  fiber_score: number;
  plant_diversity_score: number;
  gut_symptom_score: number;
  inflammation_score: number;
  hydration_score: number;
  craving_pattern: number;
  eating_personality?: string;
}): NutritionProtocol {
  const protocol: NutritionProtocol = {
    immediate: [],
    foundation: [],
    optimization: []
  };

  // LOW PROTEIN SCORE (<3)
  if (assessmentData.protein_score < 3) {
    protocol.immediate.push({
      name: 'Whey Protein Isolate or Plant Protein',
      description: '20-30g daily with breakfast or post-workout',
      category: 'immediate',
      relevance: 'Critical to maintain muscle mass and metabolic health',
      productKeywords: ['whey protein', 'plant protein', 'protein powder'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
    protocol.foundation.push({
      name: 'Creatine Monohydrate',
      description: '5g daily, any time',
      category: 'foundation',
      relevance: 'Supports muscle retention and cognitive function',
      productKeywords: ['creatine', 'creatine monohydrate'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
  }

  // LOW FIBER/PLANT DIVERSITY (<3)
  if (assessmentData.fiber_score < 3 || assessmentData.plant_diversity_score < 3) {
    protocol.immediate.push({
      name: 'Increase Vegetable Intake',
      description: 'Add 2-3 cups of colorful vegetables at each meal',
      category: 'immediate',
      relevance: 'Fiber supports gut health, hormone metabolism, and longevity'
    });
    protocol.foundation.push({
      name: 'Psyllium Husk or Fiber Supplement',
      description: '5-10g daily with water',
      category: 'foundation',
      relevance: 'Addresses immediate fiber gap for gut and metabolic health',
      productKeywords: ['fiber', 'psyllium', 'prebiotics'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
  }

  // HIGH GUT SYMPTOMS (>3)
  if (assessmentData.gut_symptom_score > 3) {
    protocol.immediate.push({
      name: 'Remove Inflammatory Triggers',
      description: 'Eliminate gluten, dairy, and processed foods for 2 weeks',
      category: 'immediate',
      relevance: 'Gut inflammation disrupts nutrient absorption and hormone balance'
    });
    protocol.foundation.push({
      name: 'Multi-Strain Probiotic',
      description: '10+ billion CFU daily with meals',
      category: 'foundation',
      relevance: 'Restores beneficial gut bacteria for digestion and immune function',
      productKeywords: ['probiotic', 'gut health', 'digestive support'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
    protocol.foundation.push({
      name: 'Digestive Enzymes',
      description: 'Take with each main meal',
      category: 'foundation',
      relevance: 'Supports breakdown of proteins, fats, and carbs for better digestion',
      productKeywords: ['digestive enzymes', 'enzyme complex'],
      frequency: 'three_times_daily',
      time_of_day: 'with meals'
    });
    protocol.optimization.push({
      name: 'L-Glutamine',
      description: '5g daily on empty stomach',
      category: 'optimization',
      relevance: 'Repairs gut lining and reduces intestinal permeability',
      productKeywords: ['l-glutamine', 'glutamine', 'gut repair'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
  }

  // HIGH INFLAMMATION (>3)
  if (assessmentData.inflammation_score > 3) {
    protocol.immediate.push({
      name: 'Anti-Inflammatory Food Focus',
      description: 'Prioritize fatty fish, leafy greens, berries, and olive oil',
      category: 'immediate',
      relevance: 'Dietary inflammation accelerates aging and disease risk'
    });
    protocol.foundation.push({
      name: 'Omega-3 Fish Oil',
      description: '2000-3000mg EPA+DHA daily with meals',
      category: 'foundation',
      relevance: 'Reduces systemic inflammation and supports brain and heart health',
      productKeywords: ['omega-3', 'fish oil', 'epa dha'],
      frequency: 'daily',
      time_of_day: 'with meals'
    });
    protocol.foundation.push({
      name: 'Curcumin (Turmeric Extract)',
      description: '500-1000mg with black pepper daily',
      category: 'foundation',
      relevance: 'Potent anti-inflammatory with neuroprotective benefits',
      productKeywords: ['curcumin', 'turmeric', 'anti-inflammatory'],
      frequency: 'daily',
      time_of_day: 'with meals'
    });
  }

  // LOW HYDRATION (<3)
  if (assessmentData.hydration_score < 3) {
    protocol.immediate.push({
      name: 'Increase Daily Water Intake',
      description: 'Drink 30-35ml per kg of body weight daily',
      category: 'immediate',
      relevance: 'Hydration supports cellular function, detoxification, and skin health'
    });
    protocol.foundation.push({
      name: 'Electrolyte Supplement',
      description: 'Add to water 1-2 times daily',
      category: 'foundation',
      relevance: 'Improves hydration efficiency and cellular function',
      productKeywords: ['electrolytes', 'hydration', 'minerals'],
      frequency: 'twice_daily',
      time_of_day: 'morning and afternoon'
    });
  }

  // HIGH CRAVING PATTERN (>3)
  if (assessmentData.craving_pattern > 3) {
    protocol.immediate.push({
      name: 'Stabilize Blood Sugar',
      description: 'Eat protein and fat with every meal, avoid eating carbs alone',
      category: 'immediate',
      relevance: 'Blood sugar spikes drive cravings and metabolic dysfunction'
    });
    protocol.foundation.push({
      name: 'Chromium Picolinate',
      description: '200-400mcg daily with meals',
      category: 'foundation',
      relevance: 'Supports insulin sensitivity and reduces sugar cravings',
      productKeywords: ['chromium', 'blood sugar support'],
      frequency: 'daily',
      time_of_day: 'with meals'
    });
    protocol.optimization.push({
      name: 'L-Theanine',
      description: '200mg when cravings hit or with coffee',
      category: 'optimization',
      relevance: 'Reduces stress-driven cravings and promotes calm focus',
      productKeywords: ['l-theanine', 'theanine', 'stress support'],
      frequency: 'daily',
      time_of_day: 'as needed'
    });
  }

  // UNIVERSAL FOUNDATION SUPPLEMENTS (add if not already present)
  const foundationNames = protocol.foundation.map(item => item.name.toLowerCase());
  
  if (!foundationNames.some(name => name.includes('vitamin d'))) {
    protocol.foundation.push({
      name: 'Vitamin D3 + K2',
      description: '2000-4000 IU D3 with 100mcg K2 daily',
      category: 'foundation',
      relevance: 'Universal longevity support for bone health, immunity, and hormone production',
      productKeywords: ['vitamin d3', 'vitamin k2', 'd3 k2'],
      frequency: 'daily',
      time_of_day: 'morning'
    });
  }

  if (!foundationNames.some(name => name.includes('magnesium'))) {
    protocol.foundation.push({
      name: 'Magnesium Glycinate',
      description: '300-400mg before bed',
      category: 'foundation',
      relevance: 'Supports sleep quality, muscle recovery, and stress resilience',
      productKeywords: ['magnesium', 'magnesium glycinate'],
      frequency: 'daily',
      time_of_day: 'evening'
    });
  }

  // OPTIMIZATION (ADVANCED LONGEVITY)
  protocol.optimization.push({
    name: 'Collagen Peptides',
    description: '10-20g daily with breakfast',
    category: 'optimization',
    relevance: 'Supports skin elasticity, joint health, and gut lining integrity',
    productKeywords: ['collagen', 'collagen peptides', 'hydrolyzed collagen'],
    frequency: 'daily',
    time_of_day: 'morning'
  });

  protocol.optimization.push({
    name: 'Taurine',
    description: '1000-2000mg daily',
    category: 'optimization',
    relevance: 'Emerging longevity supplement supporting cardiovascular and cellular health',
    productKeywords: ['taurine'],
    frequency: 'daily',
    time_of_day: 'morning'
  });

  return protocol;
}
