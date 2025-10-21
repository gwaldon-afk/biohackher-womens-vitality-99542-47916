import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/stores/userStore";

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
  const [selected, setSelected] = useState<string[]>([]);

  const goals = profile?.user_stream === 'performance' ? performanceGoals : menopauseGoals;

  const toggleGoal = (goal: string) => {
    setSelected((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleContinue = () => {
    localStorage.setItem('goal_focus_area', JSON.stringify(selected));
    navigate('/onboarding/goal-affirmation');
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

        <Button onClick={handleContinue} disabled={selected.length === 0} className="w-full" size="lg">
          Continue ({selected.length} selected)
        </Button>
      </div>
    </div>
  );
};

export default GoalSetupChat;
