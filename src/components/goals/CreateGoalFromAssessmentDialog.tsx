import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Target, Calendar, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface CreateGoalFromAssessmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentType: 'lis' | 'hormone_compass';
  assessmentData: {
    score?: number;
    lowestPillar?: string;
    lowestScore?: number;
    healthLevel?: string;
    lowestDomains?: Array<{ name: string; score: number }>;
  };
}

export const CreateGoalFromAssessmentDialog = ({
  open,
  onOpenChange,
  assessmentType,
  assessmentData,
}: CreateGoalFromAssessmentDialogProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Generate suggested goal based on assessment type
  const getSuggestedGoal = () => {
    if (assessmentType === 'lis') {
      const pillar = assessmentData.lowestPillar || 'overall health';
      const score = assessmentData.lowestScore || 0;
      return {
        title: `Improve ${pillar} Score`,
        description: `Based on your LIS assessment, your ${pillar} pillar scored ${score}/10. This goal will help you improve this area through targeted protocols and daily actions.`,
        targetMetric: `Increase ${pillar} score by 2 points`,
      };
    } else {
      const healthLevel = assessmentData.healthLevel || 'hormone health';
      const lowestDomain = assessmentData.lowestDomains?.[0]?.name || 'hormone balance';
      return {
        title: `Optimize ${lowestDomain}`,
        description: `Your Hormone Compass assessment shows you're "${healthLevel}". This goal focuses on improving ${lowestDomain} through evidence-based protocols.`,
        targetMetric: `Improve ${lowestDomain} symptoms by 50%`,
      };
    }
  };

  const suggested = getSuggestedGoal();
  const [goalTitle, setGoalTitle] = useState(suggested.title);
  const [goalDescription, setGoalDescription] = useState(suggested.description);
  const [targetMetric, setTargetMetric] = useState(suggested.targetMetric);

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Store goal context in sessionStorage for the wizard
      sessionStorage.setItem('goal_from_assessment', JSON.stringify({
        title: goalTitle,
        description: goalDescription,
        targetMetric: targetMetric,
        assessmentType,
        assessmentData,
      }));

      toast.success("Navigating to goal creation...");
      onOpenChange(false);
      
      // Navigate to manual goal wizard with pre-filled data
      navigate('/my-goals/wizard-manual');
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to proceed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <DialogTitle>Create Goal from Assessment</DialogTitle>
          </div>
          <DialogDescription>
            Turn your assessment results into a trackable 90-day goal with automatic protocol recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* AI-suggested notice */}
          <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">AI-Generated Goal Suggestion</p>
              <p className="text-xs text-muted-foreground">
                We've pre-filled this goal based on your {assessmentType === 'lis' ? 'LIS' : 'Hormone Compass'} assessment results. 
                Feel free to customize it to match your personal objectives.
              </p>
            </div>
          </div>

          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="goal-title" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goal Title
            </Label>
            <Input
              id="goal-title"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="E.g., Improve Sleep Quality"
              maxLength={100}
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <Label htmlFor="goal-description">Description</Label>
            <Textarea
              id="goal-description"
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Describe what you want to achieve..."
              rows={4}
              maxLength={500}
            />
          </div>

          {/* Target Metric */}
          <div className="space-y-2">
            <Label htmlFor="target-metric" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Target Metric
            </Label>
            <Input
              id="target-metric"
              value={targetMetric}
              onChange={(e) => setTargetMetric(e.target.value)}
              placeholder="E.g., Sleep 7-8 hours per night"
              maxLength={150}
            />
          </div>

          {/* Timeline info */}
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">90-Day Timeline</p>
              <p className="text-xs text-muted-foreground">
                Your goal will be tracked over 90 days with weekly check-ins and progress monitoring.
              </p>
            </div>
          </div>

          {/* Protocol linking info */}
          <div className="flex items-start gap-3 p-3 bg-secondary/10 rounded-lg border border-secondary/20">
            <Target className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Automatic Protocol Integration</p>
              <p className="text-xs text-muted-foreground">
                Protocols recommended from your assessment will be automatically linked to this goal. 
                Completing protocol actions will contribute to your goal progress.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={loading || !goalTitle.trim()}
          >
            {loading ? "Creating..." : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
