// Welcome step for onboarding
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Sparkles, TrendingUp } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  userName?: string;
}

export function WelcomeStep({ onNext, userName }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Welcome{userName ? `, ${userName}` : ''}! 👋
        </h1>
        <p className="text-xl text-muted-foreground">
          Let's set up your personalized health journey in just 4 simple steps
        </p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Science-Backed Approach</CardTitle>
                <CardDescription>
                  Evidence-based recommendations tailored to your unique health profile
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI-Powered Insights</CardTitle>
                <CardDescription>
                  Get personalized recommendations based on your assessment results
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Track Your Progress</CardTitle>
                <CardDescription>
                  Monitor improvements and optimize your healthspan over time
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button size="lg" onClick={onNext} className="min-w-[200px]">
          Get Started
        </Button>
      </div>
    </div>
  );
}
