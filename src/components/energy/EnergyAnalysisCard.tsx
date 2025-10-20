import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

interface EnergyAnalysisCardProps {
  score: any;
}

export const EnergyAnalysisCard = ({ score }: EnergyAnalysisCardProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-energy-loop', {
        body: { score }
      });

      if (error) {
        if (error.message?.includes("429") || error.message?.includes("rate limit")) {
          toast.error("Rate limit reached. Please try again in a moment.");
        } else if (error.message?.includes("402") || error.message?.includes("payment")) {
          toast.error("AI credits needed. Please add credits to your workspace.");
        } else {
          toast.error("Failed to generate analysis");
        }
        throw error;
      }

      setAnalysis(data.analysis);
      setHasGenerated(true);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">AI Energy Analysis</h3>
        </div>
        {hasGenerated && (
          <Button variant="ghost" size="sm" onClick={generateAnalysis} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        )}
      </div>

      {!hasGenerated && !loading && (
        <div className="text-center py-8 space-y-4">
          <p className="text-muted-foreground">
            Get personalized insights about your energy patterns and actionable recommendations.
          </p>
          <Button onClick={generateAnalysis} size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Analyze My Energy Loop
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-24 w-full mt-4" />
        </div>
      )}

      {analysis && !loading && (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </div>
      )}
    </Card>
  );
};
