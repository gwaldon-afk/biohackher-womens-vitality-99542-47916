import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ItemStatus } from '@/types/checklist';

export type FilterType = 'all' | ItemStatus;

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<ItemStatus, number>;
}

export const FilterBar = ({ activeFilter, onFilterChange, counts }: FilterBarProps) => {
  const { t } = useTranslation();

  const filters: { id: FilterType; label: string; color?: string }[] = [
    { id: 'all', label: t('devChecklist.filterAll') },
    { id: 'untested', label: t('devChecklist.filterUntested'), color: 'bg-muted' },
    { id: 'pass', label: t('devChecklist.filterPassed'), color: 'bg-green-500/20 text-green-700' },
    { id: 'review', label: t('devChecklist.filterReview'), color: 'bg-amber-500/20 text-amber-700' },
    { id: 'fail', label: t('devChecklist.filterFailed'), color: 'bg-red-500/20 text-red-700' },
  ];

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
      {filters.map((filter) => {
        const count = filter.id === 'all' ? totalCount : counts[filter.id as ItemStatus];
        const isActive = activeFilter === filter.id;

        return (
          <Button
            key={filter.id}
            variant={isActive ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className="gap-2"
          >
            {filter.label}
            <Badge
              variant="secondary"
              className={`text-xs ${!isActive && filter.color ? filter.color : ''}`}
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};
