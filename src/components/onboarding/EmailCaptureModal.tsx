import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Sparkles, ArrowRight, X } from 'lucide-react';
import { captureMarketingLead } from '@/services/marketingLeadService';
import { toast } from 'sonner';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (email?: string) => void;
  assessmentType: string;
}

export const EmailCaptureModal = ({ isOpen, onClose, onContinue, assessmentType }: EmailCaptureModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      onContinue();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(t('emailCapture.invalidEmail'));
      return;
    }

    setSubmitting(true);
    
    const sessionId = localStorage.getItem('guest_session_id') || `guest_${Date.now()}`;
    localStorage.setItem('guest_session_id', sessionId);
    
    await captureMarketingLead({
      email,
      session_id: sessionId,
      source: 'pre_assessment',
      assessment_type: assessmentType,
      marketing_consent: marketingConsent,
      metadata: {
        captured_at: new Date().toISOString(),
        page: window.location.pathname
      }
    });

    localStorage.setItem('guest_email', email);
    setSubmitting(false);
    onContinue(email);
  };

  const handleSkip = () => {
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{t('emailCapture.title')}</DialogTitle>
              <DialogDescription className="text-sm">
                {t('emailCapture.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('emailCapture.emailLabel')}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('emailCapture.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={(checked) => setMarketingConsent(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="marketing" className="text-sm text-muted-foreground font-normal">
              {t('emailCapture.marketingConsent')}
            </Label>
          </div>

          {/* Benefits */}
          <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-medium">{t('emailCapture.benefitsTitle')}</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• {t('emailCapture.benefit1')}</li>
              <li>• {t('emailCapture.benefit2')}</li>
              <li>• {t('emailCapture.benefit3')}</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" disabled={submitting} className="w-full">
              {email ? t('emailCapture.submitWithEmail') : t('emailCapture.continueToAssessment')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleSkip}
              className="w-full text-muted-foreground"
            >
              <X className="mr-2 h-4 w-4" />
              {t('emailCapture.skip')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
