// Assessment step for onboarding (embeds LIS assessment)
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight } from "lucide-react";

interface AssessmentStepProps {
  onNext: (assessmentCompleted: boolean) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function AssessmentStep({ onNext, onBack, onSkip }: AssessmentStepProps) {
  const { t } = useTranslation();
  const [isStarted, setIsStarted] = useState(false);

  const handleStartAssessment = () => {
    // This will be integrated with the actual LIS assessment component
    setIsStarted(true);
    // For now, navigate to LIS assessment
    window.location.href = '/lis-assessment';
  };

  if (isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Activity className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">{t('onboarding.assessment.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t('onboarding.assessment.title')}</h2>
        <p className="text-muted-foreground">
          {t('onboarding.assessment.description')}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>{t('onboarding.assessment.discover.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{t('onboarding.assessment.discover.lis.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.assessment.discover.lis.description')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{t('onboarding.assessment.discover.bioAge.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.assessment.discover.bioAge.description')}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{t('onboarding.assessment.discover.protocol.title')}</p>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.assessment.discover.protocol.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button size="lg" onClick={handleStartAssessment} className="w-full">
          {t('onboarding.assessment.startButton')}
        </Button>
        
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            {t('onboarding.assessment.back')}
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            {t('onboarding.assessment.skipForNow')}
          </Button>
        </div>
      </div>
    </div>
  );
}
