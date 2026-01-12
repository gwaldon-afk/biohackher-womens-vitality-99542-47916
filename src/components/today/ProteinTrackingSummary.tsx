import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";

interface ProteinTrackingSummaryProps {
  completedMeals: any[];
  nutritionPreferences?: NutritionPreferences;
}

export const ProteinTrackingSummary = ({ 
  completedMeals, 
  nutritionPreferences 
}: ProteinTrackingSummaryProps) => {
  const weight = nutritionPreferences?.weight ?? 0;
  const activityLevel = nutritionPreferences?.activityLevel ?? "sedentary";
  const goal = nutritionPreferences?.goal ?? "maintain";

  const { calculateProtein } = useNutritionCalculations(weight, activityLevel, goal);

  if (!nutritionPreferences?.weight) return null;

  const proteinTarget = calculateProtein();
  const proteinConsumed = completedMeals.reduce((sum, meal) => {
    return sum + (meal.mealData?.protein || 0);
  }, 0);

  const progressPercent = proteinTarget.max > 0 
    ? Math.min((proteinConsumed / proteinTarget.max) * 100, 100)
    : 0;

  return (
    <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥚</span>
            <div>
              <h3 className="font-semibold text-foreground">Daily Protein Target</h3>
              <p className="text-sm text-muted-foreground">
                Based on your weight and activity level
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">
              {proteinConsumed}g
            </p>
            <p className="text-sm text-muted-foreground">
              / {proteinTarget.min}-{proteinTarget.max}g
            </p>
          </div>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>
    </Card>
  );
};
