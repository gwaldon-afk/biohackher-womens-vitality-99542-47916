import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Utensils, ShoppingCart, Calendar, ChefHat } from "lucide-react";
import { mealTemplates, templateMealPlans } from "@/data/mealTemplates";
import { useState } from "react";
import MealPlanDetailModal from "./MealPlanDetailModal";

interface MealPlanProtocolCardProps {
  mealTemplateId: string;
  proteinTarget?: number;
  currentProtein?: number;
}

const MealPlanProtocolCard = ({ mealTemplateId, proteinTarget = 120, currentProtein = 0 }: MealPlanProtocolCardProps) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const template = mealTemplates.find(t => t.id === mealTemplateId);
  const mealPlan = templateMealPlans[mealTemplateId as keyof typeof templateMealPlans];
  
  if (!template || !mealPlan) return null;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayMeals = mealPlan[today as keyof typeof mealPlan] || mealPlan.monday;
  
  const proteinProgress = (currentProtein / proteinTarget) * 100;

  return (
    <>
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{template.icon}</div>
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  {template.name}
                  <Badge variant="outline" className="text-xs">
                    {template.avgProtein}g protein
                  </Badge>
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Protein Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">Today's Protein</span>
              <span className="text-muted-foreground">
                {currentProtein}g / {proteinTarget}g
              </span>
            </div>
            <Progress value={proteinProgress} className="h-2" />
          </div>

          {/* Today's Meals Preview */}
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              Today's Menu
            </p>
            <div className="space-y-1 pl-6">
              <div className="flex items-center justify-between text-sm">
                <span>Breakfast: {todayMeals.breakfast.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {todayMeals.breakfast.protein}g
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Lunch: {todayMeals.lunch.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {todayMeals.lunch.protein}g
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Dinner: {todayMeals.dinner.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {todayMeals.dinner.protein}g
                </Badge>
              </div>
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="flex flex-wrap gap-2">
            {template.dietaryTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowDetailModal(true)}
            >
              <Calendar className="h-4 w-4 mr-2" />
              View Full Week
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => setShowDetailModal(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </Button>
          </div>
        </CardContent>
      </Card>

      <MealPlanDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        template={template}
        mealPlan={mealPlan}
      />
    </>
  );
};

export default MealPlanProtocolCard;
