import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetabolicSymptomsStepProps {
  data: {
    metabolic_symptom_flags?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const metabolicSymptoms = [
  { value: 'fatigue', label: 'Persistent fatigue or low energy' },
  { value: 'cold-extremities', label: 'Cold hands/feet regularly' },
  { value: 'hair-thinning', label: 'Hair thinning or brittle nails' },
  { value: 'mood-shifts', label: 'Mood swings or irritability' },
  { value: 'weight-gain', label: 'Unexplained weight gain (especially abdominal)' },
  { value: 'brain-fog', label: 'Brain fog or difficulty concentrating' },
  { value: 'sleep-issues', label: 'Poor sleep quality or insomnia' },
  { value: 'low-libido', label: 'Low libido or sexual dysfunction' },
];

export function MetabolicSymptomsStep({ data, onChange }: MetabolicSymptomsStepProps) {
  const toggleSymptom = (symptom: string) => {
    const current = data.metabolic_symptom_flags || [];
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    onChange('metabolic_symptom_flags', updated);
  };

  const symptomCount = (data.metabolic_symptom_flags || []).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle>Metabolic Health Symptoms</CardTitle>
        </div>
        <CardDescription>
          These symptoms can indicate metabolic dysfunction, thyroid issues, or nutrient deficiencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-medium">Do you experience any of these regularly?</p>
        <p className="text-sm text-muted-foreground">Select all that apply (none is perfectly fine!)</p>
        
        <div className="space-y-2">
          {metabolicSymptoms.map((symptom) => {
            const isSelected = (data.metabolic_symptom_flags || []).includes(symptom.value);
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

        {symptomCount > 0 && (
          <div className={cn(
            "p-4 rounded-lg border-2",
            symptomCount >= 5 ? "border-red-500/50 bg-red-500/5" : 
            symptomCount >= 3 ? "border-yellow-500/50 bg-yellow-500/5" : 
            "border-blue-500/50 bg-blue-500/5"
          )}>
            <p className="text-sm font-medium">
              {symptomCount === 0 && "No symptoms selected"}
              {symptomCount >= 1 && symptomCount <= 2 && "Minimal symptoms—nutrition optimization can still help"}
              {symptomCount >= 3 && symptomCount <= 4 && "Moderate metabolic concerns—nutrition is a great starting point"}
              {symptomCount >= 5 && "Significant symptoms warrant nutrition optimization + medical evaluation"}
            </p>
          </div>
        )}

        <div className="mt-4 p-4 bg-muted/50 rounded-lg border text-sm text-muted-foreground">
          <p className="font-medium mb-1">Medical Disclaimer:</p>
          <p>
            These symptoms can have many causes. Our nutrition recommendations complement—but don't replace—medical care. If symptoms are severe or worsening, consult a healthcare provider.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
