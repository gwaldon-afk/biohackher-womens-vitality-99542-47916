import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Utensils, TrendingUp, Target, Flame, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstNutritionWelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    icon: Utensils,
    title: 'Welcome to Daily Nutrition Tracking',
    description: 'Track your anti-inflammatory score every day to see how your food choices impact your longevity.',
    features: [
      'Simple daily scoring (0-15 scale)',
      'Track key nutrients and hydration',
      'See immediate impact on your LIS score',
    ],
  },
  {
    step: 2,
    icon: TrendingUp,
    title: 'Build Your Nutrition Streak',
    description: 'Consistency is key! Log daily to build streaks and watch your biological age improve over time.',
    features: [
      'Daily streak tracking with fire badges',
      'Milestone celebrations at 3, 7, and 30 days',
      'Visual progress with sparkline charts',
    ],
  },
  {
    step: 3,
    icon: Target,
    title: 'Get Personalized Insights',
    description: 'After 7 days of tracking, unlock AI-powered insights about your eating patterns and recommendations.',
    features: [
      'Pattern detection in your nutrition',
      'Personalized meal suggestions',
      'Longevity-focused food recommendations',
    ],
  },
  {
    step: 4,
    icon: Flame,
    title: "Let's Log Your First Day!",
    description: "We'll guide you through your first nutrition log. It takes just 2 minutes.",
    features: [
      'Interactive guided tour',
      'Helpful tooltips for each category',
      'Easy-to-use sliders for quick logging',
    ],
  },
];

export const FirstNutritionWelcomeModal = ({ isOpen, onComplete }: FirstNutritionWelcomeModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = TOUR_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = TOUR_STEPS[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">
              Step {currentStep + 1} of {totalSteps}
            </DialogTitle>
            {currentStep < totalSteps - 1 && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip tour
              </Button>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 py-4"
          >
            {/* Icon */}
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <Icon className="h-10 w-10 text-primary" />
              </div>
            </div>

            {/* Title and Description */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">{currentStepData.title}</h3>
              <DialogDescription className="text-base">
                {currentStepData.description}
              </DialogDescription>
            </div>

            {/* Features List */}
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              {currentStepData.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <Button onClick={handleNext} size="lg">
            {currentStep < totalSteps - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Start Logging
                <Flame className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
