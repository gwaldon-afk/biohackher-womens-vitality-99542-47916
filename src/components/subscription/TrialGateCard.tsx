import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TrialGateCardProps = {
  onStartTrial?: () => void;
  onKeepExploring?: () => void;
};

export const TrialGateCard = ({ onStartTrial, onKeepExploring }: TrialGateCardProps) => {
  const navigate = useNavigate();

  const handleStartTrial = onStartTrial ?? (() => navigate("/upgrade"));
  const handleKeepExploring = onKeepExploring ?? (() => navigate("/biohacking-toolkit"));

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-6 text-center space-y-4">
      <h2 className="text-2xl font-bold">Ready to personalise your plan?</h2>
      <p className="text-muted-foreground">
        Start your 7-day free trial to unlock detailed protocols, your 7-day plan, and daily tracking.
      </p>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={handleStartTrial}>
          Start 7-day free trial
        </Button>
        <Button variant="ghost" onClick={handleKeepExploring}>
          Keep exploring
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        You’ll only be charged after the trial ends. Cancel anytime.
      </p>
    </Card>
  );
};
