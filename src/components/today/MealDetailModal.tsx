import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface MealDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions?: string;
  };
  mealType: string;
}

export const MealDetailModal = ({ open, onOpenChange, meal, mealType }: MealDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{meal.name}</DialogTitle>
          <DialogDescription className="text-base">
            {mealType.charAt(0).toUpperCase() + mealType.slice(1)} • {meal.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nutrition Facts */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{meal.calories}</p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{meal.protein}g</p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{meal.carbs}g</p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <p className="text-2xl font-bold text-primary">{meal.fat}g</p>
              <p className="text-xs text-muted-foreground">Fat</p>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              Ingredients
              <Badge variant="secondary">{meal.ingredients.length} items</Badge>
            </h3>
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-muted-foreground">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          {meal.instructions && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">Instructions</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {meal.instructions}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
