import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const BaselineReassessmentPrompt = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkReassessmentDue();
    }
  }, [user]);

  const checkReassessmentDue = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('baseline_assessment_schedule')
        .select('*')
        .eq('user_id', user.id)
        .lte('next_prompt_date', today)
        .eq('prompt_dismissed', false)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setShow(true);
        setScheduleId(data.id);
      }
    } catch (error) {
      console.error('Error checking reassessment schedule:', error);
    }
  };

  const handleStartReassessment = () => {
    navigate('/lis-assessment?mode=reassessment');
  };

  const handleDismiss = async () => {
    if (!scheduleId) return;

    try {
      // Set next prompt date to 7 days from now
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);

      await supabase
        .from('baseline_assessment_schedule')
        .update({ 
          prompt_dismissed: true,
          next_prompt_date: nextDate.toISOString().split('T')[0]
        })
        .eq('id', scheduleId);

      setShow(false);
      toast({
        title: "Reminder set",
        description: "We'll remind you again in 7 days",
      });
    } catch (error) {
      console.error('Error dismissing prompt:', error);
    }
  };

  const handleSkip = async () => {
    if (!scheduleId) return;

    try {
      // Set next prompt date to 90 days from now
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 90);

      await supabase
        .from('baseline_assessment_schedule')
        .update({ 
          prompt_dismissed: true,
          next_prompt_date: nextDate.toISOString().split('T')[0]
        })
        .eq('id', scheduleId);

      setShow(false);
      toast({
        title: "Skipped",
        description: "We'll remind you next quarter",
      });
    } catch (error) {
      console.error('Error skipping prompt:', error);
    }
  };

  if (!show) return null;

  return (
    <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              Time for Your Quarterly Baseline Update
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              It's been 3 months since your last baseline assessment. 
              Update your lifestyle profile to track long-term changes.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button onClick={handleStartReassessment}>
                Update Baseline
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Remind Me Later
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip This Quarter
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
