import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChronoNutritionStepProps {
  data: {
    first_meal_hour?: number;
    last_meal_hour?: number;
    eats_after_8pm?: boolean;
  };
  onChange: (field: string, value: any) => void;
}

const firstMealOptions = [
  { value: 1, label: 'Before 7am', description: 'Very early eater' },
  { value: 2, label: '7am - 9am', description: 'Morning eater' },
  { value: 3, label: '9am - 11am', description: 'Mid-morning eater' },
  { value: 4, label: 'After 11am', description: 'Late eater / intermittent faster' },
];

const lastMealOptions = [
  { value: 1, label: 'Before 6pm', description: 'Early dinner' },
  { value: 2, label: '6pm - 8pm', description: 'Standard dinner time' },
  { value: 3, label: '8pm - 10pm', description: 'Late dinner' },
  { value: 4, label: 'After 10pm', description: 'Very late eater' },
];

export function ChronoNutritionStep({ data, onChange }: ChronoNutritionStepProps) {
  const calculateMealWindow = () => {
    if (!data.first_meal_hour || !data.last_meal_hour) return null;
    
    // Approximate hours based on selections
    const firstHour = [6, 8, 10, 12][data.first_meal_hour - 1];
    const lastHour = [17, 19, 21, 23][data.last_meal_hour - 1];
    return lastHour - firstHour;
  };

  const mealWindow = calculateMealWindow();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle>Meal Timing & Circadian Alignment</CardTitle>
        </div>
        <CardDescription>
          When you eat impacts metabolism, hormones, and longevity as much as what you eat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-bold text-lg">When do you typically eat your first meal?</p>
          {firstMealOptions.map((option) => {
            const isSelected = data.first_meal_hour === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange('first_meal_hour', option.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">When do you typically eat your last meal?</p>
          {lastMealOptions.map((option) => {
            const isSelected = data.last_meal_hour === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange('last_meal_hour', option.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        {mealWindow !== null && (
          <div className={cn(
            "p-4 rounded-lg border-2",
            mealWindow <= 12 ? "border-green-500/50 bg-green-500/5" : mealWindow <= 14 ? "border-yellow-500/50 bg-yellow-500/5" : "border-red-500/50 bg-red-500/5"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-5 w-5" />
              <p className="font-semibold">Your Eating Window: ~{mealWindow} hours</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {mealWindow <= 12 && "Excellent! This supports circadian metabolism and cellular repair."}
              {mealWindow > 12 && mealWindow <= 14 && "Good window. Consider compressing slightly for enhanced longevity benefits."}
              {mealWindow > 14 && "Wide eating window may reduce autophagy. Consider time-restricted eating."}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <p className="font-medium">Do you eat or snack after 8pm?</p>
          <div className="flex gap-4">
            <button
              onClick={() => onChange('eats_after_8pm', true)}
              className={cn(
                "flex-1 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                data.eats_after_8pm === true ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <p className="font-semibold text-center">Yes, regularly</p>
            </button>
            <button
              onClick={() => onChange('eats_after_8pm', false)}
              className={cn(
                "flex-1 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                data.eats_after_8pm === false ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <p className="font-semibold text-center">No, rarely</p>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
