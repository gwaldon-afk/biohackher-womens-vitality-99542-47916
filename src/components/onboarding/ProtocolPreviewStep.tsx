// Protocol preview step showing generated recommendations
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, CheckCircle } from "lucide-react";

interface ProtocolPreviewStepProps {
  onComplete: () => void;
  onBack: () => void;
  assessmentScore?: number;
  recommendations?: any[];
}

export function ProtocolPreviewStep({ 
  onComplete, 
  onBack,
  assessmentScore = 72,
  recommendations = []
}: ProtocolPreviewStepProps) {
  const mockRecommendations = recommendations.length > 0 ? recommendations : [
    {
      category: "Sleep Optimization",
      items: ["Magnesium Glycinate", "Sleep tracking protocol", "Evening routine"],
      priority: "high"
    },
    {
      category: "Cognitive Enhancement",
      items: ["Omega-3 supplementation", "Mental clarity exercises", "Focus techniques"],
      priority: "high"
    },
    {
      category: "Energy & Recovery",
      items: ["CoQ10", "Active recovery days", "Hydration protocol"],
      priority: "medium"
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold">
          <Sparkles className="h-4 w-4" />
          Assessment Complete!
        </div>
        <h2 className="text-3xl font-bold">Your Personalized Protocol Preview</h2>
        <p className="text-muted-foreground">
          Based on your Longevity Impact Score of <span className="font-semibold text-foreground">{assessmentScore}</span>, 
          here's what we recommend focusing on
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Your Protocol is Ready
          </CardTitle>
          <CardDescription>
            We've created a science-backed protocol with {mockRecommendations.length} key focus areas
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {mockRecommendations.map((rec, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rec.category}</CardTitle>
                <Badge variant={rec.priority === 'high' ? 'default' : 'secondary'}>
                  {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {rec.items.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            You'll have full access to your detailed protocol, progress tracking, and AI health assistant in your dashboard
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button size="lg" onClick={onComplete} className="min-w-[200px]">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
