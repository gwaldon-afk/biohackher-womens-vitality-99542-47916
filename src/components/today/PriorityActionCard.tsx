import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Clock, Target } from 'lucide-react';
import { DailyAction } from '@/hooks/useDailyPlan';

interface PriorityActionCardProps {
  action: DailyAction;
  onToggle: (actionId: string) => void;
  rank?: number;
}

export const PriorityActionCard = ({ action, onToggle, rank }: PriorityActionCardProps) => {
  const getCategoryColor = (category: DailyAction['category']) => {
    const colors = {
      quick_win: 'bg-green-500/10 text-green-700 border-green-200',
      energy_booster: 'bg-orange-500/10 text-orange-700 border-orange-200',
      deep_practice: 'bg-purple-500/10 text-purple-700 border-purple-200',
      optional: 'bg-gray-500/10 text-gray-700 border-gray-200'
    };
    return colors[category];
  };

  const getCategoryLabel = (category: DailyAction['category']) => {
    const labels = {
      quick_win: 'Quick Win',
      energy_booster: 'Energy Booster',
      deep_practice: 'Deep Practice',
      optional: 'Optional'
    };
    return labels[category];
  };

  return (
    <Card 
      className={`p-4 transition-all hover:shadow-md ${
        action.completed ? 'opacity-60 bg-muted/50' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={action.completed}
          onCheckedChange={() => onToggle(action.id)}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            {rank && (
              <Badge variant="outline" className="shrink-0">
                #{rank}
              </Badge>
            )}
            <span className="text-xl">{action.icon}</span>
            <h3 className={`font-semibold ${action.completed ? 'line-through' : ''}`}>
              {action.title}
            </h3>
          </div>

          {action.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {action.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={getCategoryColor(action.category)}>
              {getCategoryLabel(action.category)}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{action.estimatedMinutes} min</span>
            </div>

            {action.whyItMatters && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <Target className="w-3 h-3" />
                <span>{action.whyItMatters}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
