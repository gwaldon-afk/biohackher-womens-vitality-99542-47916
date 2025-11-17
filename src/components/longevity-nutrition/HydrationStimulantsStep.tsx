import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Coffee, Wine } from "lucide-react";
import { cn } from "@/lib/utils";

interface HydrationStimulantsStepProps {
  data: {
    hydration_score?: number;
    caffeine_score?: number;
    alcohol_intake?: number;
  };
  onChange: (field: string, value: any) => void;
}

const hydrationLevels = [
  { value: 1, label: '<4 cups/day', description: 'Significantly under-hydrated' },
  { value: 2, label: '4-6 cups/day', description: 'Below optimal' },
  { value: 3, label: '6-8 cups/day', description: 'Adequate baseline' },
  { value: 4, label: '8-10 cups/day', description: 'Good hydration' },
  { value: 5, label: '10+ cups/day', description: 'Excellent hydration' },
];

const caffeineLevels = [
  { value: 0, label: 'None', description: 'No caffeine' },
  { value: 1, label: '1 coffee/day', description: 'Minimal caffeine' },
  { value: 2, label: '2-3 coffees/day', description: 'Moderate caffeine' },
  { value: 3, label: '4-5 coffees/day', description: 'High caffeine' },
  { value: 4, label: '6+ coffees/day', description: 'Very high—may impact sleep' },
];

const alcoholLevels = [
  { value: 0, label: 'None', description: 'No alcohol' },
  { value: 1, label: '1-3 drinks/week', description: 'Minimal intake' },
  { value: 2, label: '4-7 drinks/week', description: 'Moderate intake' },
  { value: 3, label: '8-14 drinks/week', description: 'High intake' },
  { value: 4, label: '15+ drinks/week', description: 'Very high—consider reducing' },
];

export function HydrationStimulantsStep({ data, onChange }: HydrationStimulantsStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="h-5 w-5 text-primary" />
          <CardTitle>Hydration & Stimulants</CardTitle>
        </div>
        <CardDescription>
          Water, caffeine, and alcohol significantly impact cellular health and longevity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-bold text-lg flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            How many cups of water do you drink daily?
          </p>
          {hydrationLevels.map((level) => {
            const isSelected = data.hydration_score === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange('hydration_score', level.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg flex items-center gap-2">
            <Coffee className="h-4 w-4" />
            How much caffeine do you consume daily?
          </p>
          {caffeineLevels.map((level) => {
            const isSelected = data.caffeine_score === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange('caffeine_score', level.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg flex items-center gap-2">
            <Wine className="h-4 w-4" />
            How much alcohol do you drink weekly?
          </p>
          {alcoholLevels.map((level) => {
            const isSelected = data.alcohol_intake === level.value;
            return (
              <button
                key={level.value}
                onClick={() => onChange('alcohol_intake', level.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{level.label}</h3>
                    <p className="text-sm text-muted-foreground">{level.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
