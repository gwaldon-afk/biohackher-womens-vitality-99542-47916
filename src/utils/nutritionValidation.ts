// Nutritional guardrails and validation utilities

export interface NutritionalMinimums {
  protein: number;
  fiber: number;
  vegetables: number;
  healthyFats: boolean;
}

export interface CulinaryCombination {
  base: string[];
  protein: string[];
  carbs: string[];
  vegetables: string[];
  fats: string[];
}

export const BREAKFAST_VALID_COMBINATIONS: CulinaryCombination[] = [
  {
    base: ['eggs'],
    protein: ['eggs'],
    carbs: ['oats', 'quinoa', 'sweet potato', 'whole grain toast'],
    vegetables: ['spinach', 'tomatoes', 'mushrooms', 'bell peppers'],
    fats: ['avocado', 'nuts', 'olive oil']
  },
  {
    base: ['yogurt'],
    protein: ['greek yogurt', 'protein powder'],
    carbs: ['oats', 'granola', 'berries', 'banana'],
    vegetables: [],
    fats: ['almonds', 'walnuts', 'chia seeds', 'flax seeds']
  },
  {
    base: ['smoothie'],
    protein: ['protein powder', 'greek yogurt', 'silken tofu'],
    carbs: ['banana', 'oats', 'berries', 'dates'],
    vegetables: ['spinach', 'kale'],
    fats: ['peanut butter', 'almond butter', 'chia seeds', 'avocado']
  }
];

export const LUNCH_DINNER_VALID_COMBINATIONS: CulinaryCombination[] = [
  {
    base: ['grilled'],
    protein: ['chicken', 'salmon', 'turkey', 'tofu', 'tempeh', 'lean beef'],
    carbs: ['brown rice', 'quinoa', 'sweet potato', 'whole grain pasta'],
    vegetables: ['broccoli', 'asparagus', 'bell peppers', 'zucchini', 'cauliflower'],
    fats: ['olive oil', 'avocado']
  },
  {
    base: ['stir-fry'],
    protein: ['chicken', 'shrimp', 'tofu', 'tempeh'],
    carbs: ['brown rice', 'quinoa', 'rice noodles'],
    vegetables: ['bell peppers', 'broccoli', 'snap peas', 'bok choy', 'carrots'],
    fats: ['sesame oil', 'cashews']
  },
  {
    base: ['bowl'],
    protein: ['salmon', 'chicken', 'chickpeas', 'lentils', 'turkey'],
    carbs: ['quinoa', 'brown rice', 'wild rice', 'farro'],
    vegetables: ['kale', 'spinach', 'cucumber', 'tomatoes', 'carrots'],
    fats: ['tahini', 'olive oil', 'avocado', 'nuts']
  }
];

export const CONTRAINDICATIONS: Record<string, string[]> = {
  'grapefruit': ['certain medications'],
  'high_oxalate': ['kidney stones'],
  'excessive_eggs': ['high cholesterol'],
  'raw_fish': ['pregnancy', 'immune compromised'],
  'high_mercury_fish': ['pregnancy', 'young children']
};

export const MAX_DAILY_LIMITS: Record<string, number> = {
  'eggs': 4, // whole eggs
  'salmon': 400, // grams
  'tuna': 300, // grams (mercury concern)
  'caffeine': 400, // mg
  'sodium': 2300, // mg
  'sugar': 50 // grams
};

