import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useInsights, Insight } from "@/hooks/useInsights";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Sparkles,
  X,
  Eye,
  Loader2
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const categoryIcons = {
  sleep: "🌙",
  stress: "🧘",
  activity: "🏃",
  nutrition: "🥗",
  overall: "⭐"
};

const typeIcons = {
  weekly_summary: TrendingUp,
  anomaly_detected: AlertTriangle,
  protocol_suggestion: Lightbulb,
  trend_analysis: Brain
};

const priorityColors = {
  low: "secondary",
  medium: "default",
  high: "default",
  urgent: "destructive"
} as const;

const InsightCard = ({ insight }: { insight: Insight }) => {
  const { markAsViewed, dismissInsight } = useInsights();
  const TypeIcon = typeIcons[insight.insight_type];

  const handleView = () => {
    if (!insight.is_viewed) {
      markAsViewed(insight.id);
    }
  };

  return (
    <Card className={`${!insight.is_viewed ? 'border-primary/50 bg-primary/5' : ''} relative`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="text-2xl">{categoryIcons[insight.category]}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-base">{insight.title}</CardTitle>
                {!insight.is_viewed && (
                  <Badge variant="default" className="text-xs">New</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={priorityColors[insight.priority]} className="text-xs">
                  {insight.priority}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TypeIcon className="h-3 w-3" />
                  <span className="capitalize">{insight.insight_type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => dismissInsight(insight.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <CardDescription className="text-sm">
          {insight.description}
        </CardDescription>
        
        {insight.recommendations && insight.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Recommendations:</p>
            <ul className="space-y-1">
              {insight.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!insight.is_viewed && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleView}
          >
            <Eye className="h-4 w-4 mr-2" />
            Mark as Read
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export const AIInsightsCard = () => {
  const { insights, unviewedCount, isLoading, generateInsights, isGenerating } = useInsights();

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>AI-Powered Insights</CardTitle>
              <CardDescription>
                Personalized recommendations based on your health data
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unviewedCount > 0 && (
              <Badge variant="default">{unviewedCount} new</Badge>
            )}
            <Button
              onClick={() => generateInsights()}
              disabled={isGenerating}
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Insights
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">No insights yet</p>
              <p className="text-sm text-muted-foreground">
                Click "Generate Insights" to analyze your health data
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {insights.map((insight, idx) => (
                <div key={insight.id}>
                  <InsightCard insight={insight} />
                  {idx < insights.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
