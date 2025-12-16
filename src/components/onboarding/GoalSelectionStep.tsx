// Goal selection step for onboarding
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Zap, Activity, Heart, Moon, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: any;
  pillarKey: string;
}

const AVAILABLE_GOALS: Goal[] = [
  {
    id: "energy",
    titleKey: "onboarding.goals.available.energy.title",
    descriptionKey: "onboarding.goals.available.energy.description",
    icon: Zap,
    pillarKey: "onboarding.goals.pillars.body"
  },
  {
    id: "cognitive",
    titleKey: "onboarding.goals.available.cognitive.title",
    descriptionKey: "onboarding.goals.available.cognitive.description",
    icon: Brain,
    pillarKey: "onboarding.goals.pillars.brain"
  },
  {
    id: "body-composition",
    titleKey: "onboarding.goals.available.bodyComposition.title",
    descriptionKey: "onboarding.goals.available.bodyComposition.description",
    icon: Scale,
    pillarKey: "onboarding.goals.pillars.body"
  },
  {
    id: "hormonal-balance",
    titleKey: "onboarding.goals.available.hormonalBalance.title",
    descriptionKey: "onboarding.goals.available.hormonalBalance.description",
    icon: Heart,
    pillarKey: "onboarding.goals.pillars.balance"
  },
  {
    id: "sleep-quality",
    titleKey: "onboarding.goals.available.sleepQuality.title",
    descriptionKey: "onboarding.goals.available.sleepQuality.description",
    icon: Moon,
    pillarKey: "onboarding.goals.pillars.body"
  },
  {
    id: "fitness",
    titleKey: "onboarding.goals.available.fitness.title",
    descriptionKey: "onboarding.goals.available.fitness.description",
    icon: Activity,
    pillarKey: "onboarding.goals.pillars.body"
  }
];

interface GoalSelectionStepProps {
  onNext: (selectedGoals: string[]) => void;
  onBack: () => void;
  initialSelection?: string[];
}

export function GoalSelectionStep({ onNext, onBack, initialSelection = [] }: GoalSelectionStepProps) {
  const { t } = useTranslation();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialSelection);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleContinue = () => {
    if (selectedGoals.length > 0) {
      onNext(selectedGoals);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">{t('onboarding.goals.title')}</h2>
        <p className="text-muted-foreground">
          {t('onboarding.goals.description')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {AVAILABLE_GOALS.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          const Icon = goal.icon;
          
          return (
            <Card
              key={goal.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "border-primary bg-primary/5"
              )}
              onClick={() => toggleGoal(goal.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{t(goal.titleKey)}</CardTitle>
                      <CardDescription className="mt-1">
                        {t(goal.descriptionKey)}
                      </CardDescription>
                      <Badge variant="outline" className="mt-2">
                        {t(goal.pillarKey)}
                      </Badge>
                    </div>
                  </div>
                  <Checkbox checked={isSelected} className="mt-1" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          {t('onboarding.goals.back')}
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          className="min-w-[200px]"
        >
          {t('onboarding.goals.continue', { count: selectedGoals.length })}
        </Button>
      </div>
    </div>
  );
}
