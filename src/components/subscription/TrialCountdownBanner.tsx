import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialCountdownBanner() {
  const navigate = useNavigate();
  const { subscription, isTrialing, getDaysRemainingInTrial } = useSubscription();
  const daysRemaining = getDaysRemainingInTrial();

  const trialEndDateKey = subscription?.trial_end_date || "";
  const dismissKey = useMemo(() => `trial_end_prompt_dismissed_${trialEndDateKey}`, [trialEndDateKey]);
  const [showEndingDialog, setShowEndingDialog] = useState(false);

  useEffect(() => {
    if (!isTrialing()) return;
    if (!subscription?.trial_end_date) return;
    if (daysRemaining > 1) return;

    const dismissed = localStorage.getItem(dismissKey);
    if (!dismissed) {
      setShowEndingDialog(true);
    }
  }, [daysRemaining, dismissKey, isTrialing, subscription?.trial_end_date]);

  if (!isTrialing() || daysRemaining <= 0) return null;

  return (
    <>
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-start gap-3">
            <Badge variant="secondary">Trial</Badge>
            <div>
              <div className="font-medium">Your free trial is active</div>
              <div className="text-sm text-muted-foreground">
                {daysRemaining === 1 ? "1 day remaining." : `${daysRemaining} days remaining.`} Upgrade any time to keep full access.
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/upgrade")}>View plans</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEndingDialog} onOpenChange={setShowEndingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your trial is ending</DialogTitle>
            <DialogDescription>
              Your trial ends {daysRemaining === 1 ? "tomorrow" : "today"}. Upgrade to keep uninterrupted access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => navigate("/upgrade")}>Upgrade now</Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem(dismissKey, "true");
                setShowEndingDialog(false);
              }}
            >
              Remind me later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

