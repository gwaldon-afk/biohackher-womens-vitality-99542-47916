import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, Dumbbell, Sparkles, Heart, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CheckinMenu from "@/components/CheckinMenu";
import GlowMeter_Ring from "@/components/GlowMeter_Ring";
import { useTranslation } from 'react-i18next';

const PlanHome = () => {
  const { t } = useTranslation();
  const [bioScore, setBioScore] = useState(0);

  const pillarCards = [
    {
      id: 'brain',
      titleKey: 'today.pillars.brain',
      icon: Brain,
      color: 'from-purple-500/20 to-purple-500/5',
      descriptionKey: 'today.pillars.brainDesc',
    },
    {
      id: 'body',
      titleKey: 'today.pillars.body',
      icon: Dumbbell,
      color: 'from-blue-500/20 to-blue-500/5',
      descriptionKey: 'today.pillars.bodyDesc',
    },
    {
      id: 'beauty',
      titleKey: 'today.pillars.beauty',
      icon: Sparkles,
      color: 'from-pink-500/20 to-pink-500/5',
      descriptionKey: 'today.pillars.beautyDesc',
    },
    {
      id: 'balance',
      titleKey: 'today.pillars.balance',
      icon: Heart,
      color: 'from-green-500/20 to-green-500/5',
      descriptionKey: 'today.pillars.balanceDesc',
    },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('bio_score');
    if (stored) {
      setBioScore(parseInt(stored));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-8 pt-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{t('today.plan.title')}</h1>
          
          <div className="flex justify-center">
            <GlowMeter_Ring value={bioScore} size={200} strokeWidth={16} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {pillarCards.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.id}
                className={`p-6 cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br ${pillar.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-background/50 rounded-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{t(pillar.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(pillar.descriptionKey)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
              style={{
                boxShadow: '0 0 20px hsl(var(--primary))',
              }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <CheckinMenu />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default PlanHome;
