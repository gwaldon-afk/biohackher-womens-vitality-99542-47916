import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Heart, 
  AlertCircle, 
  Sparkles, 
  PartyPopper, 
  Check, 
  X,
  ChevronRight
} from "lucide-react";
import { GoalInsight } from "@/hooks/useGoalInsights";

interface GoalInsightCardProps {
  insight: GoalInsight;
  onAcknowledge?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onActionClick?: (action: string) => void;
}

const insightIcons = {
  progress: TrendingUp,
  motivation: Heart,
  barrier: AlertCircle,
  optimization: Sparkles,
  celebration: PartyPopper,
};

const severityColors = {
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  warning: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  celebration: "bg-green-500/10 text-green-600 border-green-500/20",
};

export const GoalInsightCard = ({ 
  insight, 
  onAcknowledge, 
  onDismiss,
  onActionClick 
}: GoalInsightCardProps) => {
  const Icon = insightIcons[insight.insight_type];
  const colorClass = severityColors[insight.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-l-4 ${!insight.acknowledged ? colorClass : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  {!insight.acknowledged && (
                    <Badge variant="secondary" className="text-xs">New</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </div>
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(insight.id)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Action Suggestions */}
          {insight.action_suggestions && insight.action_suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Suggested Actions:</p>
              <div className="space-y-2">
                {insight.action_suggestions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => onActionClick?.(action)}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors w-full text-left group"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="flex-1">{action}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {new Date(insight.created_at).toLocaleDateString()}
            </span>
            
            {onAcknowledge && !insight.acknowledged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(insight.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Got it
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
