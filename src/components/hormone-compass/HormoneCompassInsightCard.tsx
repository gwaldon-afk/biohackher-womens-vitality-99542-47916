import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, X, Lightbulb } from "lucide-react";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";

interface HormoneCompassInsightCardProps {
  insight: {
    id: string;
    insight_type: string;
    title: string;
    description: string;
    severity?: string;
    action_suggestions: any[];
  };
}

export const HormoneCompassInsightCard = ({ insight }: HormoneCompassInsightCardProps) => {
  const { dismissInsight } = useHormoneCompass();

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const handleDismiss = async () => {
    try {
      await dismissInsight(insight.id);
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  return (
    <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            {insight.severity && (
              <Badge variant={getSeverityColor(insight.severity) as any}>
                {insight.severity}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-base mt-2">{insight.title}</CardTitle>
        <CardDescription>{insight.description}</CardDescription>
      </CardHeader>

      {insight.action_suggestions && insight.action_suggestions.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Suggested Actions:
            </div>
            <ul className="space-y-1">
              {insight.action_suggestions.map((action: any, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground pl-4">
                  • {typeof action === 'string' ? action : action.title || action.description}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
