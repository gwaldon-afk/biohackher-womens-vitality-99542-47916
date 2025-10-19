import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Lightbulb, TrendingUp, FlaskConical, Activity, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenoMapInsightCardProps {
  insight: {
    id: string;
    insight_type: 'stage_change' | 'symptom_pattern' | 'protocol_suggestion' | 'lab_recommendation';
    title: string;
    description: string;
    action_items?: any[];
    ai_generated: boolean;
    acknowledged: boolean;
  };
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  compact?: boolean;
}

const INSIGHT_CONFIG = {
  'stage_change': {
    icon: TrendingUp,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Stage Update'
  },
  'symptom_pattern': {
    icon: Activity,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Pattern Detected'
  },
  'protocol_suggestion': {
    icon: Lightbulb,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    label: 'Suggestion'
  },
  'lab_recommendation': {
    icon: FlaskConical,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Lab Test'
  }
};

export const MenoMapInsightCard = ({
  insight,
  onAcknowledge,
  onDismiss,
  compact = false
}: MenoMapInsightCardProps) => {
  const config = INSIGHT_CONFIG[insight.insight_type];
  const Icon = config.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-md",
      insight.acknowledged && "opacity-60",
      compact ? "p-4" : "p-6"
    )}>
      {/* Dismiss Button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={() => onDismiss(insight.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <div className="flex gap-4">
        {/* Icon */}
        <div className={cn("flex-shrink-0 p-3 rounded-full", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-sm">{insight.title}</h4>
              {insight.ai_generated && (
                <Badge variant="outline" className="text-xs">AI</Badge>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {insight.description}
          </p>

          {/* Summary + Link to Plan */}
          {insight.action_items && insight.action_items.length > 0 && (
            <div className="pt-3 border-t space-y-2">
              <p className="text-sm text-muted-foreground">
                {insight.action_items.length} stage-specific recommendation{insight.action_items.length > 1 ? 's' : ''} available
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.href = '/today'}
                className="gap-2"
              >
                View in My Plan
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Actions */}
          {!insight.acknowledged && onAcknowledge && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => onAcknowledge(insight.id)}
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Got it
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
