import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Calculator } from 'lucide-react';
import NutritionCalculator from '@/components/nutrition/NutritionCalculator';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useSessionMetrics } from '@/hooks/useSessionMetrics';
import { useAuth } from '@/hooks/useAuth';

interface ProteinCalculatorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProteinCalculatorDrawer({ 
  open, 
  onOpenChange 
}: ProteinCalculatorDrawerProps) {
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useHealthProfile();
  const { metrics } = useSessionMetrics();

  // Local state for calculator inputs
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintenance');

  // Pre-populate from health profile (authenticated) or session metrics (guest)
  useEffect(() => {
    // Wait for profile to finish loading
    if (profileLoading) return;

    if (user && profile) {
      // Authenticated user: use health profile data
      if (profile.weight_kg) setWeight(profile.weight_kg.toString());
      
      // Check direct activity_level first, then fall back to training_experience mapping
      if (profile.activity_level) {
        setActivityLevel(profile.activity_level);
      } else if (profile.training_experience) {
        const activityMap: Record<string, string> = {
          'beginner': 'sedentary',
          'intermediate': 'moderate',
          'advanced': 'active'
        };
        setActivityLevel(activityMap[profile.training_experience] || 'moderate');
      }
    } else if (!user && metrics) {
      // Guest user: use session storage data
      if (metrics.weight_kg) setWeight(metrics.weight_kg.toString());
      if (metrics.activity_level) setActivityLevel(metrics.activity_level);
      if (metrics.fitness_goal) setGoal(metrics.fitness_goal);
    }
  }, [user, profile, profileLoading, metrics]);

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
