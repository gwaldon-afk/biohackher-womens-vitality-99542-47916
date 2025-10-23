import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Target, Battery } from "lucide-react";
import { Slider } from "@/components/ui/slider";

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

const defaultPerformanceItems = [
  { name: 'Vitamin D3', item_type: 'supplement' as const, dosage: '2000 IU', frequency: 'daily' as const, time_of_day: ['morning'] },
  { name: 'Omega-3', item_type: 'supplement' as const, dosage: '1000mg', frequency: 'daily' as const, time_of_day: ['morning'] },
  { name: 'Morning Movement', item_type: 'exercise' as const, dosage: '20 mins', frequency: 'daily' as const, time_of_day: ['morning'] },
  { name: 'Hydration', item_type: 'habit' as const, dosage: '8 glasses', frequency: 'daily' as const, time_of_day: ['morning', 'afternoon'] },
];

const EnergyQuickStart = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { createGoals } = useGoals();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Energy check-in state
  const [energyLevel, setEnergyLevel] = useState([5]);
  const [sleepQuality, setSleepQuality] = useState([5]);
  const [stressLevel, setStressLevel] = useState([5]);

  const goals = profile?.user_stream === 'performance' ? performanceGoals : menopauseGoals;

  const toggleGoal = (goal: string) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please sign in to continue",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    let createdItemsCount = 0;

    try {
      // 1. Submit energy check-in
      await supabase.from('energy_check_ins').insert({
        user_id: user.id,
        energy_level: energyLevel[0],
        sleep_quality: sleepQuality[0],
        stress_level: stressLevel[0],
      });

      // 2. Enable energy loop if performance stream
      if (profile?.user_stream === 'performance') {
        await supabase
          .from('profiles')
          .update({ 
            energy_loop_enabled: true,
            energy_loop_onboarding_completed: true 
          } as any)
          .eq('user_id', user.id);
        
        await refreshProfile();
      }

      // 3. Create goals
      if (selected.length > 0) {
        const goalData = selected.map(goal => ({
          title: goal,
          pillar_category: (profile?.user_stream === 'performance' ? 'body' : 'balance') as 'body' | 'balance' | 'brain' | 'beauty',
          status: 'active' as const,
          progress: 0,
        }));
        await createGoals(goalData);
      }

      // 4. Create protocol
      const { data: protocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          name: `${profile?.user_stream === 'performance' ? 'Performance' : 'Menopause'} Protocol`,
          description: `Personalized protocol based on your goals${selected.length > 0 ? ': ' + selected.join(', ') : ''}`,
          is_active: true,
          start_date: new Date().toISOString(),
          end_date: null,
          created_from_pillar: profile?.user_stream === 'performance' ? 'Body' : 'Balance',
        })
        .select()
        .single();

      if (protocolError) throw protocolError;

      // 5. Create protocol items based on goals
      type ProtocolItemInsert = {
        name: string;
        item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
        dosage: string | null;
        frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
        time_of_day: string[];
      };
      
      const protocolItems: ProtocolItemInsert[] = [...defaultPerformanceItems];
      
      for (const goal of selected) {
        if (goal.toLowerCase().includes('energy')) {
          protocolItems.push(
            { name: 'CoQ10', item_type: 'supplement', dosage: '100mg', frequency: 'daily', time_of_day: ['morning'] },
            { name: 'B-Complex', item_type: 'supplement', dosage: '1 capsule', frequency: 'daily', time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('sleep')) {
          protocolItems.push(
            { name: 'Magnesium Glycinate', item_type: 'supplement', dosage: '400mg', frequency: 'daily', time_of_day: ['evening'] },
            { name: 'Sleep hygiene routine', item_type: 'habit', dosage: null, frequency: 'daily', time_of_day: ['evening'] }
          );
        }
        if (goal.toLowerCase().includes('stress')) {
          protocolItems.push(
            { name: 'Ashwagandha', item_type: 'supplement', dosage: '300mg', frequency: 'twice_daily', time_of_day: ['morning', 'evening'] },
            { name: 'Meditation', item_type: 'habit', dosage: '10 minutes', frequency: 'daily', time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('hot flush') || goal.toLowerCase().includes('mood')) {
          protocolItems.push(
            { name: 'Evening Primrose Oil', item_type: 'supplement', dosage: '1000mg', frequency: 'daily', time_of_day: ['evening'] }
          );
        }
        if (goal.toLowerCase().includes('clarity') || goal.toLowerCase().includes('mental')) {
          protocolItems.push(
            { name: 'Omega-3', item_type: 'supplement', dosage: '1000mg', frequency: 'daily', time_of_day: ['morning'] }
          );
        }
        if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('athletic')) {
          protocolItems.push(
            { name: 'Protein supplementation', item_type: 'supplement', dosage: '25g', frequency: 'daily', time_of_day: ['post-workout'] },
            { name: 'Strength training', item_type: 'exercise', dosage: '45 minutes', frequency: 'three_times_daily', time_of_day: ['morning'] }
          );
        }
      }

      // Remove duplicates
      const uniqueItems = Array.from(new Map(protocolItems.map(item => [item.name, item])).values());

      // Insert all protocol items
      const { data: insertedItems, error: itemsError } = await supabase
        .from('protocol_items')
        .insert(
          uniqueItems.map(item => ({
            protocol_id: protocol.id,
            ...item,
            description: null,
            notes: null,
            product_link: null,
            is_active: true,
          }))
        )
        .select();

      if (!itemsError && insertedItems) {
        createdItemsCount = insertedItems.length;
      }

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true } as any)
        .eq('user_id', user.id);
      
      await refreshProfile();

      toast({
        title: "You're all set! 🎉",
        description: `Protocol created with ${createdItemsCount} personalized items. Let's get started!`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error during setup:', error);
      toast({
        title: "Setup incomplete",
        description: "We created your protocol, but you can customize it later.",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Let's personalize your journey</h1>
          <p className="text-muted-foreground">Quick check-in + goal selection</p>
        </div>

        {/* Energy Check-in Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Battery className="h-5 w-5" />
              Today's Energy Check-in
            </CardTitle>
            <CardDescription>How are you feeling right now?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Energy Level: {energyLevel[0]}/10</Label>
              <Slider
                value={energyLevel}
                onValueChange={setEnergyLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Sleep Quality: {sleepQuality[0]}/10</Label>
              <Slider
                value={sleepQuality}
                onValueChange={setSleepQuality}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Stress Level: {stressLevel[0]}/10</Label>
              <Slider
                value={stressLevel}
                onValueChange={setStressLevel}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Goals Selection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Goals
            </CardTitle>
            <CardDescription>Select all that apply (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((goal) => (
              <div
                key={goal}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => toggleGoal(goal)}
              >
                <Checkbox id={goal} checked={selected.includes(goal)} onCheckedChange={() => toggleGoal(goal)} />
                <Label htmlFor={goal} className="cursor-pointer flex-1">
                  {goal}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button onClick={handleComplete} disabled={isCreating} className="w-full" size="lg">
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up your protocol...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Start Your Journey
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnergyQuickStart;
