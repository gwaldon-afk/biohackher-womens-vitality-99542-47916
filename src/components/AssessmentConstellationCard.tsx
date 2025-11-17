import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Circle, Trophy, BarChart3, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AssessmentConstellationCardProps {
  completedCount: 1 | 2 | 3;
  lis_completed: boolean;
  nutrition_completed: boolean;
  hormone_completed: boolean;
  nextAssessmentName?: string;
  nextAssessmentRoute?: string;
}

export const AssessmentConstellationCard = ({
  completedCount,
  lis_completed,
  nutrition_completed,
  hormone_completed,
  nextAssessmentName,
  nextAssessmentRoute,
}: AssessmentConstellationCardProps) => {
  const navigate = useNavigate();

  if (completedCount === 3) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Congratulations! You've completed your Complete Health Constellation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-semibold">LIS Assessment: Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-semibold">Nutrition Score: Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="font-semibold">Hormone Health: Completed</span>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Trophy className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="font-semibold">Master Dashboard Now Available</p>
                <p className="text-sm text-muted-foreground">
                  See how all 3 scores connect and get your unified 90-day protocol
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate("/master-dashboard")}
            size="lg"
            className="w-full"
          >
            View Master Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const emoji = completedCount === 1 ? "🎯" : "🔥";
  const headline = completedCount === 1
    ? `You're 1/3 of the way to your Complete Health Profile!`
    : `You're so close! Just 1 more to go`;

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          {headline}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {lis_completed ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="font-semibold">LIS Assessment</span>
                <Badge variant="secondary" className="ml-auto bg-primary/10">Completed</Badge>
              </>
            ) : (
              <>
                <Circle className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">LIS Assessment</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {nutrition_completed ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="font-semibold">Nutrition Longevity Score</span>
                <Badge variant="secondary" className="ml-auto bg-primary/10">Completed</Badge>
              </>
            ) : (
              <>
                <Circle className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Nutrition Longevity Score</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hormone_completed ? (
              <>
                <Check className="h-5 w-5 text-primary" />
                <span className="font-semibold">Hormone Compass</span>
                <Badge variant="secondary" className="ml-auto bg-primary/10">Completed</Badge>
              </>
            ) : (
              <>
                <Circle className="h-5 w-5 text-muted-foreground" />
                <span className="text-muted-foreground">Hormone Compass</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
          <p className="font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Complete all 3 to unlock:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground ml-7">
            <li className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Master Longevity Dashboard
            </li>
            <li className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Cross-assessment insights
            </li>
            <li className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-primary" />
              Bonus: 30-day protocol optimization
            </li>
          </ul>
        </div>

        {nextAssessmentName && nextAssessmentRoute && (
          <Button
            onClick={() => navigate(nextAssessmentRoute)}
            size="lg"
            className="w-full"
          >
            Continue with {nextAssessmentName} →
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
