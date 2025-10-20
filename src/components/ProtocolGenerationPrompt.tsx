import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";
import { useProtocolGeneration } from "@/hooks/useProtocolGeneration";
import { useNavigate } from "react-router-dom";

interface ProtocolGenerationPromptProps {
  assessmentsCompleted: number;
  onGenerate?: () => void;
}

export const ProtocolGenerationPrompt = ({ 
  assessmentsCompleted,
  onGenerate 
}: ProtocolGenerationPromptProps) => {
  const { generateProtocolFromAssessments, loading } = useProtocolGeneration();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    await generateProtocolFromAssessments();
    onGenerate?.();
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Protocol Ready</CardTitle>
        </div>
        <CardDescription>
          You've completed {assessmentsCompleted} assessment{assessmentsCompleted !== 1 ? 's' : ''}. 
          Generate a personalized daily protocol based on your results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
          <p>
            Our AI will analyze your assessment scores and create a targeted protocol with 
            supplements, habits, and activities to optimize your health.
          </p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            "Generating Protocol..."
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate My Protocol
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};