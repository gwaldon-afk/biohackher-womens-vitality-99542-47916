import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Target } from 'lucide-react';
import { DailyNutritionAction } from '@/services/nutritionActionService';

interface Props {
  action: DailyNutritionAction;
  onComplete: () => void;
  completed?: boolean;
}

export function NutritionActionCard({ action, onComplete, completed }: Props) {
  return (
    <Card className={completed ? 'opacity-60 bg-muted/50' : ''}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{action.pillar}</Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {action.time_of_day}
              </Badge>
            </div>
            <h4 className="font-semibold mb-1">{action.title}</h4>
            <p className="text-sm text-muted-foreground">{action.description}</p>
            {action.target_value && (
              <div className="mt-2 flex items-center gap-1 text-sm font-medium text-primary">
                <Target className="h-4 w-4" />
                Target: {action.target_value}
              </div>
            )}
          </div>
          <Button 
            onClick={onComplete} 
            variant={completed ? "outline" : "default"}
            size="sm"
            className="shrink-0"
          >
            {completed ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Done
              </>
            ) : (
              'Complete'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
