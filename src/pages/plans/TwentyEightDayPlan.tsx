import { MonthlySummary } from "@/components/BodyPillar/MonthlySummary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";

export default function TwentyEightDayPlan() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 pb-24 md:pb-10 max-w-6xl space-y-6">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your 28‑Day Reinvention Cycle
            </CardTitle>
            <CardDescription>
              A focused, repeatable cadence: train, track, adapt — then graduate and begin again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              This replaces any “30‑day plan” framing with a tighter 28‑day cycle (4 weeks) so users feel momentum sooner.
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/my-protocol">Review my protocol</Link>
              </Button>
              <Button asChild>
                <Link to="/exercise/setup">
                  Start / Restart cycle <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <MonthlySummary />

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Next 28 days: pick your “non‑negotiable”
            </CardTitle>
            <CardDescription>
              One small commitment that makes the whole cycle easier (e.g., 3 workouts/week, or a daily 10‑minute walk).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/today">Go to Today</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

