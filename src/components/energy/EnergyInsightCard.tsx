import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { EnergyInsight } from "@/hooks/useEnergyLoop";

interface EnergyInsightCardProps {
  insight: EnergyInsight;
  onAcknowledge: () => void;
  onDismiss: () => void;
}

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle
};

const severityColors = {
  info: "text-blue-500",
  warning: "text-amber-500",
  critical: "text-red-500"
};

export const EnergyInsightCard = ({ insight, onAcknowledge, onDismiss }: EnergyInsightCardProps) => {
  const Icon = severityIcons[insight.severity];
  
  return (
    <Card className="p-4 relative">
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-6 w-6 p-0"
        onClick={onDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="flex gap-3 pr-8">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${severityColors[insight.severity]}`} />
        
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold">{insight.title}</h3>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
          
          {insight.action_suggestions && insight.action_suggestions.length > 0 && (
            <div className="space-y-1 mt-3">
              <p className="text-xs font-medium">Suggested Actions:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {insight.action_suggestions.slice(0, 3).map((suggestion: string, idx: number) => (
                  <li key={idx}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <Button size="sm" onClick={onAcknowledge} className="mt-3">
            Got it
          </Button>
        </div>
      </div>
    </Card>
  );
};
