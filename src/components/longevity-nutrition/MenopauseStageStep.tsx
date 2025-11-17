import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenopauseStageStepProps {
  data: {
    menopause_stage?: string;
  };
  onChange: (field: string, value: any) => void;
}

const menopauseStages = [
  {
    value: 'cycling',
    label: 'Regular Cycles',
    description: 'Still menstruating with predictable cycles',
  },
  {
    value: 'perimenopause',
    label: 'Perimenopause',
    description: 'Irregular cycles, hot flashes, mood changes',
  },
  {
    value: 'menopause',
    label: 'Menopause',
    description: '12+ months without a period',
  },
  {
    value: 'post-menopause',
    label: 'Post-Menopause',
    description: 'Several years past final period',
  },
  {
    value: 'not-sure',
    label: 'Not Sure',
    description: 'Unsure of current stage',
  },
];

export function MenopauseStageStep({ data, onChange }: MenopauseStageStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" />
          <CardTitle>Hormone Life Stage</CardTitle>
        </div>
        <CardDescription>
          Your hormone stage affects nutritional needs for bone health, metabolism, and symptom management
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">Where are you in your hormone journey?</p>
        {menopauseStages.map((stage) => {
          const isSelected = data.menopause_stage === stage.value;
          return (
            <button
              key={stage.value}
              onClick={() => onChange('menopause_stage', stage.value)}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                isSelected ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{stage.label}</h3>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
                {isSelected && <div className="w-5 h-5 rounded-full bg-primary" />}
              </div>
            </button>
          );
        })}

        <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex gap-2">
            <HelpCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Why this matters for nutrition:</p>
              <p>
                Different life stages have unique nutritional needs. Perimenopause and menopause benefit from
                phytoestrogens, calcium-rich foods, and blood sugar stability. We'll tailor recommendations to
                your stage.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
