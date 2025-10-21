import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

const GoalAffirmation = () => {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <Card className="p-12 space-y-8 text-center">
          <div className={`transition-all duration-1000 ${animate ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-primary/10 rounded-full animate-pulse">
                <Sparkles className="w-20 h-20 text-primary" />
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4">You're All Set!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your personalized vitality protocol is ready
            </p>

            <div className="space-y-4 text-left bg-muted/50 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <p className="text-muted-foreground">Assessment completed</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <p className="text-muted-foreground">Goals defined</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <p className="text-muted-foreground">Protocol customized</p>
              </div>
            </div>
          </div>

          <Button onClick={() => navigate('/plan-home')} className="w-full" size="lg">
            Start Your Journey
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default GoalAffirmation;
