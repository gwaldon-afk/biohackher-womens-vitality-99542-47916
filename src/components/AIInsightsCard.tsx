import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, TrendingUp, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AIInsightsCardProps {
  isPremium?: boolean;
}

export const AIInsightsCard = ({ isPremium = false }: AIInsightsCardProps) => {
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [timeframe, setTimeframe] = useState("week");
  const { toast } = useToast();

  const generateInsights = async () => {
    if (!isPremium) {
      toast({
        title: "Premium Feature",
        description: "AI-powered insights are available with Premium subscription.",
        variant: "default"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-insights", {
        body: { timeframe }
      });

      if (error) throw error;

      setInsight(data.insight);
      setStats(data.stats);
      
      toast({
        title: "Insights Generated",
        description: "Your personalised wellness insights are ready!"
      });
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate insights. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Insights
              {isPremium && <Badge variant="default">Premium</Badge>}
            </CardTitle>
            <CardDescription>
              Get personalised wellness recommendations based on your data
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isPremium ? (
          <div className="p-6 bg-muted/30 rounded-lg text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Unlock AI Insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get personalised recommendations, trend analysis, and actionable advice with Premium.
            </p>
            <Button variant="default">Upgrade to Premium</Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="quarter">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={generateInsights} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </div>

            {stats && (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{stats.adherenceRate}%</p>
                  <p className="text-xs text-muted-foreground">Adherence</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Calendar className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{stats.measurementCount}</p>
                  <p className="text-xs text-muted-foreground">Measurements</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-lg text-center">
                  <Sparkles className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <p className="text-2xl font-bold">{stats.assessmentCount}</p>
                  <p className="text-xs text-muted-foreground">Assessments</p>
                </div>
              </div>
            )}

            {insight && (
              <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{insight}</div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
