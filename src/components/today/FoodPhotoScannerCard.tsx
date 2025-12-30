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

  // If no meals logged, show compact prompt - FAB handles main CTA
  if (dailyTotals.mealCount === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-sm">
                {t('mealSnap.noMealsYet', 'No meals logged yet')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('mealSnap.tapToScan', 'Tap the camera button to scan your first meal')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show summary-only when meals are logged
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Today's Summary Header */}
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-primary/20 rounded-lg">
                <Utensils className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">
                {t('mealSnap.todaysMeals', "Today's Meals")}
              </h3>
            </div>
            
            {/* Quick Stats Row */}
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">{t('foodScanner.meals', 'Meals')}: </span>
                <span className="font-medium">{dailyTotals.mealCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('foodScanner.protein', 'Protein')}: </span>
                <span className="font-medium">{Math.round(dailyTotals.protein)}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">{t('foodScanner.calories', 'Calories')}: </span>
                <span className="font-medium">{dailyTotals.calories}</span>
              </div>
            </div>
          </div>
        </div>
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
