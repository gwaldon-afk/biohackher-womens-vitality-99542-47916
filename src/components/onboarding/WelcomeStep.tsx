// Welcome step for onboarding
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  userName?: string;
}

export function WelcomeStep({ onNext, userName }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          {userName ? t('onboarding.welcome.greetingWithName', { userName }) : t('onboarding.welcome.greeting')}
        </h1>
        <p className="text-xl text-muted-foreground">
          {t('onboarding.welcome.description')}
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('onboarding.welcome.scienceBacked.title')}</CardTitle>
                <CardDescription>
                  {t('onboarding.welcome.scienceBacked.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('onboarding.welcome.aiPowered.title')}</CardTitle>
                <CardDescription>
                  {t('onboarding.welcome.aiPowered.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('onboarding.welcome.trackProgress.title')}</CardTitle>
                <CardDescription>
                  {t('onboarding.welcome.trackProgress.description')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="min-w-[200px]">
          {t('onboarding.welcome.getStarted')}
        </Button>
      </div>
    </div>
  );
}
