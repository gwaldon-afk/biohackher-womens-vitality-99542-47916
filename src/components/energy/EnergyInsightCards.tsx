import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { EnergyInsight } from "@/hooks/useEnergyLoop";

interface EnergyInsightCardsProps {
  insights: EnergyInsight[];
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const EnergyInsightCards = ({ insights, onAcknowledge, onDismiss }: EnergyInsightCardsProps) => {
  if (insights.length === 0) {
    return (
      <Card className="p-8 text-center">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-lg font-semibold mb-2">All Systems Go!</h3>
        <p className="text-muted-foreground">
          Your Energy Loop is balanced. Keep up the great work!
        </p>
      </Card>
    );
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <TrendingDown className="h-5 w-5 text-warning" />;
      default:
        return <TrendingUp className="h-5 w-5 text-primary" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-4">
      {insights.slice(0, 3).map((insight) => (
        <Card key={insight.id} className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getSeverityIcon(insight.severity)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{insight.title}</h3>
                <Badge variant={getSeverityColor(insight.severity) as any}>
                  {insight.insight_type.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {insight.description}
              </p>
              {insight.action_suggestions && (insight.action_suggestions as any[]).length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-2">💡 Try this:</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    {(insight.action_suggestions as any[]).slice(0, 2).map((action, idx) => (
                      <li key={idx}>• {action}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onAcknowledge(insight.id)}
                >
                  Got it
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismiss(insight.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
