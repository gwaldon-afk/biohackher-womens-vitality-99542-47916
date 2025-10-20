import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

interface LegendItem {
  name: string;
  color: string;
  icon: string;
  description: string;
}

const legendItems: LegendItem[] = [
  {
    name: "Rest & Recovery",
    color: "#4A90E2",
    icon: "🌙",
    description: "Your body's nightly restoration process"
  },
  {
    name: "Calm & Resilience",
    color: "#F5A623",
    icon: "💨",
    description: "How well you're managing life's demands"
  },
  {
    name: "Nourishment",
    color: "#7ED321",
    icon: "🩸",
    description: "Fueling your body with what it needs"
  },
  {
    name: "Movement & Vitality",
    color: "#E94B8E",
    icon: "🏃‍♀️",
    description: "Physical activity that energizes you"
  },
  {
    name: "Hormonal Flow",
    color: "#9B51E0",
    icon: "🌸",
    description: "Your natural rhythms and cycles"
  }
];

export const EnergyLoopLegend = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
      <div className="flex items-center gap-2 mb-6">
        <Info className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Your Energy Dimensions</h3>
      </div>
      <div className="space-y-4">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-start gap-3 group hover:scale-105 transition-transform">
            <div className="flex items-center gap-2 min-w-[50px]">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xl flex-shrink-0">{item.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm mb-1">{item.name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed">
          💫 <strong>The Loop Effect:</strong> Each dimension influences the others. When you strengthen one, you elevate them all.
        </p>
      </div>
    </Card>
  );
};
