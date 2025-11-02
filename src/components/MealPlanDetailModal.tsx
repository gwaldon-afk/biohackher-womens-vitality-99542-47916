import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check } from "lucide-react";

interface MealPlanDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  mealPlan: any;
}

const MealPlanDetailModal = ({ isOpen, onClose, template, mealPlan }: MealPlanDetailModalProps) => {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Generate shopping list
  const generateShoppingList = () => {
    const ingredients = new Set<string>();
    days.forEach(day => {
      const dayMeals = mealPlan[day];
      if (dayMeals) {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const meal = dayMeals[mealType];
          if (meal?.ingredients) {
            meal.ingredients.forEach((ing: string) => ingredients.add(ing));
          }
        });
      }
    });
    return Array.from(ingredients).sort();
  };

  const shoppingList = generateShoppingList();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <span className="text-3xl">{template.icon}</span>
            {template.name}
          </DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">7-Day Plan</TabsTrigger>
            <TabsTrigger value="shopping">Shopping List</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {days.map((day) => {
                  const dayMeals = mealPlan[day];
                  if (!dayMeals) return null;

                  return (
                    <Card key={day}>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold capitalize mb-4">{day}</h3>
                        <div className="space-y-4">
                          {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                            const meal = dayMeals[mealType];
                            if (!meal) return null;

                            return (
                              <div key={mealType} className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-semibold capitalize">{mealType}: {meal.name}</p>
                                    <p className="text-sm text-muted-foreground">{meal.description}</p>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <Badge variant="secondary" className="text-xs">
                                      {meal.calories} cal
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {meal.protein}g protein
                                    </Badge>
                                  </div>
                                </div>
                                
                                {meal.ingredients && (
                                  <div className="pl-4 text-sm">
                                    <p className="font-medium text-muted-foreground mb-1">Ingredients:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                                      {meal.ingredients.map((ing: string, idx: number) => (
                                        <li key={idx}>{ing}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {meal.instructions && (
                                  <div className="pl-4 text-sm">
                                    <p className="font-medium text-muted-foreground mb-1">Instructions:</p>
                                    <p className="text-muted-foreground">{meal.instructions}</p>
                                  </div>
                                )}
                                
                                {mealType !== 'dinner' && <Separator className="mt-4" />}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shopping" className="mt-4">
            <ScrollArea className="h-[500px] pr-4">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Complete Shopping List
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All ingredients needed for your 7-day meal plan
                  </p>
                  <div className="grid gap-2">
                    {shoppingList.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="h-5 w-5 rounded border-2 border-muted-foreground flex items-center justify-center">
                          <Check className="h-3 w-3 text-muted-foreground opacity-0 hover:opacity-100 transition-opacity" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MealPlanDetailModal;
