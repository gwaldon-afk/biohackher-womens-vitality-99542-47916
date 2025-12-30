import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Brain, Heart, Sparkles, Dumbbell, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { toast } from 'sonner';

interface OnboardingGoalPromptProps {
  isOpen: boolean;
  onClose: () => void;
  lowestPillars?: { pillar: string; score: number }[];
}

const PILLAR_GOALS = [
  {
    id: 'improve-sleep',
    pillar: 'balance',
    icon: Heart,
    titleKey: 'onboardingGoals.goals.improveSleep.title',
    descKey: 'onboardingGoals.goals.improveSleep.description',
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20'
  },
  {
    id: 'reduce-stress',
    pillar: 'balance',
    icon: Sparkles,
    titleKey: 'onboardingGoals.goals.reduceStress.title',
    descKey: 'onboardingGoals.goals.reduceStress.description',
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
  },
  {
    id: 'increase-energy',
    pillar: 'body',
    icon: Dumbbell,
    titleKey: 'onboardingGoals.goals.increaseEnergy.title',
    descKey: 'onboardingGoals.goals.increaseEnergy.description',
    color: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
  },
  {
    id: 'sharpen-focus',
    pillar: 'brain',
    icon: Brain,
    titleKey: 'onboardingGoals.goals.sharpenFocus.title',
    descKey: 'onboardingGoals.goals.sharpenFocus.description',
    color: 'bg-green-500/10 text-green-600 border-green-500/20'
  }
];

export const OnboardingGoalPrompt = ({ isOpen, onClose, lowestPillars = [] }: OnboardingGoalPromptProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { createGoal } = useGoals();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Sort goals to show lowest-scoring pillar goals first
  const sortedGoals = [...PILLAR_GOALS].sort((a, b) => {
    const aIndex = lowestPillars.findIndex(p => p.pillar === a.pillar);
    const bIndex = lowestPillars.findIndex(p => p.pillar === b.pillar);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_goal_dismissed', 'true');
    onClose();
  };

  const handleCreateGoals = async () => {
    if (selectedGoals.length === 0) {
      toast.error(t('onboardingGoals.selectAtLeastOne'));
      return;
    }

    setCreating(true);
    try {
      for (const goalId of selectedGoals) {
        const goalTemplate = PILLAR_GOALS.find(g => g.id === goalId);
        if (goalTemplate) {
          await createGoal({
            title: t(goalTemplate.titleKey),
            pillar_category: goalTemplate.pillar as 'brain' | 'body' | 'balance' | 'beauty',
            status: 'active',
            healthspan_target: {
              description: t(goalTemplate.descKey),
              target_improvement: 15
            }
          });
        }
      }
      
      toast.success(t('onboardingGoals.goalsCreated', { count: selectedGoals.length }), {
        action: {
          label: t('onboardingGoals.viewGoals'),
          onClick: () => navigate('/my-goals'),
        },
      });
      localStorage.setItem('onboarding_goal_completed', 'true');
      onClose();
    } catch (error) {
      console.error('Error creating goals:', error);
      toast.error(t('onboardingGoals.createError'));
    } finally {
      setCreating(false);
    }
  };

  const isGoalRecommended = (goalPillar: string) => {
    return lowestPillars.some(p => p.pillar === goalPillar);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">{t('onboardingGoals.title')}</DialogTitle>
              <DialogDescription className="text-sm">
                {t('onboardingGoals.description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {sortedGoals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = selectedGoals.includes(goal.id);
            const isRecommended = isGoalRecommended(goal.pillar);
            
            return (
              <Card
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                    : 'hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${goal.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{t(goal.titleKey)}</h4>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          {t('onboardingGoals.recommended')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t(goal.descKey)}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-primary border-primary' 
                      : 'border-muted-foreground/30'
                  }`}>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary-foreground" />}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-4 border-t">
          <Button 
            onClick={handleCreateGoals} 
            disabled={selectedGoals.length === 0 || creating}
            className="w-full"
          >
            {creating ? (
              t('onboardingGoals.creating')
            ) : (
              <>
                {t('onboardingGoals.createSelected', { count: selectedGoals.length })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            <X className="mr-2 h-4 w-4" />
            {t('onboardingGoals.skipForNow')}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            {t('onboardingGoals.canAddLater')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
