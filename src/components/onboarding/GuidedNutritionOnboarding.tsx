import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GuidedNutritionOnboardingProps {
  isActive: boolean;
  onComplete: () => void;
}

const TOOLTIP_STEPS = [
  {
    id: 'hydration',
    title: 'Start with Hydration',
    description: 'Water is the foundation of health. Move this slider to log how many glasses of water you drank today.',
    target: 'hydration-slider', // ID to target in the NutritionalScorecard
    position: 'right' as const,
  },
  {
    id: 'vegetables',
    title: 'Track Your Vegetables',
    description: 'Vegetables and greens are powerhouses for longevity. Log how many servings you ate today.',
    target: 'vegetables-slider',
    position: 'right' as const,
  },
  {
    id: 'protein',
    title: 'Protein Quality Matters',
    description: 'High-quality protein supports muscle maintenance and healthy aging. Rate your protein sources today.',
    target: 'protein-slider',
    position: 'right' as const,
  },
  {
    id: 'fats',
    title: 'Healthy Fats & Omega-3s',
    description: 'Fish, nuts, and seeds reduce inflammation. Did you consume omega-3s today?',
    target: 'fats-slider',
    position: 'right' as const,
  },
  {
    id: 'sugar',
    title: 'Minimize Processed Foods',
    description: 'Sugar and processed foods accelerate aging. Use this slider to track inflammatory foods.',
    target: 'sugar-slider',
    position: 'right' as const,
  },
  {
    id: 'complete',
    title: 'Great Job! You\'re All Set',
    description: 'Your nutrition score is calculated automatically. Come back tomorrow to build your streak!',
    target: 'score-circle',
    position: 'top' as const,
  },
];

export const GuidedNutritionOnboarding = ({ isActive, onComplete }: GuidedNutritionOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);

  if (!isActive) return null;

  const currentTooltip = TOOLTIP_STEPS[currentStep];
  const isLastStep = currentStep === TOOLTIP_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      setIsOpen(false);
      // Store completion in localStorage
      localStorage.setItem('nutrition_onboarding_completed', 'true');
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
      // Scroll to next element
      setTimeout(() => {
        const nextTarget = document.getElementById(TOOLTIP_STEPS[currentStep + 1].target);
        if (nextTarget) {
          nextTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    localStorage.setItem('nutrition_onboarding_completed', 'true');
    onComplete();
  };

  // Get the target element
  const targetElement = document.getElementById(currentTooltip.target);

  if (!targetElement || !isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleSkip}
          />

          {/* Spotlight effect on target element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed z-50"
            style={{
              top: targetElement.getBoundingClientRect().top - 8,
              left: targetElement.getBoundingClientRect().left - 8,
              width: targetElement.getBoundingClientRect().width + 16,
              height: targetElement.getBoundingClientRect().height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              pointerEvents: 'none',
            }}
          />

          {/* Tooltip card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.1 }}
            className="fixed z-50"
            style={{
              top:
                currentTooltip.position === 'top'
                  ? targetElement.getBoundingClientRect().top - 200
                  : targetElement.getBoundingClientRect().top,
              left:
                currentTooltip.position === 'right'
                  ? targetElement.getBoundingClientRect().right + 20
                  : targetElement.getBoundingClientRect().left,
              maxWidth: '320px',
            }}
          >
            <Card className="p-4 shadow-2xl border-2 border-primary">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {isLastStep ? (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{currentTooltip.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{currentTooltip.description}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Step {currentStep + 1} of {TOOLTIP_STEPS.length}
                  </span>
                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={handleSkip}>
                    Skip
                  </Button>
                </div>

                {/* Action */}
                <Button onClick={handleNext} size="sm" className="w-full">
                  {isLastStep ? (
                    <>
                      Finish Tour
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
