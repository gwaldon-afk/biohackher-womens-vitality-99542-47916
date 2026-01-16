import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2, Mail, Calendar, ShoppingBag, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuestAssessmentGateProps {
  isOpen: boolean;
  onClose: () => void;
  assessmentName?: string;
}

export const GuestAssessmentGate = ({ isOpen, onClose, assessmentName }: GuestAssessmentGateProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRegister = () => {
    // Get existing guest session if any
    const lisSession = localStorage.getItem('lis_guest_session_id');
    const nutritionSession = localStorage.getItem('nutrition_guest_session');
    const sessionParam = lisSession || nutritionSession;
    
    const authUrl = sessionParam 
      ? `/auth?session=${sessionParam}&source=assessment-gate` 
      : '/auth?source=assessment-gate';
    
    navigate(authUrl);
    onClose();
  };

  const benefits = [
    { icon: CheckCircle2, key: 'onboarding.guestGate.benefits.saveResults' },
    { icon: Mail, key: 'onboarding.guestGate.benefits.emailResults' },
    { icon: Calendar, key: 'onboarding.guestGate.benefits.plans' },
    { icon: Target, key: 'onboarding.guestGate.benefits.protocols' },
    { icon: ShoppingBag, key: 'onboarding.guestGate.benefits.shop' },
    { icon: Sparkles, key: 'onboarding.guestGate.benefits.aiAssistant' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('onboarding.guestGate.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t(
              'onboarding.guestGate.description',
              { assessment: assessmentName || t('onboarding.guestGate.anotherAssessment') },
            )}
          </DialogDescription>
          <p className="text-center text-sm text-muted-foreground">
            {t(
              'onboarding.guestGate.limitMessage',
              "You've used your free assessment. Create an account to unlock more.",
            )}
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Benefits list */}
          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{t(benefit.key)}</p>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Button onClick={handleRegister} size="lg" className="w-full text-lg py-6">
              {t('onboarding.guestGate.createAccount')}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              {t('onboarding.guestGate.trial')}
            </p>
            <Button variant="ghost" onClick={onClose} className="w-full">
              {t('onboarding.guestGate.maybeLater')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
