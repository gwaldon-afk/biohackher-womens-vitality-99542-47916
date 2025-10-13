export const useNutritionCalculations = (weight: string, activityLevel: string, goal: string) => {
  const calculateProtein = () => {
    if (!weight) return { min: 0, max: 0 };
    const weightNum = parseFloat(weight);
    
    let multipliers;
    switch (activityLevel) {
      case "sedentary":
        multipliers = { min: 1.4, max: 1.6 };
        break;
      case "moderate":
        multipliers = { min: 1.6, max: 2.0 };
        break;
      case "active":
        multipliers = { min: 2.0, max: 2.4 };
        break;
      case "athlete":
        multipliers = { min: 2.4, max: 2.8 };
        break;
      default:
        multipliers = { min: 1.6, max: 2.0 };
    }
    
    return {
      min: Math.round(weightNum * multipliers.min * 10) / 10,
      max: Math.round(weightNum * multipliers.max * 10) / 10
    };
  };

  const calculateCalories = () => {
    if (!weight) return 0;
    const weightNum = parseFloat(weight);
    
    let bmr = weightNum * 22;
    
    let activityMultiplier;
    switch (activityLevel) {
      case "sedentary": activityMultiplier = 1.2; break;
      case "moderate": activityMultiplier = 1.5; break;
      case "active": activityMultiplier = 1.7; break;
      case "athlete": activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.5;
    }
    
    let calories = bmr * activityMultiplier;
    
    switch (goal) {
      case "weight-loss": calories = calories * 0.85; break;
      case "muscle-gain": calories = calories * 1.15; break;
      default: break;
    }
    
    return Math.round(calories);
  };

  const calculateMacros = () => {
    const calories = calculateCalories();
    const protein = Math.round((calculateProtein().min + calculateProtein().max) / 2);
    
    const proteinCalories = protein * 4;
    const fatCalories = calories * 0.25;
    const carbCalories = calories - proteinCalories - fatCalories;
    
    return {
      calories,
      protein,
      carbs: Math.round(carbCalories / 4),
      fat: Math.round(fatCalories / 9)
    };
  };

  return {
    calculateProtein,
    calculateCalories,
    calculateMacros
  };
};
