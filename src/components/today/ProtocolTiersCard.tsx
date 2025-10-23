import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trophy, Zap, Target, Star } from "lucide-react";
import { DailyAction } from "@/hooks/useDailyPlan";

interface ProtocolTiersCardProps {
  quickWins: DailyAction[];
  energyBoosters: DailyAction[];
  deepPractices: DailyAction[];
  onToggle: (actionId: string) => void;
}

const tierConfig = {
  quick_win: {
    title: "Bronze Tier - Quick Wins",
    icon: Trophy,
    color: "text-amber-600",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    description: "Easy, high-impact actions (2-5 min each)"
  },
  energy_booster: {
    title: "Silver Tier - Energy Boosters",
    icon: Zap,
    color: "text-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-950/30",
    description: "Build momentum and vitality (10-15 min each)"
  },
  deep_practice: {
    title: "Gold Tier - Deep Practice",
    icon: Target,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
    description: "Your core transformational work (20-30 min each)"
  }
};

export const ProtocolTiersCard = ({ 
  quickWins, 
  energyBoosters, 
  deepPractices, 
  onToggle 
}: ProtocolTiersCardProps) => {
  const tiers = [
    { key: 'quick_win', actions: quickWins },
    { key: 'energy_booster', actions: energyBoosters },
    { key: 'deep_practice', actions: deepPractices }
  ];

  const activeTiers = tiers.filter(tier => tier.actions.length > 0);

  if (activeTiers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Your Protocol Tiers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Progress from Bronze to Gold - build your daily momentum
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeTiers.map(({ key, actions }) => {
          const config = tierConfig[key as keyof typeof tierConfig];
          const Icon = config.icon;
          const completed = actions.filter(a => a.completed).length;
          const total = actions.length;
          const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

          return (
            <div key={key} className={`rounded-lg p-4 ${config.bgColor} border`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <h3 className="font-semibold">{config.title}</h3>
                </div>
                <Badge variant="secondary">
                  {completed}/{total} complete
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {config.description}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-secondary rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    key === 'quick_win' ? 'bg-amber-500' :
                    key === 'energy_booster' ? 'bg-slate-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              {/* Actions List */}
              <div className="space-y-2">
                {actions.map(action => (
                  <div 
                    key={action.id} 
                    className="flex items-start gap-3 p-2 rounded hover:bg-background/50 transition-colors"
                  >
                    <Checkbox
                      checked={action.completed}
                      onCheckedChange={() => onToggle(action.id)}
                    />
                    <div className="flex-1">
                      <p className={
                        action.completed 
                          ? "line-through text-muted-foreground text-sm" 
                          : "text-sm font-medium"
                      }>
                        {action.icon} {action.title}
                      </p>
                      {action.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          ~{action.estimatedMinutes} min
                        </span>
                        {action.timeOfDay && action.timeOfDay.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {action.timeOfDay[0]}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
