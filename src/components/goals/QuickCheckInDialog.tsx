import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { HealthGoal } from "@/hooks/useGoals";
import { TrendingUp, Zap, Target } from "lucide-react";

interface QuickCheckInDialogProps {
  goal: HealthGoal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const QuickCheckInDialog = ({ goal, open, onOpenChange, onSuccess }: QuickCheckInDialogProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(goal.current_progress || 0);
  const [motivation, setMotivation] = useState(7);
  const [confidence, setConfidence] = useState(7);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    let checkInId: string | null = null;
    
    try {
      // Create check-in
      const { data: checkInData, error: checkInError } = await supabase
        .from('goal_check_ins')
        .insert({
          goal_id: goal.id,
          user_id: goal.user_id,
          progress_percentage: progress,
          motivation_level: motivation,
          confidence_level: confidence,
          whats_working: notes,
          total_metrics: 3,
          metrics_achieved: Math.round((progress / 100) * 3),
        })
        .select('id')
        .single();

      if (checkInError) throw new Error(`Check-in failed: ${checkInError.message}`);
      
      checkInId = checkInData?.id;

      // Update goal progress
      const { error: goalError } = await supabase
        .from('user_health_goals')
        .update({
          current_progress: progress,
          last_check_in_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', goal.id);

      if (goalError) {
        // Rollback check-in if goal update fails
        if (checkInId) {
          await supabase.from('goal_check_ins').delete().eq('id', checkInId);
        }
        throw new Error(`Goal update failed: ${goalError.message}`);
      }

      toast({
        title: "Check-in recorded!",
        description: "Your progress has been updated",
      });

      onSuccess?.();
      onOpenChange(false);
      setNotes("");
    } catch (error: any) {
      console.error('Error creating check-in:', error);
      toast({
        title: "Error",
        description: error?.message || "Could not save check-in",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Check-In</DialogTitle>
          <DialogDescription>
            {goal.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Progress
              </label>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Motivation
              </label>
              <span className="text-sm text-muted-foreground">{motivation}/10</span>
            </div>
            <Slider
              value={[motivation]}
              onValueChange={(value) => setMotivation(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Confidence
              </label>
              <span className="text-sm text-muted-foreground">{confidence}/10</span>
            </div>
            <Slider
              value={[confidence]}
              onValueChange={(value) => setConfidence(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Notes (Optional)</label>
            <Textarea
              placeholder="What's working well? Any challenges?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Check-In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
