import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DailyAction } from "@/hooks/useDailyPlan";

interface SupplementsCardProps {
  supplements: DailyAction[];
  onToggle: (actionId: string) => void;
}

export const SupplementsCard = ({ supplements, onToggle }: SupplementsCardProps) => {
  const navigate = useNavigate();

  // Group supplements by time of day
  const groupedSupplements = supplements.reduce((acc, supp) => {
    // Extract time from protocolItemId or default to "morning"
    const time = "morning"; // Simplified - would need to look up actual time_of_day
    if (!acc[time]) acc[time] = [];
    acc[time].push(supp);
    return acc;
  }, {} as Record<string, DailyAction[]>);

  if (supplements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5" />
            Supplements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">No supplements in your protocol</p>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => navigate('/shop')}
          >
            <ShoppingCart className="w-4 h-4" />
            Shop Supplements
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Pill className="w-5 h-5" />
          Supplements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSupplements).map(([time, items]) => (
          <div key={time} className="space-y-2">
            <p className="text-sm font-medium capitalize text-muted-foreground">{time}</p>
            <div className="space-y-2">
              {items.map(supplement => (
                <div key={supplement.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox
                    checked={supplement.completed}
                    onCheckedChange={() => onToggle(supplement.id)}
                  />
                  <div className="flex-1">
                    <span className={supplement.completed ? "line-through text-muted-foreground text-sm" : "text-sm"}>
                      {supplement.title}
                    </span>
                    {supplement.description && (
                      <p className="text-xs text-muted-foreground">{supplement.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <Button 
          variant="outline" 
          className="w-full gap-2 mt-4"
          onClick={() => navigate('/shop')}
        >
          <ShoppingCart className="w-4 h-4" />
          Shop Supplements
        </Button>
      </CardContent>
    </Card>
  );
};
