import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";

export const NutritionSummaryCard = () => {
  const navigate = useNavigate();
  const { preferences } = useNutritionPreferences();

  const mealPlan = [
    {
      meal: "Breakfast",
      suggestion: preferences?.dietary_preference === 'vegan' 
        ? "Oatmeal with berries & seeds"
        : preferences?.dietary_preference === 'keto'
        ? "Eggs with avocado & spinach"
        : "Greek yogurt with fruit & nuts"
    },
    {
      meal: "Lunch",
      suggestion: preferences?.dietary_preference === 'vegan'
        ? "Buddha bowl with quinoa & vegetables"
        : preferences?.dietary_preference === 'keto'
        ? "Grilled salmon with leafy greens"
        : "Grilled chicken salad"
    },
    {
      meal: "Dinner",
      suggestion: preferences?.dietary_preference === 'vegan'
        ? "Lentil curry with brown rice"
        : preferences?.dietary_preference === 'keto'
        ? "Grass-fed beef with roasted vegetables"
        : "Baked fish with roasted vegetables"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Utensils className="w-5 h-5" />
          Today's Nutrition
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {mealPlan.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.meal}</p>
                <p className="text-sm text-muted-foreground">{item.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => navigate('/nutrition')}
        >
          View Full Meal Plan
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
