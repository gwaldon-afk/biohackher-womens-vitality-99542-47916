import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";

const MenoMapResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bioScore, setBioScore] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('bio_score');
    if (stored) {
      setBioScore(parseInt(stored));
    }
  }, []);

  const handleContinue = () => {
    if (user) {
      navigate('/onboarding/goal-setup-chat');
    } else {
      navigate('/auth?mode=signup&redirect=/onboarding/goal-setup-chat');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Your Results</h1>
          <p className="text-muted-foreground">Here's your current vitality baseline</p>
        </div>

        <Card className="p-8 space-y-8">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(bioScore / 100) * 553} 553`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold">{bioScore}</span>
                <span className="text-muted-foreground">Bio Score</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Level</span>
                <span className="font-medium">
                  {bioScore < 40 ? 'Getting Started' : bioScore < 70 ? 'Building Momentum' : 'Thriving'}
                </span>
              </div>
              <Progress value={bioScore} className="h-2" />
            </div>

            <p className="text-center text-muted-foreground">
              {bioScore < 40
                ? 'Great start! We\'ll help you build sustainable habits for lasting vitality.'
                : bioScore < 70
                ? 'You\'re making progress! Let\'s optimize your protocol for even better results.'
                : 'Excellent! Let\'s maintain this momentum and keep you thriving.'}
            </p>
          </div>

          {!user && (
            <p className="text-center text-sm text-muted-foreground">
              Create a free account to save your results and get your personalized protocol
            </p>
          )}

          <Button onClick={handleContinue} className="w-full" size="lg">
            {user ? 'Set Your Goals' : 'Create Free Account & Continue'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default MenoMapResults;
