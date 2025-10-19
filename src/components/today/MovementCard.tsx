import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Clock } from "lucide-react";
import { DailyAction } from "@/hooks/useDailyPlan";

interface MovementCardProps {
  movements: DailyAction[];
  onToggle: (actionId: string) => void;
}

export const MovementCard = ({ movements, onToggle }: MovementCardProps) => {
  if (movements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Movement & Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No activities scheduled for today</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5" />
          Movement & Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {movements.map(movement => (
          <div key={movement.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              checked={movement.completed}
              onCheckedChange={() => onToggle(movement.id)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className={movement.completed ? "line-through text-muted-foreground" : ""}>
                  {movement.title}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {movement.estimatedMinutes} min
                </span>
              </div>
              {movement.description && (
                <p className="text-xs text-muted-foreground">{movement.description}</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
