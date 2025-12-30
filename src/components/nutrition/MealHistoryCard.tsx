import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock, ChevronDown, ChevronUp, Apple } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFoodLogging, MealPhoto } from '@/hooks/useFoodLogging';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MealHistoryCardProps {
  showHeader?: boolean;
  maxItems?: number;
}

export const MealHistoryCard = ({ showHeader = true, maxItems }: MealHistoryCardProps) => {
  const { t } = useTranslation();
  const { confirmedMealsToday, dailyTotals, deleteMeal, isDeleting } = useFoodLogging();
  const [expanded, setExpanded] = useState(false);

  const mealTypeLabels: Record<string, string> = {
    breakfast: t('foodScanner.mealTypes.breakfast', 'Breakfast'),
    lunch: t('foodScanner.mealTypes.lunch', 'Lunch'),
    dinner: t('foodScanner.mealTypes.dinner', 'Dinner'),
    snack: t('foodScanner.mealTypes.snack', 'Snack'),
  };

  const mealTypeColors: Record<string, string> = {
    breakfast: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    lunch: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    dinner: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    snack: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  };

  if (confirmedMealsToday.length === 0) {
    return null;
  }

  const displayMeals = maxItems && !expanded 
    ? confirmedMealsToday.slice(0, maxItems) 
    : confirmedMealsToday;

  const handleDelete = async (mealId: string) => {
    await deleteMeal(mealId);
  };

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Apple className="h-5 w-5 text-primary" />
              {t('foodScanner.todaysMeals', "Today's Meals")}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{dailyTotals.calories} {t('foodScanner.caloriesShort', 'cal')}</span>
              <span>{Math.round(dailyTotals.protein)}g {t('foodScanner.proteinShort', 'protein')}</span>
            </div>
          </div>
        </CardHeader>
      )}
      
      <CardContent className={showHeader ? 'pt-0' : ''}>
        <div className="space-y-3">
          {displayMeals.map((meal) => (
            <MealItem 
              key={meal.id} 
              meal={meal} 
              mealTypeLabels={mealTypeLabels}
              mealTypeColors={mealTypeColors}
              onDelete={() => handleDelete(meal.id)}
              isDeleting={isDeleting}
            />
          ))}
        </div>

        {maxItems && confirmedMealsToday.length > maxItems && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full mt-3"
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                {t('common.showLess', 'Show Less')}
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                {t('foodScanner.showMore', 'Show {{count}} more', { count: confirmedMealsToday.length - maxItems })}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

interface MealItemProps {
  meal: MealPhoto;
  mealTypeLabels: Record<string, string>;
  mealTypeColors: Record<string, string>;
  onDelete: () => void;
  isDeleting: boolean;
}

const MealItem = ({ meal, mealTypeLabels, mealTypeColors, onDelete, isDeleting }: MealItemProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
      {/* Meal photo thumbnail or placeholder */}
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
        {meal.photo_url ? (
          <img 
            src={meal.photo_url} 
            alt={meal.meal_type}
            className="w-full h-full object-cover"
          />
        ) : (
          <Apple className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Meal details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge 
            variant="secondary" 
            className={`text-xs ${mealTypeColors[meal.meal_type]}`}
          >
            {mealTypeLabels[meal.meal_type]}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(meal.created_at), 'h:mm a')}
          </span>
        </div>

        <p className="text-sm font-medium truncate">
          {meal.food_items?.slice(0, 2).join(', ') || meal.meal_type}
        </p>

        <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
          <span>{meal.calories_estimated} cal</span>
          <span>{meal.protein_g}g protein</span>
          <span>{meal.carbs_g}g carbs</span>
        </div>
      </div>

      {/* Delete button */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('foodScanner.deleteConfirmTitle', 'Remove this meal?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('foodScanner.deleteConfirmDesc', 'This will remove the meal from your daily nutrition record. This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive hover:bg-destructive/90">
              {t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
