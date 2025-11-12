import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";

interface AssessmentGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentType: "lis" | "hormone_compass";
  lowestScoringArea: string;
  baselineScore: number;
  onCreateGoal: (goalData: {
    title: string;
    description: string;
    targetScore: number;
    checkInFrequency: string;
    pillarCategory: string;
  }) => void;
}

export function AssessmentGoalDialog({
  open,
  onOpenChange,
  assessmentType,
  lowestScoringArea,
  baselineScore,
  onCreateGoal,
}: AssessmentGoalDialogProps) {
  const [title, setTitle] = useState(`Improve ${lowestScoringArea.charAt(0).toUpperCase() + lowestScoringArea.slice(1)}`);
  const [description, setDescription] = useState("");
  const [targetScore, setTargetScore] = useState(Math.min(baselineScore + 15, 100));
  const [checkInFrequency, setCheckInFrequency] = useState("weekly");

  const handleSubmit = () => {
    onCreateGoal({
      title,
      description,
      targetScore,
      checkInFrequency,
      pillarCategory: assessmentType === "lis" ? lowestScoringArea : "balance",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <Target className="h-6 w-6 text-primary" />
            <DialogTitle>Create Goal from Assessment</DialogTitle>
          </div>
          <DialogDescription>
            Set a health goal based on your {assessmentType === "lis" ? "LIS" : "Hormone Compass"} assessment results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Baseline Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Current {lowestScoringArea.charAt(0).toUpperCase() + lowestScoringArea.slice(1)} Score</p>
              <Badge variant="outline">{baselineScore}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              This was your lowest-scoring area. Let's work on improving it!
            </p>
          </div>

          {/* Goal Title */}
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Improve Sleep Quality"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What specific improvements do you want to see?"
              rows={3}
            />
          </div>

          {/* Target Score */}
          <div>
            <Label htmlFor="target">Target Score</Label>
            <div className="flex items-center gap-3">
              <Input
                id="target"
                type="number"
                min={baselineScore + 1}
                max={100}
                value={targetScore}
                onChange={(e) => setTargetScore(parseInt(e.target.value) || baselineScore + 10)}
              />
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">
                  +{targetScore - baselineScore} improvement
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Realistic goals typically aim for 10-20 point improvements
            </p>
          </div>

          {/* Check-In Frequency */}
          <div>
            <Label htmlFor="frequency">Check-In Frequency</Label>
            <Select value={checkInFrequency} onValueChange={setCheckInFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
