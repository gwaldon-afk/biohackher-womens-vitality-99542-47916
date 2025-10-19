import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Target, Timer, ChevronRight, X } from 'lucide-react';
import { DailyAction } from '@/hooks/useDailyPlan';
import { ActionTimer } from './ActionTimer';

interface SwipeableActionCardProps {
  action: DailyAction;
  onToggle: (actionId: string) => void;
  onSkip: (actionId: string) => void;
  rank?: number;
}

export const SwipeableActionCard = ({ action, onToggle, onSkip, rank }: SwipeableActionCardProps) => {
  const [showTimer, setShowTimer] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientX - startX.current;
    setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (offsetX > 100) {
      // Swiped right - complete
      onToggle(action.id);
    } else if (offsetX < -100) {
      // Swiped left - skip
      onSkip(action.id);
    }
    
    setOffsetX(0);
  };

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

  const backgroundColor = offsetX > 50 ? 'bg-green-500/10' : offsetX < -50 ? 'bg-red-500/10' : '';

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Background actions */}
        {offsetX > 50 && (
          <div className="absolute inset-0 bg-green-500 flex items-center justify-start pl-6 rounded-lg">
            <span className="text-white font-bold">Complete ✓</span>
          </div>
        )}
        {offsetX < -50 && (
          <div className="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 rounded-lg">
            <span className="text-white font-bold">Skip →</span>
          </div>
        )}

        <Card 
          className={`p-4 transition-all hover:shadow-md ${
            action.completed ? 'opacity-60 bg-muted/50' : 'hover:border-primary/50'
          } ${backgroundColor}`}
          style={{ 
            transform: `translateX(${offsetX}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
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

              {/* Action buttons */}
              {!action.completed && action.category === 'deep_practice' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3"
                  onClick={() => setShowTimer(true)}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  Start Timer
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {showTimer && (
        <ActionTimer
          open={showTimer}
          onClose={() => setShowTimer(false)}
          actionName={action.title}
          durationMinutes={action.estimatedMinutes}
          onComplete={() => {
            setShowTimer(false);
            onToggle(action.id);
          }}
        />
      )}
    </>
  );
};
