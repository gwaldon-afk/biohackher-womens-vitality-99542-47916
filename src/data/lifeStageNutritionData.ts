export interface LifeStageNutrition {
  decade: string;
  title: string;
  subtitle: string;
  focusAreas: string[];
  priorityNutrients: {
    name: string;
    reason: string;
    sources: string[];
    pillar: 'BODY' | 'BRAIN' | 'BALANCE' | 'BEAUTY';
  }[];
  hormoneConsiderations: string[];
  quickWins: string[];
  foodsToEmphasize: string[];
  foodsToLimit: string[];
  recommendedSupplements: string[];
}

export const lifeStageNutritionData: LifeStageNutrition[] = [
  {
    decade: '20s',
    title: 'Building the Foundations',
    subtitle: 'Establishing habits that will serve you for decades',
    focusAreas: [
      'Maximise bone density (peaks around age 30)',
      'Build lean muscle mass',
      'Establish healthy eating patterns',
      'Support reproductive health'
    ],
    priorityNutrients: [
      {
        name: 'Protein',
        reason: 'Essential for building and maintaining muscle mass, which becomes harder to build later',
        sources: ['Lean meats', 'Fish', 'Eggs', 'Legumes', 'Greek yogurt'],
        pillar: 'BODY'
      },
      {
        name: 'Calcium',
        reason: 'Critical for maximising bone density before it peaks',
        sources: ['Dairy', 'Fortified plant milks', 'Leafy greens', 'Sardines'],
        pillar: 'BODY'
      },
      {
        name: 'Iron',
        reason: 'Supports energy, immunity, and reproductive health',
        sources: ['Red meat', 'Spinach', 'Lentils', 'Fortified cereals'],
        pillar: 'BALANCE'
      }
    ],
    hormoneConsiderations: [
      'Support regular menstrual cycles through balanced nutrition',
      'Adequate iron intake to replace menstrual losses',
      'Consider folate if planning pregnancy'
    ],
    quickWins: [
      'Learn to meal prep for the week',
      'Aim for 2+ alcohol-free days per week',
      'Pair resistance training with protein timing',
      'Start a daily hydration habit'
    ],
    foodsToEmphasize: ['Lean proteins', 'Calcium-rich foods', 'Whole grains', 'Colourful vegetables'],
    foodsToLimit: ['Ultra-processed snacks', 'Excessive alcohol', 'High-sugar drinks'],
    recommendedSupplements: ['Vitamin D', 'Iron (if deficient)', 'Omega-3']
  },
  {
    decade: '30s',
    title: 'Maintaining Momentum',
    subtitle: 'Optimising energy and cognitive performance',
    focusAreas: [
      'Maintain energy levels during busy life stages',
      'Support cognitive performance',
      'Preserve muscle mass',
      'Prepare for hormonal transitions ahead'
    ],
    priorityNutrients: [
      {
        name: 'Iron',
        reason: 'Crucial for energy, immunity, and if considering pregnancy',
        sources: ['Red meat', 'Poultry', 'Fish', 'Beans', 'Dark leafy greens'],
        pillar: 'BALANCE'
      },
      {
        name: 'Zinc',
        reason: 'Supports memory, skin health, and fertility',
        sources: ['Oysters', 'Beef', 'Pumpkin seeds', 'Chickpeas'],
        pillar: 'BRAIN'
      },
      {
        name: 'B Vitamins',
        reason: 'Essential for energy metabolism and stress management',
        sources: ['Whole grains', 'Eggs', 'Meat', 'Leafy greens', 'Legumes'],
        pillar: 'BRAIN'
      }
    ],
    hormoneConsiderations: [
      'Late 30s may see early perimenopause signs',
      'Support thyroid function with adequate iodine and selenium',
      'Maintain consistent meal timing for hormone regulation'
    ],
    quickWins: [
      'Limit ultra-processed foods to protect gut health',
      'Establish consistent sleep routine for appetite regulation',
      'Daily walk after meals for blood sugar management',
      'Prioritise protein at breakfast'
    ],
    foodsToEmphasize: ['Iron-rich foods', 'Zinc-rich foods', 'Complex carbohydrates', 'Prebiotic foods'],
    foodsToLimit: ['Excessive caffeine', 'Processed meats', 'Refined sugars'],
    recommendedSupplements: ['B-Complex', 'Magnesium', 'Vitamin D', 'Probiotics']
  },
  {
    decade: '40s',
    title: 'Shifting Into Prevention Mode',
    subtitle: 'Supporting hormonal transitions and protecting long-term health',
    focusAreas: [
      'Navigate perimenopause symptoms',
      'Protect cardiovascular health',
      'Preserve muscle mass (accelerated loss begins)',
      'Support bone density maintenance'
    ],
    priorityNutrients: [
      {
        name: 'Phytoestrogens',
        reason: 'Natural compounds that may help manage perimenopause symptoms',
        sources: ['Soy products', 'Flaxseeds', 'Sesame seeds', 'Tofu', 'Edamame'],
        pillar: 'BALANCE'
      },
      {
        name: 'Omega-3 Fatty Acids',
        reason: 'Critical for cardiovascular health and reducing inflammation',
        sources: ['Oily fish', 'Walnuts', 'Chia seeds', 'Flaxseeds'],
        pillar: 'BRAIN'
      },
      {
        name: 'Creatine',
        reason: 'Supports muscle preservation and cognitive function (2-3g daily)',
        sources: ['Red meat', 'Fish', 'Supplement form'],
        pillar: 'BODY'
      },
      {
        name: 'Calcium + Vitamin D',
        reason: 'Essential duo for bone health as estrogen levels decline',
        sources: ['Dairy', 'Fortified foods', 'Safe sun exposure', 'Oily fish'],
        pillar: 'BODY'
      }
    ],
    hormoneConsiderations: [
      'Fluctuating oestrogen and progesterone affect cholesterol, mood, muscle, and concentration',
      'Hot flashes may be helped by avoiding triggers (alcohol, caffeine, spicy foods)',
      'Sleep quality often declines—avoid late meals'
    ],
    quickWins: [
      'Add tofu or edamame to meals 3x per week',
      'Include oily fish 2x per week',
      'Get safe sun exposure for vitamin D',
      'Consider creatine supplementation (2-3g daily)',
      'Finish eating 3 hours before bed'
    ],
    foodsToEmphasize: ['Soy foods', 'Oily fish', 'Leafy greens', 'Nuts and seeds', 'Fermented foods'],
    foodsToLimit: ['Alcohol', 'Excessive caffeine', 'Spicy foods (if hot flashes)', 'High-sodium foods'],
    recommendedSupplements: ['Creatine', 'Omega-3', 'Vitamin D3 + K2', 'Magnesium', 'Collagen']
  },
  {
    decade: '50s',
    title: 'Eating for Protection',
    subtitle: 'Prioritising nutrient density and gut health',
    focusAreas: [
      'Manage blood pressure through nutrition',
      'Support gut health and microbiome diversity',
      'Counter accelerated muscle loss',
      'Protect cognitive function'
    ],
    priorityNutrients: [
      {
        name: 'Potassium',
        reason: 'Helps manage blood pressure naturally',
        sources: ['Bananas', 'Sweet potatoes', 'Spinach', 'Avocados', 'Oranges'],
        pillar: 'BODY'
      },
      {
        name: 'Fibre',
        reason: 'Essential for gut health and colorectal protection',
        sources: ['Vegetables', 'Fruits', 'Whole grains', 'Legumes', 'Nuts'],
        pillar: 'BEAUTY'
      },
      {
        name: 'Complete Protein',
        reason: 'Every meal needs protein to prevent muscle wasting',
        sources: ['Eggs', 'Fish', 'Poultry', 'Dairy', 'Legumes + grains'],
        pillar: 'BODY'
      }
    ],
    hormoneConsiderations: [
      'Post-menopause: oestrogen decline accelerates bone and muscle loss',
      'Increased cardiovascular risk requires heart-healthy focus',
      'Metabolism slows—focus on nutrient density over quantity'
    ],
    quickWins: [
      'Aim for 5-6 vegetable servings daily',
      'Reduce packaged food salt intake',
      'Include a protein source with EVERY meal',
      'Add fermented foods daily for gut health',
      'Eat the rainbow—diverse plant colours'
    ],
    foodsToEmphasize: ['High-fibre foods', 'Lean proteins', 'Fermented foods', 'Colourful vegetables', 'Legumes'],
    foodsToLimit: ['High-sodium processed foods', 'Red meat (limit to 2x week)', 'Added sugars'],
    recommendedSupplements: ['Probiotics', 'Vitamin D3 + K2', 'Omega-3', 'Collagen', 'B12']
  },
  {
    decade: '60+',
    title: 'Thriving, Not Just Surviving',
    subtitle: 'Maximising nutrient absorption and quality of life',
    focusAreas: [
      'Maintain appetite and nutrient absorption',
      'Anti-inflammatory eating patterns',
      'Hydration (thirst signals diminish)',
      'Cognitive protection'
    ],
    priorityNutrients: [
      {
        name: 'Anti-inflammatory Foods',
        reason: 'Combat chronic low-grade inflammation associated with aging',
        sources: ['Berries', 'Oily fish', 'Olive oil', 'Nuts', 'Turmeric', 'Green tea'],
        pillar: 'BRAIN'
      },
      {
        name: 'B12',
        reason: 'Absorption decreases with age—essential for nerve function',
        sources: ['Meat', 'Fish', 'Eggs', 'Fortified foods', 'Supplements'],
        pillar: 'BRAIN'
      },
      {
        name: 'Calcium + Vitamin D',
        reason: 'Continued bone protection and fall prevention',
        sources: ['Dairy', 'Fortified foods', 'Supplements', 'Safe sun'],
        pillar: 'BODY'
      }
    ],
    hormoneConsiderations: [
      'Stable hormones post-menopause, but effects continue',
      'Thyroid function may change—support with iodine-rich foods',
      'Consider hormone replacement therapy discussion with doctor'
    ],
    quickWins: [
      'Flavour water with citrus, mint, or make herbal teas',
      'Eat colourful vegetables at every meal',
      'Choose smaller, nutrient-dense portions',
      'Include protein and healthy fats at each meal',
      'Stay socially engaged during meals'
    ],
    foodsToEmphasize: ['Berries', 'Oily fish', 'Olive oil', 'Nuts', 'Eggs', 'Leafy greens', 'Bone broth'],
    foodsToLimit: ['Empty calories', 'Excessive alcohol', 'High-sugar foods', 'Tough-to-chew foods if dental issues'],
    recommendedSupplements: ['Vitamin B12', 'Vitamin D3 + K2', 'Omega-3', 'Collagen', 'Probiotics', 'CoQ10']
  }
];

export function getLifeStageByAge(age: number): LifeStageNutrition {
  if (age < 30) return lifeStageNutritionData[0]; // 20s
  if (age < 40) return lifeStageNutritionData[1]; // 30s
  if (age < 50) return lifeStageNutritionData[2]; // 40s
  if (age < 60) return lifeStageNutritionData[3]; // 50s
  return lifeStageNutritionData[4]; // 60+
}

export function getDecadeLabel(age: number): string {
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  if (age < 60) return '50s';
  return '60+';
}
