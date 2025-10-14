import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Activity, Calendar, AlertCircle } from "lucide-react";

export const HACKProtocolInfo = () => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">The HACK Protocol</CardTitle>
        </div>
        <CardDescription>
          A science-backed framework for setting and achieving health goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Every goal follows the HACK structure to maximize your chances of success:
        </p>

        <div className="grid gap-4">
          {/* H - Healthspan Target */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                H
              </Badge>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Healthspan Target
                <Target className="h-4 w-4 text-primary" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Your specific, measurable outcome. What exactly do you want to achieve and by when? 
                Example: "Improve sleep quality to 7+ hours per night within 60 days"
              </p>
            </div>
          </div>

          {/* A - Aging Blueprint */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                A
              </Badge>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Aging Blueprint
                <Activity className="h-4 w-4 text-primary" />
              </h4>
              <p className="text-sm text-muted-foreground">
                The evidence-based interventions you'll use. These are the specific actions, supplements, 
                or practices that will help you reach your target. Each includes dosage, timing, and scientific reasoning.
              </p>
            </div>
          </div>

          {/* C - Check-in Frequency */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                C
              </Badge>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Check-in Frequency
                <Calendar className="h-4 w-4 text-primary" />
              </h4>
              <p className="text-sm text-muted-foreground">
                How often you'll review progress. Regular check-ins help you stay on track and adjust 
                your approach based on what's working.
              </p>
            </div>
          </div>

          {/* K - Knowledge of Barriers */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center font-bold">
                K
              </Badge>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                Knowledge of Barriers
                <AlertCircle className="h-4 w-4 text-primary" />
              </h4>
              <p className="text-sm text-muted-foreground">
                Anticipate what might get in your way and plan solutions in advance. Being prepared 
                for obstacles dramatically increases success rates.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground italic">
            The AI will help you maintain this structure as you create and refine your goals, 
            ensuring each component is well-defined and actionable.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
