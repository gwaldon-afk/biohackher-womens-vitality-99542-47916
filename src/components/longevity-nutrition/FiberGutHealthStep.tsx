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
  { 
    value: 1, 
    label: '🍞 I eat the same 5-7 foods most days', 
    description: 'Limited variety — your microbiome craves diversity',
    example: 'Chicken, rice, bread, pasta, same veggies'
  },
  { 
    value: 2, 
    label: '🥗 I mix it up but stick to familiar foods', 
    description: 'Moderate variety — room to expand',
    example: '10-15 different plants weekly'
  },
  { 
    value: 3, 
    label: '🌈 I actively seek variety each week', 
    description: 'Good diversity — microbiome thriving',
    example: '20-30 different plants weekly'
  },
  { 
    value: 4, 
    label: '🌿 I prioritize eating 30+ different plants weekly', 
    description: 'Excellent diversity — optimal microbiome support',
    example: 'Vegetables, fruits, nuts, seeds, herbs, whole grains'
  },
];

const fiberIntake = [
  { 
    value: 1, 
    label: '🍕 Mostly refined carbs & protein', 
    description: 'Fiber gap — gut health at risk',
    example: 'White bread, pasta, meat, minimal vegetables'
  },
  { 
    value: 2, 
    label: '🥙 Some vegetables, mostly cooked', 
    description: 'Below optimal — room for improvement',
    example: '1-2 servings of veggies per day'
  },
  { 
    value: 3, 
    label: '🥦 Vegetables with most meals', 
    description: 'Good foundation — nearing optimal',
    example: '3-4 servings daily, some raw foods'
  },
  { 
    value: 4, 
    label: '🥗 Plants dominate my meals', 
    description: 'Optimal fiber — excellent gut health support',
    example: '5+ servings daily, diverse colors & types'
  },
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
          <p className="font-bold text-lg">How varied is your weekly diet?</p>
          <p className="text-sm text-muted-foreground">
            Think about the variety of plants you eat — vegetables, fruits, legumes, nuts, seeds, herbs, whole grains
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{option.label}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{option.description}</p>
                    <p className="text-xs text-muted-foreground/80 italic">e.g., {option.example}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">What best describes your typical plate?</p>
          <p className="text-sm text-muted-foreground">
            How do fiber-rich foods show up in your meals?
          </p>
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
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">{option.label}</h3>
                    <p className="text-sm text-muted-foreground mb-1">{option.description}</p>
                    <p className="text-xs text-muted-foreground/80 italic">e.g., {option.example}</p>
                  </div>
                  {isSelected && <div className="w-5 h-5 rounded-full bg-primary flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="font-bold text-lg">Do you experience any gut symptoms?</p>
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