export function validateNutritionalCompleteness(
  meal: any,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  const minimums: NutritionalMinimums = {
    protein: mealType === 'breakfast' ? 20 : 25,
    fiber: mealType === 'breakfast' ? 3 : 5,
    vegetables: mealType === 'breakfast' ? 0 : 100, // grams
    healthyFats: true
  };

  // Check protein
  const totalProtein = meal.foods?.reduce((sum: number, food: any) => {
    return sum + (food.protein || 0);
  }, 0) || 0;
  
  if (totalProtein < minimums.protein) {
    warnings.push(`Low protein: ${totalProtein.toFixed(1)}g (minimum ${minimums.protein}g)`);
  }

  // Check fiber
  const totalFiber = meal.foods?.reduce((sum: number, food: any) => {
    return sum + (food.fiber || 0);
  }, 0) || 0;
  
  if (totalFiber < minimums.fiber) {
    warnings.push(`Low fiber: ${totalFiber.toFixed(1)}g (minimum ${minimums.fiber}g)`);
  }

  // Check vegetables for lunch/dinner
  if (minimums.vegetables > 0) {
    const vegetableAmount = meal.foods?.reduce((sum: number, food: any) => {
      if (food.category === 'vegetable') {
        return sum + (food.serving || 0);
      }
      return sum;
    }, 0) || 0;
    
    if (vegetableAmount < minimums.vegetables) {
      warnings.push(`Insufficient vegetables: ${vegetableAmount}g (minimum ${minimums.vegetables}g)`);
    }
  }

  // Check healthy fats
  const hasHealthyFats = meal.foods?.some((food: any) => 
    ['avocado', 'nuts', 'olive oil', 'salmon', 'seeds'].some(fat => 
      food.name?.toLowerCase().includes(fat)
    )
  );
  
  if (!hasHealthyFats) {
    warnings.push('Missing healthy fats source');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

export function validateCulinarySense(
  meal: any,
  mealType: 'breakfast' | 'lunch' | 'dinner'
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const foodNames = meal.foods?.map((f: any) => f.name?.toLowerCase() || '') || [];

  // Check for nonsensical breakfast combinations
  if (mealType === 'breakfast') {
    const heavyProteins = ['salmon', 'beef', 'pork', 'lamb'];
    const hasHeavyProtein = foodNames.some(name => 
      heavyProteins.some(protein => name.includes(protein))
    );
    if (hasHeavyProtein) {
      errors.push('Heavy proteins like salmon/beef are not typical for breakfast');
    }

    // Yogurt shouldn't be with savory proteins
    if (foodNames.includes('yogurt') && 
        (foodNames.includes('salmon') || foodNames.includes('chicken'))) {
      errors.push('Yogurt should not be combined with savory proteins');
    }
  }

  // Check for incompatible flavor profiles
  const sweetItems = ['banana', 'berries', 'honey', 'dates'];
  const savoryItems = ['salmon', 'chicken', 'beef', 'cheese'];
  
  const hasSweet = foodNames.some(name => sweetItems.some(item => name.includes(item)));
  const hasSavory = foodNames.some(name => savoryItems.some(item => name.includes(item)));
  
  if (hasSweet && hasSavory && mealType !== 'breakfast') {
    errors.push('Conflicting sweet and savory flavor profiles');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function checkSafetyContraindications(
  meal: any,
  userProfile: { isPregnant?: boolean; hasKidneyIssues?: boolean; hasHighCholesterol?: boolean }
): { warnings: string[] } {
  const warnings: string[] = [];
  const foodNames = meal.foods?.map((f: any) => f.name?.toLowerCase() || '') || [];

  // Check for pregnancy concerns
  if (userProfile.isPregnant) {
    if (foodNames.some(name => name.includes('raw'))) {
      warnings.push('Raw foods should be avoided during pregnancy');
    }
    if (foodNames.some(name => name.includes('tuna'))) {
      warnings.push('High-mercury fish should be limited during pregnancy');
    }
  }

  // Check for kidney concerns
  if (userProfile.hasKidneyIssues) {
    const highOxalate = ['spinach', 'almonds', 'beets'];
    if (foodNames.some(name => highOxalate.some(food => name.includes(food)))) {
      warnings.push('High-oxalate foods may need to be limited with kidney issues');
    }
  }

  // Check for cholesterol concerns
  if (userProfile.hasHighCholesterol) {
    const eggCount = meal.foods?.filter((f: any) => 
      f.name?.toLowerCase().includes('egg')
    ).reduce((sum: number, f: any) => sum + (f.serving || 0), 0) || 0;
    
    if (eggCount > 150) { // More than ~2 eggs
      warnings.push('Consider limiting eggs with high cholesterol');
    }
  }

  return { warnings };
}

export function validatePortionRealism(meal: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  meal.foods?.forEach((food: any) => {
    const serving = food.serving || 0;
    const name = food.name?.toLowerCase() || '';

    // Check maximum protein portions
    if (name.includes('egg') && serving > 300) {
      errors.push(`Egg portion too large: ${serving}g (max 300g / ~4 eggs)`);
    }
    if ((name.includes('chicken') || name.includes('turkey') || name.includes('beef')) && serving > 250) {
      errors.push(`${food.name} portion too large: ${serving}g (max 250g)`);
    }
    if (name.includes('salmon') && serving > 200) {
      errors.push(`Salmon portion too large: ${serving}g (max 200g)`);
    }

    // Check carb portions
    if ((name.includes('rice') || name.includes('quinoa') || name.includes('pasta')) && serving > 200) {
      errors.push(`${food.name} portion too large: ${serving}g cooked (max 200g)`);
    }

    // Check minimum portions
    if (serving < 10 && !name.includes('oil') && !name.includes('spice')) {
      errors.push(`${food.name} portion too small: ${serving}g (seems unrealistic)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}
