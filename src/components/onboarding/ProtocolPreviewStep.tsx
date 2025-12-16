// Protocol preview step showing generated recommendations
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface ProtocolPreviewStepProps {
  onComplete: () => void;
  onBack: () => void;
  assessmentScore?: number;
  recommendations?: any[];
}

export function ProtocolPreviewStep({ 
  onComplete, 
  onBack,
  assessmentScore = 72,
  recommendations = []
}: ProtocolPreviewStepProps) {
  const { t } = useTranslation();

  const mockRecommendations = recommendations.length > 0 ? recommendations : [
    {
      categoryKey: "onboarding.protocol.categories.sleepOptimisation",
      items: ["Magnesium Glycinate", "Sleep tracking protocol", "Evening routine"],
      priority: "high"
    },
    {
      categoryKey: "onboarding.protocol.categories.cognitiveEnhancement",
      items: ["Omega-3 supplementation", "Mental clarity exercises", "Focus techniques"],
      priority: "high"
    },
    {
      categoryKey: "onboarding.protocol.categories.energyRecovery",
      items: ["CoQ10", "Active recovery days", "Hydration protocol"],
      priority: "medium"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
          <Sparkles className="h-4 w-4" />
          {t('onboarding.protocol.complete')}
        </div>
        <h2 className="text-3xl font-bold">{t('onboarding.protocol.title')}</h2>
        <p className="text-muted-foreground">
          {t('onboarding.protocol.description', { score: assessmentScore })}
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            {t('onboarding.protocol.ready.title')}
          </CardTitle>
          <CardDescription>
            {t('onboarding.protocol.ready.description', { count: mockRecommendations.length })}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {mockRecommendations.map((rec, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t(rec.categoryKey)}</CardTitle>
                <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'}>
                  {rec.priority === 'high' ? t('onboarding.protocol.priority.high') : t('onboarding.protocol.priority.medium')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {rec.items.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            {t('onboarding.protocol.dashboardAccess')}
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          {t('onboarding.protocol.back')}
        </Button>
        <Button size="lg" onClick={onComplete} className="min-w-[200px]">
          {t('onboarding.protocol.goToDashboard')}
        </Button>
      </div>
    </div>
  );
}
