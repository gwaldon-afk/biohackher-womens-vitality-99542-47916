import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

interface CoreDetailsStepProps {
  data: {
    age?: number;
    height_cm?: number;
    weight_kg?: number;
  };
  onChange: (field: string, value: any) => void;
}

export function CoreDetailsStep({ data, onChange }: CoreDetailsStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <User className="h-5 w-5 text-primary" />
          <CardTitle>Let's Start with the Basics</CardTitle>
        </div>
        <CardDescription>
          These details help us personalize your longevity nutrition recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g., 42"
            value={data.age || ''}
            onChange={(e) => onChange('age', parseInt(e.target.value) || undefined)}
            min={18}
            max={100}
          />
          <p className="text-xs text-muted-foreground">
            Your age helps us contextualize nutrition needs across life stages
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="height">Height (cm)</Label>
            <Input
              id="height"
              type="number"
              placeholder="e.g., 165"
              value={data.height_cm || ''}
              onChange={(e) => onChange('height_cm', parseFloat(e.target.value) || undefined)}
              min={120}
              max={220}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 65"
              value={data.weight_kg || ''}
              onChange={(e) => onChange('weight_kg', parseFloat(e.target.value) || undefined)}
              min={30}
              max={200}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Height and weight help calculate protein targets and metabolic requirements for longevity
        </p>
      </CardContent>
    </Card>
  );
}
