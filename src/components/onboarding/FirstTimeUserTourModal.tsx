import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, Target, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface FirstTimeUserTourModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    step: 1,
    icon: Calendar,
    titleKey: 'onboarding.userTour.steps.today.title',
    descriptionKey: 'onboarding.userTour.steps.today.description',
    featureKeys: [
      'onboarding.userTour.steps.today.features.1',
      'onboarding.userTour.steps.today.features.2',
      'onboarding.userTour.steps.today.features.3',
    ],
    route: '/today',
  },
  {
    step: 2,
    icon: User,
    titleKey: 'onboarding.userTour.steps.profile.title',
    descriptionKey: 'onboarding.userTour.steps.profile.description',
    featureKeys: [
      'onboarding.userTour.steps.profile.features.1',
      'onboarding.userTour.steps.profile.features.2',
      'onboarding.userTour.steps.profile.features.3',
    ],
    route: '/profile',
  },
  {
    step: 3,
    icon: Target,
    titleKey: 'onboarding.userTour.steps.plans.title',
    descriptionKey: 'onboarding.userTour.steps.plans.description',
    featureKeys: [
      'onboarding.userTour.steps.plans.features.1',
      'onboarding.userTour.steps.plans.features.2',
      'onboarding.userTour.steps.plans.features.3',
    ],
    route: '/plans/90-day',
  },
  {
    step: 4,
    icon: ShoppingBag,
    titleKey: 'onboarding.userTour.steps.shop.title',
    descriptionKey: 'onboarding.userTour.steps.shop.description',
    featureKeys: [
      'onboarding.userTour.steps.shop.features.1',
      'onboarding.userTour.steps.shop.features.2',
      'onboarding.userTour.steps.shop.features.3',
    ],
    route: '/shop',
  },
];

export const FirstTimeUserTourModal = ({ isOpen, onComplete }: FirstTimeUserTourModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = TOUR_STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const currentStepData = TOUR_STEPS[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Mark tour as completed in localStorage
    localStorage.setItem('user_tour_completed', 'true');
    onComplete();
    // Navigate to Today page
    navigate('/today');
  };

  const handleGoToSection = () => {
    localStorage.setItem('user_tour_completed', 'true');
    onComplete();
    navigate(currentStepData.route);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">
              {t('onboarding.userTour.stepOf', { current: currentStep + 1, total: totalSteps })}
            </DialogTitle>
            {currentStep < totalSteps - 1 && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                {t('onboarding.userTour.skipTour')}
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
              <h3 className="text-xl font-bold">{t(currentStepData.titleKey)}</h3>
              <DialogDescription className="text-base">
                {t(currentStepData.descriptionKey)}
              </DialogDescription>
            </div>

            {/* Features List */}
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              {currentStepData.featureKeys.map((featureKey, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{t(featureKey)}</p>
                </div>
              ))}
            </div>

            {/* Go to section button */}
            <div className="text-center">
              <Button variant="link" onClick={handleGoToSection} className="text-primary">
                {t('onboarding.userTour.goToSection')}
              </Button>
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
                {t('onboarding.userTour.next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                {t('onboarding.userTour.startJourney')}
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
