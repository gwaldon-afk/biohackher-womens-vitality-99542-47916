import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import CTAButton from "@/components/CTAButton";

interface SampleMeal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SampleDailyPreviewProps {
  onCustomize?: () => void;
}

const SampleDailyPreview = ({ onCustomize }: SampleDailyPreviewProps) => {
  const sampleMeals: SampleMeal[] = [
    {
      name: "Greek Yogurt Power Bowl",
      description: "Greek yogurt with mixed berries, almonds, chia seeds & honey",
      calories: 420,
      protein: 35,
      carbs: 42,
      fat: 15
    },
    {
      name: "Mediterranean Salmon Bowl",
      description: "Grilled salmon with quinoa, roasted vegetables & tahini dressing",
      calories: 580,
      protein: 45,
      carbs: 48,
      fat: 22
    },
    {
      name: "Chicken Stir-Fry",
      description: "Lean chicken breast with mixed vegetables, brown rice & ginger sauce",
      calories: 520,
      protein: 42,
      carbs: 55,
      fat: 12
    }
  ];

  const dailyTotals = {
    calories: sampleMeals.reduce((sum, meal) => sum + meal.calories, 0),
    protein: sampleMeals.reduce((sum, meal) => sum + meal.protein, 0),
    carbs: sampleMeals.reduce((sum, meal) => sum + meal.carbs, 0),
    fat: sampleMeals.reduce((sum, meal) => sum + meal.fat, 0)
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold">Example Daily Meal Plan</h3>
            <Badge variant="secondary" className="text-xs">Sample</Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            This is what one day could look like - select your preferences below to personalize your own 7-day plan with variety
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {sampleMeals.map((meal, index) => (
          <Card key={index} className="bg-background/60 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">
                  {index === 0 ? "🌅" : index === 1 ? "☀️" : "🌙"}
                </span>
                <h4 className="font-semibold">{meal.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{meal.description}</p>
              <div className="grid grid-cols-4 gap-1 text-xs">
                <div className="text-center">
                  <div className="font-bold text-primary">{meal.calories}</div>
                  <div className="text-muted-foreground">cal</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{meal.protein}g</div>
                  <div className="text-muted-foreground">protein</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{meal.carbs}g</div>
                  <div className="text-muted-foreground">carbs</div>
                </div>
                <div className="text-center">
                  <div className="font-bold">{meal.fat}g</div>
                  <div className="text-muted-foreground">fat</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-primary/20 rounded-lg border border-primary/30">
        <div>
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            Daily Totals
          </h4>
          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-bold text-lg">{dailyTotals.calories}</span>
              <span className="text-muted-foreground ml-1">calories</span>
            </div>
            <div>
              <span className="font-bold text-lg">{dailyTotals.protein}g</span>
              <span className="text-muted-foreground ml-1">protein</span>
            </div>
            <div>
              <span className="font-bold text-lg">{dailyTotals.carbs}g</span>
              <span className="text-muted-foreground ml-1">carbs</span>
            </div>
            <div>
              <span className="font-bold text-lg">{dailyTotals.fat}g</span>
              <span className="text-muted-foreground ml-1">fat</span>
            </div>
          </div>
        </div>
        <CTAButton 
          text="Customize Your Plan" 
          onClick={onCustomize}
          variant="default"
          showArrow={true}
        />
      </div>
    </div>
  );
};

export default SampleDailyPreview;
