import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle } from 'lucide-react';

export interface CategoryCardData {
  key: string;
  icon: string;
  title: string;
  items: any[];
  completedCount: number;
  totalCount: number;
  totalMinutes: number;
  color: string;
  isCurrentPeriod?: boolean;
}

interface CategoryCardGridProps {
  categories: CategoryCardData[];
  onCardClick: (categoryKey: string) => void;
}

const colorMap: Record<string, { bg: string; border: string; text: string; progress: string }> = {
  orange: { 
    bg: 'bg-orange-50 dark:bg-orange-950/30', 
    border: 'border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600', 
    text: 'text-orange-700 dark:text-orange-300',
    progress: '[&>div]:bg-orange-500'
  },
  green: { 
    bg: 'bg-green-50 dark:bg-green-950/30', 
    border: 'border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600', 
    text: 'text-green-700 dark:text-green-300',
    progress: '[&>div]:bg-green-500'
  },
  pink: { 
    bg: 'bg-pink-50 dark:bg-pink-950/30', 
    border: 'border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600', 
    text: 'text-pink-700 dark:text-pink-300',
    progress: '[&>div]:bg-pink-500'
  },
  yellow: { 
    bg: 'bg-yellow-50 dark:bg-yellow-950/30', 
    border: 'border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600', 
    text: 'text-yellow-700 dark:text-yellow-300',
    progress: '[&>div]:bg-yellow-500'
  },
  blue: { 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    border: 'border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600', 
    text: 'text-blue-700 dark:text-blue-300',
    progress: '[&>div]:bg-blue-500'
  },
  purple: { 
    bg: 'bg-purple-50 dark:bg-purple-950/30', 
    border: 'border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600', 
    text: 'text-purple-700 dark:text-purple-300',
    progress: '[&>div]:bg-purple-500'
  },
};

export const CategoryCardGrid = ({ categories, onCardClick }: CategoryCardGridProps) => {
  const { t } = useTranslation();

  // Filter out categories with no items
  const visibleCategories = categories.filter(cat => cat.totalCount > 0);

  if (visibleCategories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t('today.categoryGrid.noCategories')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {visibleCategories.map((category) => {
        const colors = colorMap[category.color] || colorMap.blue;
        const isComplete = category.completedCount === category.totalCount;
        const progressPercent = category.totalCount > 0 
          ? Math.round((category.completedCount / category.totalCount) * 100) 
          : 0;
        const remaining = category.totalCount - category.completedCount;

        return (
          <button
            key={category.key}
            onClick={() => onCardClick(category.key)}
            className={cn(
              "relative flex flex-col p-4 rounded-xl border-2 transition-all duration-200",
              "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
              "text-left cursor-pointer",
              colors.bg,
              colors.border,
              isComplete && "ring-2 ring-primary/30"
            )}
          >
            {/* Icon & Title with Now badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{category.icon}</span>
              {category.isCurrentPeriod && !isComplete && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded animate-pulse">
                  {t('today.categoryGrid.now')}
                </span>
              )}
              {isComplete && (
                <CheckCircle className="w-4 h-4 text-primary ml-auto" />
              )}
            </div>

            <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">
              {category.title}
            </h3>

            {/* Progress bar */}
            <Progress 
              value={progressPercent} 
              className={cn("h-1.5 mb-2", colors.progress)}
            />

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className={cn(
                "font-medium",
                isComplete ? "text-primary" : colors.text
              )}>
                {isComplete 
                  ? t('today.categoryGrid.allComplete')
                  : t('today.categoryGrid.itemsRemaining', { count: remaining })
                }
              </span>
            </div>

            {/* Time estimate */}
            {category.totalMinutes > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                {t('today.categoryGrid.minutes', { count: category.totalMinutes })}
              </div>
            )}

            {/* Tap hint */}
            <span className="text-[10px] text-muted-foreground mt-2 opacity-60">
              {t('today.categoryGrid.tapToView')}
            </span>
          </button>
        );
      })}
    </div>
  );
};
