// Goal selection step for onboarding
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Zap, Activity, Heart, Moon, Scale } from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string;
  icon: any;
  pillar: string;
}

const AVAILABLE_GOALS: Goal[] = [
  {
    id: "energy",
    title: "Boost Energy & Vitality",
    description: "Combat fatigue and feel more energized throughout the day",
    icon: Zap,
    pillar: "Body"
  },
  {
    id: "cognitive",
    title: "Enhance Cognitive Performance",
    description: "Improve focus, memory, and mental clarity",
    icon: Brain,
    pillar: "Brain"
  },
  {
    id: "body-composition",
    title: "Optimize Body Composition",
    description: "Build lean muscle and manage healthy weight",
    icon: Scale,
    pillar: "Body"
  },
  {
    id: "hormonal-balance",
    title: "Balance Hormones",
    description: "Address hormonal symptoms and restore equilibrium",
    icon: Heart,
    pillar: "Balance"
  },
  {
    id: "sleep-quality",
    title: "Improve Sleep Quality",
    description: "Enhance sleep duration and wake feeling refreshed",
    icon: Moon,
    pillar: "Body"
  },
  {
    id: "fitness",
    title: "Increase Physical Performance",
    description: "Enhance strength, endurance, and recovery",
    icon: Activity,
    pillar: "Body"
  }
];

interface GoalSelectionStepProps {
  onNext: (selectedGoals: string[]) => void;
  onBack: () => void;
  initialSelection?: string[];
}

export function GoalSelectionStep({ onNext, onBack, initialSelection = [] }: GoalSelectionStepProps) {
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
        <h2 className="text-3xl font-bold">What are your primary health goals?</h2>
        <p className="text-muted-foreground">
          Select all that apply - we'll tailor your experience to these priorities
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
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {goal.description}
                      </CardDescription>
                      <Badge variant="outline" className="mt-2">
                        {goal.pillar}
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
          Back
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={selectedGoals.length === 0}
          className="min-w-[200px]"
        >
          Continue ({selectedGoals.length} selected)
        </Button>
      </div>
    </div>
  );
}
