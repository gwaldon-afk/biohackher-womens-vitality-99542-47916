import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  Clock, 
  ShoppingCart, 
  Utensils, 
  ChevronRight,
  CheckCircle,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ScienceBackedIcon from '@/components/ScienceBackedIcon';

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    key: string;
    icon: string;
    title: string;
    color: string;
    items: any[];
    completedCount: number;
    totalCount: number;
  } | null;
  getItemCompleted: (actionId: string) => boolean;
  onToggle: (actionId: string) => void;
  onBuySupplements?: (action: any) => void;
  onViewMeal?: (action: any) => void;
  onViewExercise?: (action: any) => void;
  onRowClick?: (action: any) => void;
  isUsingSampleData?: boolean;
  user?: any;
}

const colorMap: Record<string, { bg: string; text: string; progress: string }> = {
  orange: { bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300', progress: '[&>div]:bg-orange-500' },
  green: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', progress: '[&>div]:bg-green-500' },
  pink: { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-700 dark:text-pink-300', progress: '[&>div]:bg-pink-500' },
  yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', progress: '[&>div]:bg-yellow-500' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', progress: '[&>div]:bg-blue-500' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-300', progress: '[&>div]:bg-purple-500' },
};

export const CategoryDrawer = ({
  isOpen,
  onClose,
  category,
  getItemCompleted,
  onToggle,
  onBuySupplements,
  onViewMeal,
  onViewExercise,
  onRowClick,
  isUsingSampleData,
  user,
}: CategoryDrawerProps) => {
  const { t } = useTranslation();

  if (!category) return null;

  const colors = colorMap[category.color] || colorMap.blue;
  const progressPercent = category.totalCount > 0
    ? Math.round((category.completedCount / category.totalCount) * 100)
    : 0;

  const handleRowClick = (e: React.MouseEvent, action: any) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('[role="checkbox"]') ||
      target.closest('input')
    ) {
      return;
    }
    if (onRowClick) {
      onRowClick(action);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className={cn("relative pb-4", colors.bg)}>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>

          <div className="flex items-center gap-3">
            <span className="text-3xl">{category.icon}</span>
            <div className="flex-1">
              <DrawerTitle className="text-xl font-bold text-foreground">
                {category.title}
              </DrawerTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-sm font-medium", colors.text)}>
                  {category.completedCount}/{category.totalCount} {t('today.categoryGrid.completed')}
                </span>
                {category.completedCount === category.totalCount && (
                  <CheckCircle className="w-4 h-4 text-primary" />
                )}
              </div>
            </div>
          </div>

          <Progress
            value={progressPercent}
            className={cn("h-2 mt-3", colors.progress)}
          />
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto">
          <div className="space-y-2 mt-2">
            {category.items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('today.categoryGrid.noItems')}
              </div>
            ) : (
              category.items.map((action: any) => {
                const isCompleted = getItemCompleted(action.id);
                const isSupplementCategory = action.category === 'supplement' || action.itemType === 'supplement';
                const isExercise = action.itemType === 'exercise' || action.category === 'exercise';
                const isMeal = action.type === 'meal';
                const isClickable = !!onRowClick && (isMeal || action.protocolItemId || action.goalId);

                return (
                  <div
                    key={action.id}
                    onClick={(e) => handleRowClick(e, action)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3 rounded-lg border transition-all",
                      isCompleted
                        ? "border-border bg-card/30 opacity-60"
                        : "border-border bg-card/50 hover:bg-card hover:border-primary/30",
                      isClickable && !isCompleted && "cursor-pointer hover:shadow-md"
                    )}
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                  >
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => onToggle(action.id)}
                      className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      disabled={isUsingSampleData && !user}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "font-medium",
                            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {action.title}
                          </p>
                          <ScienceBackedIcon className="w-3.5 h-3.5" showTooltip={true} />
                          {isMeal && action.mealData?.protein && (
                            <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                              🥚 {action.mealData.protein}g protein
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {action.pillar && (
                            <Badge variant="outline" className="text-xs capitalize bg-primary/5 text-primary border-primary/20">
                              {action.pillar}
                            </Badge>
                          )}
                          {isClickable && !isCompleted && (
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </div>
                      </div>
                      {action.description && (
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {t('today.timeBlocks.min', { minutes: action.estimatedMinutes })}
                        </div>
                        {isMeal && action.mealData && onViewMeal && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewMeal(action);
                            }}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Utensils className="w-3 h-3" />
                            {t('today.timeBlocks.viewRecipe')}
                          </Button>
                        )}
                        {isExercise && onViewExercise && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewExercise(action);
                            }}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Dumbbell className="w-3 h-3" />
                            {t('today.exerciseDetail.howTo')}
                          </Button>
                        )}
                        {isSupplementCategory && onBuySupplements && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBuySupplements(action);
                            }}
                            className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <ShoppingCart className="w-3 h-3" />
                            {t('today.timeBlocks.buy')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
