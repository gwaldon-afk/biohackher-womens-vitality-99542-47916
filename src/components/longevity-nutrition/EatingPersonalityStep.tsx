import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Clock, TrendingDown, Moon, Calendar, CandyOff, Flame, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface EatingPersonalityStepProps {
  data: {
    nutrition_identity_type?: string;
  };
  onChange: (field: string, value: any) => void;
}

const personalities = [
  {
    value: 'grazer',
    label: 'The Grazer',
    icon: Clock,
    description: 'I prefer eating small amounts throughout the day',
  },
  {
    value: 'emotional-eater',
    label: 'The Emotional Eater',
    icon: Heart,
    description: 'I eat for comfort, stress relief, or emotional reasons',
  },
  {
    value: 'under-eater',
    label: 'The Under-Eater',
    icon: TrendingDown,
    description: 'I often skip meals or eat less than I should',
  },
  {
    value: 'late-night-snacker',
    label: 'The Late-Night Snacker',
    icon: Moon,
    description: 'I eat late at night, even after dinner',
  },
  {
    value: 'over-scheduled-skipper',
    label: 'The Over-Scheduled Skipper',
    icon: Calendar,
    description: 'My busy schedule leads to inconsistent eating',
  },
  {
    value: 'sugar-rollercoaster',
    label: 'The Sugar Rollercoaster',
    icon: CandyOff,
    description: 'I experience intense cravings and energy crashes',
  },
  {
    value: 'high-protein-performer',
    label: 'The High-Protein Performer',
    icon: Flame,
    description: 'I prioritize protein and performance nutrition',
  },
  {
    value: 'gut-healer',
    label: 'The Gut Healer',
    icon: Leaf,
    description: 'I\'m actively working to improve digestive health',
  },
];

export function EatingPersonalityStep({ data, onChange }: EatingPersonalityStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle>What's Your Eating Personality?</CardTitle>
        </div>
        <CardDescription>
          Understanding your patterns helps us create strategies that work with your lifestyle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {personalities.map((personality) => {
          const Icon = personality.icon;
          const isSelected = data.nutrition_identity_type === personality.value;
          return (
            <button
              key={personality.value}
              onClick={() => onChange('nutrition_identity_type', personality.value)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary/20" : "bg-muted"
                )}>
                  <Icon className={cn("h-6 w-6", isSelected ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{personality.label}</h3>
                  <p className="text-sm text-muted-foreground">{personality.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
