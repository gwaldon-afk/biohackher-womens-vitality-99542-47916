import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";

interface GoalReframe {
  title: string;
  description: string;
  pillar: string;
  healthspanTarget?: string;
}

interface GoalReframeCardProps {
  reframe: GoalReframe;
  onAccept: () => void;
  onRegenerate: () => void;
  isLoading?: boolean;
}

export function GoalReframeCard({ 
  reframe, 
  onAccept, 
  onRegenerate,
  isLoading = false 
}: GoalReframeCardProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Your Goal Reframed with HACK Protocol</CardTitle>
        </div>
        <CardDescription>
          Review how we've reframed your goal. If you're happy with it, continue to generate the full personalized plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{reframe.title}</h3>
            <p className="text-muted-foreground">{reframe.description}</p>
          </div>

          {reframe.healthspanTarget && (
            <div className="bg-primary rounded-lg p-4">
              <h4 className="font-semibold text-base mb-1">Healthspan Target</h4>
              <p className="text-base">{reframe.healthspanTarget}</p>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-1">Health Pillar</h4>
            <p className="text-sm capitalize">{reframe.pillar}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={onAccept}
            className="flex-1"
            size="lg"
            disabled={isLoading}
          >
            Accept & Generate Full Plan
          </Button>
          <Button 
            onClick={onRegenerate}
            variant="outline"
            size="lg"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
