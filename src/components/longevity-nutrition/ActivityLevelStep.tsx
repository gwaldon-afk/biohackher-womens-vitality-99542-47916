import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Sofa, Footprints, Zap, Dumbbell, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityLevelStepProps {
  data: {
    activity_level?: string;
  };
  onChange: (field: string, value: any) => void;
}

const activityLevels = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    icon: Sofa,
    description: 'Desk job, minimal activity',
    examples: 'Little to no exercise, mostly sitting',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    icon: Footprints,
    description: 'Light exercise 1-3 days/week',
    examples: 'Walking, gentle yoga, light housework',
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    icon: Activity,
    description: 'Moderate exercise 3-5 days/week',
    examples: 'Regular workouts, active lifestyle',
  },
  {
    value: 'active',
    label: 'Very Active',
    icon: Zap,
    description: 'Intense exercise 6-7 days/week',
    examples: 'Daily training, physically demanding job',
  },
  {
    value: 'athletic',
    label: 'Athlete',
    icon: Trophy,
    description: 'Multiple daily training sessions',
    examples: 'Competitive athlete, intense daily training',
  },
];

export function ActivityLevelStep({ data, onChange }: ActivityLevelStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="h-5 w-5 text-primary" />
          <CardTitle>What's Your Activity Level?</CardTitle>
        </div>
        <CardDescription>
          This helps us calculate your protein and calorie needs for optimal longevity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activityLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = data.activity_level === level.value;
          return (
            <button
              key={level.value}
              onClick={() => onChange('activity_level', level.value)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{level.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{level.description}</p>
                  <p className="text-xs text-muted-foreground italic">{level.examples}</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
