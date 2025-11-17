import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface InflammationStepProps {
  data: {
    inflammation_score?: number;
    inflammation_symptoms?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const inflammationSymptoms = [
  { value: 'morning-stiffness', label: 'Morning stiffness or joint pain' },
  { value: 'puffy-face', label: 'Puffy face or water retention' },
  { value: 'joint-pain', label: 'Joint pain or swelling' },
  { value: 'skin-breakouts', label: 'Frequent skin breakouts or redness' },
  { value: 'energy-crashes', label: 'Energy crashes after meals' },
  { value: 'brain-fog', label: 'Brain fog or poor concentration' },
];

export function InflammationStep({ data, onChange }: InflammationStepProps) {
  const toggleSymptom = (symptom: string) => {
    const current = data.inflammation_symptoms || [];
    const updated = current.includes(symptom)
      ? current.filter((s) => s !== symptom)
      : [...current, symptom];
    onChange('inflammation_symptoms', updated);
    onChange('inflammation_score', updated.length);
  };

  const symptomCount = (data.inflammation_symptoms || []).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-5 w-5 text-primary" />
          <CardTitle>Inflammation Markers</CardTitle>
        </div>
        <CardDescription>
          Chronic inflammation accelerates aging. These symptoms may indicate inflammatory patterns.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-bold text-lg">Do you experience any of these symptoms regularly?</p>
        <p className="text-sm text-muted-foreground">Select all that apply</p>
        
        <div className="space-y-2">
          {inflammationSymptoms.map((symptom) => {
            const isSelected = (data.inflammation_symptoms || []).includes(symptom.value);
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
            symptomCount >= 4 ? "border-red-500/50 bg-red-500/5" : symptomCount >= 2 ? "border-yellow-500/50 bg-yellow-500/5" : "border-blue-500/50 bg-blue-500/5"
          )}>
            <p className="text-sm font-medium">
              {symptomCount === 0 && "No symptoms selected"}
              {symptomCount === 1 && "Minimal inflammation markers"}
              {symptomCount >= 2 && symptomCount <= 3 && "Moderate inflammation - worth addressing"}
              {symptomCount >= 4 && "Significant inflammation - anti-inflammatory nutrition is a priority"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
