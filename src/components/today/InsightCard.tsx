import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, X } from 'lucide-react';

interface InsightCardProps {
  insight: {
    title: string;
    description: string;
    actionSuggestion?: string;
  };
  onDismiss: () => void;
}

export const InsightCard = ({ insight, onDismiss }: InsightCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-200">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
            {insight.actionSuggestion && (
              <p className="text-xs text-amber-700 font-medium">
                💡 {insight.actionSuggestion}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDismiss}
            className="shrink-0 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
