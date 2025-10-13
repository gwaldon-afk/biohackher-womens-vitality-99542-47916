// Helper functions for nutrition page

export function transformAIMeal(aiMeal: any, mealType: string) {
  return {
    name: aiMeal.name,
    description: aiMeal.description,
    foods: aiMeal.ingredients.map((ing: any) => ({
      name: ing.name,
      amount: `${ing.amount} ${ing.unit}`,
      protein: 0, // Will be calculated
      carbs: 0,
      fat: 0,
      serving: parseFloat(ing.amount) || 0
    })),
    totalProtein: aiMeal.nutrition.protein,
    totalCarbs: aiMeal.nutrition.carbs,
    totalFat: aiMeal.nutrition.fat,
    totalCalories: aiMeal.nutrition.calories,
    totalFiber: aiMeal.nutrition.fiber,
    instructions: aiMeal.instructions,
    generatedBy: 'ai'
  };
}
