import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Clock, TrendingUp, Heart } from "lucide-react";

interface AssessmentWelcomeProps {
  onStart: () => void;
}

export function AssessmentWelcome({ onStart }: AssessmentWelcomeProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Longevity Nutrition Assessment</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover your personalized nutrition blueprint for longevity, gut health, and hormone balance
        </p>
      </div>

      <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            What You'll Discover
          </CardTitle>
          <CardDescription>
            A comprehensive analysis of your nutrition patterns and their impact on healthy aging
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Your Longevity Nutrition Score</h3>
              <p className="text-sm text-muted-foreground">
                A comprehensive 0-100 score based on protein, fiber, gut health, inflammation, and more
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">4-Pillar Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                How your nutrition impacts BODY, BRAIN, BALANCE, and BEAUTY
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Eating Personality Profile</h3>
              <p className="text-sm text-muted-foreground">
                Understand your unique patterns and how they affect longevity
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Personalized Protocol</h3>
              <p className="text-sm text-muted-foreground">
                Immediate actions, foundational habits, and optimization strategies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>8 minutes</span>
              <span>•</span>
              <span>16 questions</span>
              <span>•</span>
              <span>Instant results</span>
            </div>
            <Button size="lg" onClick={onStart} className="gap-2">
              Start Assessment
              <Sparkles className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        No signup required • Your data is private • Science-backed recommendations
      </p>
    </div>
  );
}
