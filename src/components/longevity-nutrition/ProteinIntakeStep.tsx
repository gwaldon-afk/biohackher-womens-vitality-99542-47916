import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProteinIntakeStepProps {
  data: {
    protein_score?: number;
    protein_sources?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const proteinServings = [
  { value: 0, label: '0-1 servings', description: 'Minimal protein intake' },
  { value: 1, label: '1-2 servings', description: 'Below optimal for longevity' },
  { value: 2, label: '2-3 servings', description: 'Adequate baseline' },
  { value: 3, label: '3-4 servings', description: 'Optimal for muscle maintenance' },
  { value: 4, label: '4+ servings', description: 'Excellent for longevity' },
];

const proteinSources = [
  { value: 'animal', label: 'Animal protein (meat, fish, eggs, dairy)' },
  { value: 'plant', label: 'Plant protein (legumes, tofu, tempeh, seitan)' },
  { value: 'both', label: 'Both animal and plant' },
  { value: 'shakes', label: 'Protein shakes/powders' },
];

export function ProteinIntakeStep({ data, onChange }: ProteinIntakeStepProps) {
  const toggleSource = (source: string) => {
    const current = data.protein_sources || [];
    const updated = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source];
    onChange('protein_sources', updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Beef className="h-5 w-5 text-primary" />
          <CardTitle>Protein Intake</CardTitle>
        </div>
        <CardDescription>
          Protein is critical for muscle maintenance, metabolic health, and longevity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-bold text-lg">How many palm-sized protein servings do you eat daily?</p>
          <p className="text-sm text-muted-foreground">
            (1 serving = palm-sized portion: 100g meat, 2 eggs, 200g Greek yogurt, or 1.5 cups legumes)
          </p>
          {proteinServings.map((serving) => {
            const isSelected = data.protein_score === serving.value;
            return (
              <button
                key={serving.value}
                onClick={() => onChange('protein_score', serving.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{serving.label}</h3>
                    <p className="text-sm text-muted-foreground">{serving.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">What are your primary protein sources?</p>
          <div className="space-y-2">
            {proteinSources.map((source) => {
              const isSelected = (data.protein_sources || []).includes(source.value);
              return (
                <button
                  key={source.value}
                  onClick={() => toggleSource(source.value)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span>{source.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
