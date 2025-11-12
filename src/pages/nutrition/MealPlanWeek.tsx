import Navigation from "@/components/Navigation";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Utensils, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { mealTemplates, templateMealPlans } from "@/data/mealTemplates";

export default function MealPlanWeek() {
  const { preferences, isLoading } = useNutritionPreferences();
  const navigate = useNavigate();
  const hasMealPlan = preferences?.selectedMealPlanTemplate;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-12">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p>Loading meal plan...</p>
          </div>
        </main>
      </div>
    );
  }

  // Empty state - no meal plan selected
  if (!hasMealPlan) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <Calendar className="h-16 w-16 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Create Your Personalized 7-Day Meal Plan</h1>
              <p className="text-muted-foreground text-lg">
                Get a complete week of longevity-optimized meals tailored to your dietary preferences, macros, and health goals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Personalized to your dietary preferences</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Optimized macros for longevity</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Shopping list included</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Syncs with your Today plan</p>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8"
                onClick={() => navigate('/nutrition?tab=meal-plans')}
              >
                <Utensils className="h-5 w-5 mr-2" />
                Get Started
              </Button>
              <p className="text-sm text-muted-foreground">Takes 5 minutes to set up</p>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // Active meal plan view
  const selectedTemplate = mealTemplates.find(t => t.id === hasMealPlan);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Your 7-Day Meal Plan</h1>
            <p className="text-muted-foreground">
              {selectedTemplate?.name || "Personalized meal plan"}
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/nutrition?tab=meal-plans')}
          >
            Edit Preferences
          </Button>
        </div>

        <div className="grid gap-4">
          {daysOfWeek.map((day, index) => {
            const dayMeals = templateMealPlans[hasMealPlan] || {};
            const breakfast = dayMeals.breakfast?.[index % (dayMeals.breakfast?.length || 1)];
            const lunch = dayMeals.lunch?.[index % (dayMeals.lunch?.length || 1)];
            const dinner = dayMeals.dinner?.[index % (dayMeals.dinner?.length || 1)];

            const totalCalories = (breakfast?.calories || 0) + (lunch?.calories || 0) + (dinner?.calories || 0);
            const totalProtein = (breakfast?.protein || 0) + (lunch?.protein || 0) + (dinner?.protein || 0);

            return (
              <Card key={day} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-foreground">{day}</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline">{Math.round(totalCalories)} cal</Badge>
                    <Badge variant="outline">{Math.round(totalProtein)}g protein</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase w-20">Breakfast</div>
                    <p className="flex-1 text-sm">{breakfast?.name || "Not specified"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase w-20">Lunch</div>
                    <p className="flex-1 text-sm">{lunch?.name || "Not specified"}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase w-20">Dinner</div>
                    <p className="flex-1 text-sm">{dinner?.name || "Not specified"}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button 
            size="lg"
            onClick={() => navigate('/today')}
          >
            View Today's Meals
          </Button>
        </div>
      </main>
    </div>
  );
}
