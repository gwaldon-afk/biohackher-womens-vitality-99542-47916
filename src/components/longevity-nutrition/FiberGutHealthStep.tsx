import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FiberGutHealthStepProps {
  data: {
    plant_diversity_score?: number;
    fiber_score?: number;
    gut_symptom_score?: number;
    gut_symptoms?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const plantDiversity = [
  { value: 1, label: '<10 different plants/week', description: 'Limited microbiome diversity' },
  { value: 2, label: '10-20 different plants/week', description: 'Moderate diversity' },
  { value: 3, label: '20-30 different plants/week', description: 'Good diversity' },
  { value: 4, label: '30+ different plants/week', description: 'Excellent microbiome support' },
];

const fiberIntake = [
  { value: 1, label: '<10g fiber/day', description: 'Well below target' },
  { value: 2, label: '10-20g fiber/day', description: 'Below optimal' },
  { value: 3, label: '20-30g fiber/day', description: 'Good baseline' },
  { value: 4, label: '30g+ fiber/day', description: 'Optimal for gut and longevity' },
];

const gutSymptoms = [
  { value: 'bloating', label: 'Bloating' },
  { value: 'constipation', label: 'Constipation' },
  { value: 'loose-stools', label: 'Loose stools/diarrhea' },
  { value: 'abdominal-pain', label: 'Abdominal pain/cramping' },
];

export function FiberGutHealthStep({ data, onChange }: FiberGutHealthStepProps) {
  const toggleSymptom = (symptom: string) => {
    const current = data.gut_symptoms || [];
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    onChange('gut_symptoms', updated);
    onChange('gut_symptom_score', updated.length);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-5 w-5 text-primary" />
          <CardTitle>Fiber & Gut Health</CardTitle>
        </div>
        <CardDescription>
          Plant diversity and fiber are foundational for microbiome health and longevity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-medium">How many different plant foods do you eat weekly?</p>
          <p className="text-sm text-muted-foreground">
            Count all: vegetables, fruits, legumes, nuts, seeds, herbs, whole grains
          </p>
          {plantDiversity.map((option) => {
            const isSelected = data.plant_diversity_score === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange('plant_diversity_score', option.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-medium">What's your daily fiber intake?</p>
          {fiberIntake.map((option) => {
            const isSelected = data.fiber_score === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onChange('fiber_score', option.value)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{option.label}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-medium">Do you experience any gut symptoms?</p>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          <div className="space-y-2">
            {gutSymptoms.map((symptom) => {
              const isSelected = (data.gut_symptoms || []).includes(symptom.value);
              return (
                <button
                  key={symptom.value}
                  onClick={() => toggleSymptom(symptom.value)}
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
                  <span>{symptom.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
