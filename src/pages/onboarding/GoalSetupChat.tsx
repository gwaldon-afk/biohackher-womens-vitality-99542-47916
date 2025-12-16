import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { useCreateProtocol } from "@/queries/protocolQueries";
import { useCreateProtocolItem } from "@/queries/protocolQueries";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const GoalSetupChat = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { createGoals } = useGoals();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const goalKeys = [
    'increaseEnergy',
    'improveClarity',
    'enhanceAthletic',
    'optimiseSleep',
    'reduceStress',
    'buildMuscle',
    'manageHotFlushes',
    'balanceMoodSwings',
    'maintainBoneHealth',
    'supportSkinHealth',
    'boostEnergy',
  ];

  const toggleGoal = (goal: string) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const createProtocol = useCreateProtocol(user?.id || '');
  const createProtocolItem = useCreateProtocolItem('');

  const handleContinue = async () => {
    if (!user?.id) {
      toast({
        title: t('onboarding.goalSetup.toasts.errorTitle'),
        description: t('onboarding.goalSetup.toasts.signInRequired'),
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create goals in database with smart categorization
      const goalData = selected.map(goalKey => {
        const goal = t(`onboarding.goalSetup.goals.${goalKey}`);
        let pillar_category: 'body' | 'balance' | 'brain' | 'beauty' = 'body';
        
        if (goal.toLowerCase().includes('energy') || goal.toLowerCase().includes('athletic') || goal.toLowerCase().includes('muscle')) {
          pillar_category = 'body';
        } else if (goal.toLowerCase().includes('mood') || goal.toLowerCase().includes('stress') || goal.toLowerCase().includes('flush')) {
          pillar_category = 'balance';
        } else if (goal.toLowerCase().includes('clarity') || goal.toLowerCase().includes('mental')) {
          pillar_category = 'brain';
        } else if (goal.toLowerCase().includes('skin') || goal.toLowerCase().includes('beauty')) {
          pillar_category = 'beauty';
        }
        
        return {
          title: goal,
          pillar_category,
          status: 'active' as const,
          progress: 0,
          healthspan_target: {
            metric: goal,
            target_value: 'Improvement',
            timeframe_days: 90,
            reasoning: 'User-selected goal'
          },
          aging_blueprint: {
            interventions: []
          },
          barriers_plan: {
            common_barriers: [],
            solutions: [],
            support_needed: ''
          },
          longevity_metrics: {
            target_biological_age_reduction: 0,
            tracking_frequency: 'weekly',
            primary_metrics: [goal]
          },
          check_in_frequency: 'weekly',
        };
      });

      await createGoals(goalData);

      // Create personalized protocol
      const protocol = await createProtocol.mutateAsync({
        user_id: user.id,
        name: t('onboarding.goalSetup.protocolName'),
        description: `Tailored protocol based on your goals: ${selected.map(k => t(`onboarding.goalSetup.goals.${k}`)).join(', ')}`,
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: null,
        created_from_pillar: 'Body',
      });

      // Create protocol items based on goals
      const protocolItems = [];
      
      for (const goalKey of selected) {
        const goal = t(`onboarding.goalSetup.goals.${goalKey}`);
        if (goal.toLowerCase().includes('energy')) {
          protocolItems.push(
            { name: 'CoQ10', item_type: 'supplement' as const, dosage: '100mg', frequency: 'daily' as const, time_of_day: ['morning'] },
            { name: 'B-Complex', item_type: 'supplement' as const, dosage: '1 capsule', frequency: 'daily' as const, time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('sleep')) {
          protocolItems.push(
            { name: 'Magnesium Glycinate', item_type: 'supplement' as const, dosage: '400mg', frequency: 'daily' as const, time_of_day: ['evening'] },
            { name: 'Sleep hygiene routine', item_type: 'habit' as const, dosage: null, frequency: 'daily' as const, time_of_day: ['evening'] }
          );
        }
        if (goal.toLowerCase().includes('stress')) {
          protocolItems.push(
            { name: 'Ashwagandha', item_type: 'supplement' as const, dosage: '300mg', frequency: 'twice_daily' as const, time_of_day: ['morning', 'evening'] },
            { name: 'Meditation', item_type: 'habit' as const, dosage: '10 minutes', frequency: 'daily' as const, time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('hot flush') || goal.toLowerCase().includes('mood')) {
          protocolItems.push(
            { name: 'Evening Primrose Oil', item_type: 'supplement' as const, dosage: '1000mg', frequency: 'daily' as const, time_of_day: ['evening'] }
          );
        }
        if (goal.toLowerCase().includes('clarity') || goal.toLowerCase().includes('mental')) {
          protocolItems.push(
            { name: 'Omega-3', item_type: 'supplement' as const, dosage: '1000mg', frequency: 'daily' as const, time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('athletic')) {
          protocolItems.push(
            { name: 'Protein supplementation', item_type: 'supplement' as const, dosage: '25g', frequency: 'daily' as const, time_of_day: ['post-workout'] },
            { name: 'Strength training', item_type: 'exercise' as const, dosage: '45 minutes', frequency: 'three_times_daily' as const, time_of_day: ['morning'] }
          );
        }
      }

      // Remove duplicates
      const uniqueItems = Array.from(new Map(protocolItems.map(item => [item.name, item])).values());

      // Create each protocol item
      const itemCreator = useCreateProtocolItem(protocol.id);
      for (const item of uniqueItems) {
        await itemCreator.mutateAsync({
          protocol_id: protocol.id,
          ...item,
          description: null,
          notes: null,
          product_link: null,
          is_active: true,
        });
      }

      localStorage.setItem('goal_focus_area', JSON.stringify(selected.map(k => t(`onboarding.goalSetup.goals.${k}`))));
      
      toast({
        title: t('onboarding.goalSetup.toasts.successTitle'),
        description: t('onboarding.goalSetup.toasts.successDescription'),
      });

      navigate('/onboarding/goal-affirmation');
    } catch (error) {
      console.error('Error creating protocol:', error);
      toast({
        title: t('onboarding.goalSetup.toasts.failedTitle'),
        description: t('onboarding.goalSetup.toasts.failedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t('onboarding.goalSetup.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.goalSetup.description')}</p>
        </div>

        <Card className="p-6 space-y-4">
          {goalKeys.map((goalKey) => (
            <div
              key={goalKey}
              className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggleGoal(goalKey)}
            >
              <Checkbox id={goalKey} checked={selected.includes(goalKey)} onCheckedChange={() => toggleGoal(goalKey)} />
              <Label htmlFor={goalKey} className="cursor-pointer flex-1 text-base">
                {t(`onboarding.goalSetup.goals.${goalKey}`)}
              </Label>
            </div>
          ))}
        </Card>

        <Button onClick={handleContinue} disabled={selected.length === 0 || isCreating} className="w-full" size="lg">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('onboarding.goalSetup.creating')}
            </>
          ) : (
            t('onboarding.goalSetup.continue', { count: selected.length })
          )}
        </Button>
      </div>
    </div>
  );
};

export default GoalSetupChat;
