import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Clock, Layers, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewByFilter = 'time' | 'type' | 'status';
export type StatusFilter = 'all' | 'todo' | 'done';

interface DailyPlanFiltersProps {
  viewBy: ViewByFilter;
  statusFilter: StatusFilter;
  onViewByChange: (value: ViewByFilter) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
}

export const DailyPlanFilters = ({
  viewBy,
  statusFilter,
  onViewByChange,
  onStatusFilterChange,
}: DailyPlanFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      {/* View By Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t('today.filters.viewBy')}:</span>
        <ToggleGroup
          type="single"
          value={viewBy}
          onValueChange={(value) => value && onViewByChange(value as ViewByFilter)}
          className="bg-muted/50 rounded-lg p-0.5"
        >
          <ToggleGroupItem
            value="time"
            aria-label={t('today.filters.time')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto gap-1.5",
              "rounded-md"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            {t('today.filters.time')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="type"
            aria-label={t('today.filters.type')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto gap-1.5",
              "rounded-md"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            {t('today.filters.type')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="status"
            aria-label={t('today.filters.status')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto gap-1.5",
              "rounded-md"
            )}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            {t('today.filters.status')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Status Filter Toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t('today.filters.show')}:</span>
        <ToggleGroup
          type="single"
          value={statusFilter}
          onValueChange={(value) => value && onStatusFilterChange(value as StatusFilter)}
          className="bg-muted/50 rounded-lg p-0.5"
        >
          <ToggleGroupItem
            value="all"
            aria-label={t('today.filters.all')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto",
              "rounded-md"
            )}
          >
            {t('today.filters.all')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="todo"
            aria-label={t('today.filters.toDo')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto",
              "rounded-md"
            )}
          >
            {t('today.filters.toDo')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="done"
            aria-label={t('today.filters.done')}
            className={cn(
              "data-[state=on]:bg-background data-[state=on]:shadow-sm text-xs px-3 py-1.5 h-auto",
              "rounded-md"
            )}
          >
            {t('today.filters.done')}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
