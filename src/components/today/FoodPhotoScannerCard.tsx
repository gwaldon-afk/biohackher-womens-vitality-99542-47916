import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Utensils, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFoodLogging } from '@/hooks/useFoodLogging';
import { useAuth } from '@/hooks/useAuth';

export const FoodPhotoScannerCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dailyTotals, confirmedMealsToday, isLoadingMeals } = useFoodLogging();

  if (!user) return null;

  const mealTypeLabels: Record<string, string> = {
    breakfast: t('foodScanner.mealType.breakfast'),
    lunch: t('foodScanner.mealType.lunch'),
    dinner: t('foodScanner.mealType.dinner'),
    snack: t('foodScanner.mealType.snack'),
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">
                {t('foodScanner.title', 'Log Your Meal')}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground">
              {t('foodScanner.description', 'Snap a photo and AI will analyse your meal\'s nutrition')}
            </p>

            <Button 
              onClick={() => navigate('/nutrition-scan')}
              className="w-full sm:w-auto"
              size="lg"
            >
              <Camera className="mr-2 h-4 w-4" />
              {t('foodScanner.scanMeal', 'Scan Meal')}
            </Button>
          </div>

          {/* Today's Summary */}
          {dailyTotals.mealCount > 0 && (
            <div className="hidden sm:block bg-background/50 rounded-lg p-3 min-w-[140px]">
              <div className="flex items-center gap-1.5 mb-2">
                <Utensils className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {t('foodScanner.todaySoFar', 'Today')}
                </span>
              </div>
              
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('foodScanner.meals', 'Meals')}</span>
                  <span className="font-medium">{dailyTotals.mealCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('foodScanner.protein', 'Protein')}</span>
                  <span className="font-medium">{Math.round(dailyTotals.protein)}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('foodScanner.calories', 'Calories')}</span>
                  <span className="font-medium">{dailyTotals.calories}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile: Show logged meals summary */}
        {dailyTotals.mealCount > 0 && (
          <div className="sm:hidden mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">
                  {t('foodScanner.mealsLogged', '{{count}} meals logged', { count: dailyTotals.mealCount })}
                </span>
              </div>
              <div className="flex gap-3 text-xs">
                <span><strong>{Math.round(dailyTotals.protein)}g</strong> {t('foodScanner.proteinShort', 'protein')}</span>
                <span><strong>{dailyTotals.calories}</strong> {t('foodScanner.caloriesShort', 'cal')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent meals chips */}
        {confirmedMealsToday.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {confirmedMealsToday.slice(0, 4).map((meal) => (
              <div 
                key={meal.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background/80 rounded-full text-xs"
              >
                <span className="text-muted-foreground">
                  {mealTypeLabels[meal.meal_type]}:
                </span>
                <span className="font-medium truncate max-w-[100px]">
                  {meal.food_items?.[0] || meal.meal_type}
                </span>
              </div>
            ))}
            {confirmedMealsToday.length > 4 && (
              <div className="inline-flex items-center px-2.5 py-1 bg-background/80 rounded-full text-xs text-muted-foreground">
                +{confirmedMealsToday.length - 4} {t('foodScanner.more', 'more')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
