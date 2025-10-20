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
    name: "Sleep Recovery",
    color: "#4A90E2",
    icon: "🌙",
    description: "Quality of rest and restoration"
  },
  {
    name: "Stress Load",
    color: "#F5A623",
    icon: "💨",
    description: "Stress management and resilience"
  },
  {
    name: "Fuel & Nutrition",
    color: "#7ED321",
    icon: "🩸",
    description: "Nutritional quality and blood sugar"
  },
  {
    name: "Movement Quality",
    color: "#E94B8E",
    icon: "🏃‍♀️",
    description: "Activity and recovery balance"
  },
  {
    name: "Hormonal Rhythm",
    color: "#9B51E0",
    icon: "🌸",
    description: "Hormonal balance and cycle awareness"
  }
];

export const EnergyLoopLegend = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Understanding Your Energy Loop</h3>
      </div>
      <div className="space-y-3">
        {legendItems.map((item) => (
          <div key={item.name} className="flex items-start gap-3">
            <div className="flex items-center gap-2 min-w-[140px]">
              <div 
                className="w-4 h-4 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg flex-shrink-0">{item.icon}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          Your composite score reflects the balance across all five dimensions. Each area impacts the others - improving one strengthens the whole loop.
        </p>
      </div>
    </Card>
  );
};
