import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/userStore";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { useCreateProtocol } from "@/queries/protocolQueries";
import { useCreateProtocolItem } from "@/queries/protocolQueries";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const performanceGoals = [
  'Increase energy levels',
  'Improve mental clarity',
  'Enhance athletic performance',
  'Optimize sleep quality',
  'Reduce stress',
  'Build muscle',
];

const menopauseGoals = [
  'Manage hot flushes',
  'Improve sleep quality',
  'Balance mood swings',
  'Maintain bone health',
  'Support skin health',
  'Boost energy',
];

const GoalSetupChat = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);
  const { user } = useAuth();
  const { createGoals } = useGoals();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const goals = profile?.user_stream === 'performance' ? performanceGoals : menopauseGoals;

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
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create goals in database
      const goalData = selected.map(goal => ({
        title: goal,
        pillar_category: (profile?.user_stream === 'performance' ? 'body' : 'balance') as 'body' | 'balance' | 'brain' | 'beauty',
        status: 'active' as const,
        progress: 0,
      }));

      await createGoals(goalData);

      // Create protocol
      const protocol = await createProtocol.mutateAsync({
        user_id: user.id,
        name: `${profile?.user_stream === 'performance' ? 'Performance' : 'Menopause'} Protocol`,
        description: `Personalized protocol based on your goals: ${selected.join(', ')}`,
        is_active: true,
        start_date: new Date().toISOString(),
        end_date: null,
        created_from_pillar: profile?.user_stream === 'performance' ? 'Body' : 'Balance',
      });

      // Create protocol items based on goals
      const protocolItems = [];
      
      for (const goal of selected) {
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

      localStorage.setItem('goal_focus_area', JSON.stringify(selected));
      
      toast({
        title: "Success!",
        description: "Your personalized protocol has been created",
      });

      navigate('/onboarding/goal-affirmation');
    } catch (error) {
      console.error('Error creating protocol:', error);
      toast({
        title: "Error",
        description: "Failed to create your protocol. Please try again.",
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
          <h1 className="text-3xl font-bold">What are your goals?</h1>
          <p className="text-muted-foreground">Select all that apply</p>
        </div>

        <Card className="p-6 space-y-4">
          {goals.map((goal) => (
            <div
              key={goal}
              className="flex items-center space-x-3 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => toggleGoal(goal)}
            >
              <Checkbox id={goal} checked={selected.includes(goal)} onCheckedChange={() => toggleGoal(goal)} />
              <Label htmlFor={goal} className="cursor-pointer flex-1 text-base">
                {goal}
              </Label>
            </div>
          ))}
        </Card>

        <Button onClick={handleContinue} disabled={selected.length === 0 || isCreating} className="w-full" size="lg">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your protocol...
            </>
          ) : (
            `Continue (${selected.length} selected)`
          )}
        </Button>
      </div>
    </div>
  );
};

export default GoalSetupChat;
