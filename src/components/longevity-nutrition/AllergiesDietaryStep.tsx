import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface AllergiesDietaryStepProps {
  data: {
    allergies?: string[];
    values_dietary?: string[];
  };
  onChange: (field: string, value: any) => void;
}

const commonAllergies = [
  { value: 'dairy', label: 'Dairy' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'nuts', label: 'Tree nuts/peanuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'eggs', label: 'Eggs' },
];

const dietaryValues = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

export function AllergiesDietaryStep({ data, onChange }: AllergiesDietaryStepProps) {
  const toggleAllergy = (allergy: string) => {
    const current = data.allergies || [];
    const updated = current.includes(allergy)
      ? current.filter((a) => a !== allergy)
      : [...current, allergy];
    onChange('allergies', updated);
  };

  const toggleDietaryValue = (value: string) => {
    const current = data.values_dietary || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange('values_dietary', updated);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          <CardTitle>Allergies & Dietary Preferences</CardTitle>
        </div>
        <CardDescription>
          We'll exclude these from your recommendations and respect your dietary choices
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="font-medium">Do you have any food allergies or intolerances?</p>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          <div className="grid md:grid-cols-2 gap-2">
            {commonAllergies.map((allergy) => {
              const isSelected = (data.allergies || []).includes(allergy.value);
              return (
                <button
                  key={allergy.value}
                  onClick={() => toggleAllergy(allergy.value)}
                  className={cn(
                    "text-left p-3 rounded-lg border-2 transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span>{allergy.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-medium flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Do you follow any dietary frameworks?
          </p>
          <p className="text-sm text-muted-foreground">Select all that apply</p>
          <div className="grid md:grid-cols-2 gap-2">
            {dietaryValues.map((value) => {
              const isSelected = (data.values_dietary || []).includes(value.value);
              return (
                <button
                  key={value.value}
                  onClick={() => toggleDietaryValue(value.value)}
                  className={cn(
                    "text-left p-3 rounded-lg border-2 transition-all hover:border-primary/50 flex items-center gap-3",
                    isSelected ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  <span>{value.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
