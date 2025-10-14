// Assessment step for onboarding (embeds LIS assessment)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ArrowRight } from "lucide-react";

interface AssessmentStepProps {
  onNext: (assessmentCompleted: boolean) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function AssessmentStep({ onNext, onBack, onSkip }: AssessmentStepProps) {
  const [isStarted, setIsStarted] = useState(false);

  const handleStartAssessment = () => {
    // This will be integrated with the actual LIS assessment component
    setIsStarted(true);
    // For now, navigate to LIS assessment
    window.location.href = '/lis-assessment';
  };

  if (isStarted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Activity className="h-12 w-12 mx-auto text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Take Your Longevity Impact Assessment</h2>
        <p className="text-muted-foreground">
          Get your personalized Longevity Impact Score and Biological Age estimate in just 10 minutes
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>What You'll Discover</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Your Longevity Impact Score (LIS)</p>
              <p className="text-sm text-muted-foreground">
                A comprehensive score reflecting how your daily habits impact your healthspan
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Biological Age Estimation</p>
              <p className="text-sm text-muted-foreground">
                Understand how your body is aging compared to your chronological age
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1 rounded-full bg-primary text-primary-foreground mt-0.5">
              <ArrowRight className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Personalized Protocol Preview</p>
              <p className="text-sm text-muted-foreground">
                See which interventions can make the biggest impact on your health
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <Button size="lg" onClick={handleStartAssessment} className="w-full">
          Start Assessment (10 minutes)
        </Button>
        
        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button variant="ghost" onClick={onSkip}>
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  );
}
