import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";

interface CookingConfidenceStepProps {
  data: {
    confidence_in_cooking?: number;
    food_preference_type?: string;
  };
  onChange: (field: string, value: any) => void;
}

const confidenceLevels = [
  { value: 1, label: 'Beginner', description: 'Rarely cook, prefer ready-made meals' },
  { value: 2, label: 'Basic', description: 'Can make simple meals, limited recipes' },
  { value: 3, label: 'Confident', description: 'Cook regularly, comfortable with recipes' },
  { value: 4, label: 'Skilled', description: 'Enjoy cooking, try new recipes often' },
  { value: 5, label: 'Expert', description: 'Love cooking, experiment with ingredients' },
];

export function CookingConfidenceStep({ data, onChange }: CookingConfidenceStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <CardTitle>Cooking Confidence & Preferences</CardTitle>
        </div>
        <CardDescription>
          This helps us recommend meal plans that match your skill level and lifestyle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-bold text-lg">How confident are you in the kitchen?</p>
          {confidenceLevels.map((level) => {
            const isSelected = data.confidence_in_cooking === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange('confidence_in_cooking', level.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">Do you prefer structure or flexibility in meal plans?</p>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => onChange('food_preference_type', 'structure')}
              className={cn(
                "text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                data.food_preference_type === 'structure' ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <h3 className="font-semibold mb-2">Structured Plan</h3>
              <p className="text-sm text-muted-foreground">
                I want clear meal plans with specific recipes and shopping lists
              </p>
            </button>

            <button
              onClick={() => onChange('food_preference_type', 'flexibility')}
              className={cn(
                "text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                data.food_preference_type === 'flexibility' ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <h3 className="font-semibold mb-2">Flexible Guidelines</h3>
              <p className="text-sm text-muted-foreground">
                I prefer general principles and ingredient swaps to fit my mood
              </p>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
