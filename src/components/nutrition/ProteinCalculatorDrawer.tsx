import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Calculator } from 'lucide-react';
import NutritionCalculator from '@/components/nutrition/NutritionCalculator';
import { NutritionPreferences } from '@/hooks/useNutritionPreferences';

interface ProteinCalculatorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
}

export function ProteinCalculatorDrawer({ 
  open, 
  onOpenChange, 
  preferences, 
  setPreferences 
}: ProteinCalculatorDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Protein & Macro Calculator
          </SheetTitle>
          <SheetDescription>
            Calculate your personalized protein and macronutrient targets
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <NutritionCalculator
            weight={preferences.weight}
            setWeight={(value) => setPreferences({ ...preferences, weight: value })}
            activityLevel={preferences.activityLevel}
            setActivityLevel={(value) => setPreferences({ ...preferences, activityLevel: value })}
            goal={preferences.goal}
            setGoal={(value) => setPreferences({ ...preferences, goal: value })}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
