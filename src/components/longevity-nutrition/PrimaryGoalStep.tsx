import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, Activity, Brain, Sparkles, Zap, Flame, Droplets } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryGoalStepProps {
  data: {
    goal_primary?: string;
  };
  onChange: (field: string, value: any) => void;
}

const goals = [
  { value: 'longevity', label: 'Longevity & Healthy Aging', icon: Sparkles, description: 'Optimize cellular health and extend healthspan' },
  { value: 'gut-repair', label: 'Gut Repair & Microbiome', icon: Heart, description: 'Heal digestive issues and rebuild gut health' },
  { value: 'menopause-support', label: 'Menopause Support', icon: Flame, description: 'Balance hormones and reduce symptoms' },
  { value: 'fat-loss', label: 'Fat Loss', icon: TrendingDown, description: 'Sustainable weight management' },
  { value: 'muscle-gain', label: 'Muscle Gain & Strength', icon: Activity, description: 'Build lean muscle and metabolic health' },
  { value: 'energy', label: 'Energy & Vitality', icon: Zap, description: 'All-day sustained energy without crashes' },
  { value: 'cognitive-performance', label: 'Cognitive Performance', icon: Brain, description: 'Mental clarity, focus, and brain health' },
  { value: 'skin-ageing', label: 'Skin & Beauty from Within', icon: Droplets, description: 'Reduce visible aging and support radiance' },
];

function TrendingDown(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  );
}

export function PrimaryGoalStep({ data, onChange }: PrimaryGoalStepProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle>What's Your Primary Nutrition Goal?</CardTitle>
        </div>
        <CardDescription>
          Select the goal that matters most to you right now (you can work on multiple goals later)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const isSelected = data.goal_primary === goal.value;
            return (
              <button
                key={goal.value}
                onClick={() => onChange('goal_primary', goal.value)}
                className={cn(
                  "text-left p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                  isSelected ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn("h-5 w-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{goal.label}</h3>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
