import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Candy } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CravingsStepProps {
  data: {
    craving_details?: {
      afternoon_cravings: number;
      carb_crashes: number;
      satiety_difficulty: number;
      morning_hunger: number;
    };
  };
  onChange: (field: string, value: any) => void;
}

const cravingQuestions = [
  {
    key: 'afternoon_cravings',
    question: 'Afternoon sugar/carb cravings (3-5pm)',
    low: 'Never',
    high: 'Daily, intense',
  },
  {
    key: 'carb_crashes',
    question: 'Energy crashes after eating carbs',
    low: 'Rarely',
    high: 'Always',
  },
  {
    key: 'satiety_difficulty',
    question: 'Difficulty feeling full/satisfied',
    low: 'Feel satisfied',
    high: 'Always hungry',
  },
  {
    key: 'morning_hunger',
    question: 'Wake up ravenous or no appetite?',
    low: 'No appetite',
    high: 'Very hungry',
  },
];

export function CravingsStep({ data, onChange }: CravingsStepProps) {
  const cravingDetails = data.craving_details || {
    afternoon_cravings: 3,
    carb_crashes: 3,
    satiety_difficulty: 3,
    morning_hunger: 3,
  };

  const updateCraving = (key: string, value: number[]) => {
    const updated = {
      ...cravingDetails,
      [key]: value[0],
    };
    onChange('craving_details', updated);
  };

  const averageScore =
    Object.values(cravingDetails).reduce((sum, val) => sum + val, 0) / 4;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Candy className="h-5 w-5 text-primary" />
          <CardTitle>Cravings & Blood Sugar Patterns</CardTitle>
        </div>
        <CardDescription>
          Understanding your hunger patterns helps identify blood sugar instability and metabolic dysfunction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cravingQuestions.map((item) => (
          <div key={item.key} className="space-y-3">
            <p className="font-bold text-lg">{item.question}</p>
            <div className="space-y-2">
              <Slider
                value={[cravingDetails[item.key as keyof typeof cravingDetails]]}
                onValueChange={(value) => updateCraving(item.key, value)}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{item.low}</span>
                <span>{item.high}</span>
              </div>
            </div>
          </div>
        ))}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
          <p className="font-semibold mb-2">Blood Sugar Stability Score</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-muted rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${((5 - averageScore) / 4) * 100}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-medium">
              {averageScore <= 2 && "Stable"}
              {averageScore > 2 && averageScore <= 3.5 && "Moderate"}
              {averageScore > 3.5 && "Unstable"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {averageScore <= 2 && "Your blood sugar appears well-regulated."}
            {averageScore > 2 && averageScore <= 3.5 && "Some blood sugar instability—protein and fiber can help."}
            {averageScore > 3.5 && "Significant blood sugar dysregulation. Nutrition changes can make a major impact."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
