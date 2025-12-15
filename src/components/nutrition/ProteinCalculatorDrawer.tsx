import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Calculator } from 'lucide-react';
import NutritionCalculator from '@/components/nutrition/NutritionCalculator';
import { useHealthProfile } from '@/hooks/useHealthProfile';

interface ProteinCalculatorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProteinCalculatorDrawer({ 
  open, 
  onOpenChange 
}: ProteinCalculatorDrawerProps) {
  const { profile, loading: profileLoading } = useHealthProfile();

  // Local state for calculator inputs
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintenance');

  // Pre-populate from health profile (guaranteed to exist for authenticated users via RequireHealthProfile)
  useEffect(() => {
    if (profileLoading) return;

    if (profile?.weight_kg) {
      setWeight(profile.weight_kg.toString());
    }
    
    if (profile?.activity_level) {
      setActivityLevel(profile.activity_level);
    }
  }, [profile, profileLoading]);

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
            weight={weight}
            setWeight={setWeight}
            activityLevel={activityLevel}
            setActivityLevel={setActivityLevel}
            goal={goal}
            setGoal={setGoal}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
