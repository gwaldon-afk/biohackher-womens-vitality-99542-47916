import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Brain, Target, CheckCircle2, ChevronRight } from "lucide-react";
import LISInputForm from "./LISInputForm";

interface FirstTimeDailyScoreWelcomeProps {
  children: React.ReactNode;
  onScoreCalculated: () => void;
}

const FirstTimeDailyScoreWelcome = ({ children, onScoreCalculated }: FirstTimeDailyScoreWelcomeProps) => {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleGetStarted = () => {
    setShowForm(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset to intro when closing
      setTimeout(() => setShowForm(false), 300);
    }
  };

  if (showForm) {
    return (
      <LISInputForm onScoreCalculated={onScoreCalculated}>
        {children}
      </LISInputForm>
    );
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer">
        {children}
      </div>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-none p-0">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 rounded-t-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <Badge variant="secondary" className="text-sm">Daily Tracking</Badge>
            </div>
            <h2 className="text-3xl font-bold mb-3">Welcome to Your Daily LIS Score</h2>
            <p className="text-lg text-muted-foreground">
              Your Longevity Impact Score is a simple daily check-in that helps you understand how your lifestyle choices affect your healthspan and lifespan.
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* What You'll Track */}
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                What You'll Track Daily
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { label: "Sleep Quality", desc: "Duration and rest quality" },
                  { label: "Stress Levels", desc: "How calm and balanced you feel" },
                  { label: "Physical Activity", desc: "Movement and exercise" },
                  { label: "Nutrition", desc: "Meal quality and choices" },
                  { label: "Social Connection", desc: "Time with others" },
                  { label: "Mental Wellness", desc: "Learning and mindfulness" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What You'll Get */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  What You'll Get
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      icon: Brain,
                      title: "Personalized Insights",
                      desc: "AI-powered analysis of your health patterns and trends"
                    },
                    {
                      icon: Target,
                      title: "Clear Progress Tracking",
                      desc: "See exactly how your daily habits impact your longevity score"
                    },
                    {
                      icon: TrendingUp,
                      title: "Actionable Recommendations",
                      desc: "Get specific suggestions to improve your healthspan"
                    }
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <benefit.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{benefit.title}</p>
                        <p className="text-xs text-muted-foreground">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Commitment */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <div className="p-2 rounded-full bg-background">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Takes just 2-3 minutes per day</p>
                <p className="text-xs text-muted-foreground">
                  Even faster once you connect a wearable device for automatic tracking
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="w-full text-base"
              onClick={handleGetStarted}
            >
              Submit Your First Daily Score
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your data is private and secure. We'll never share your health information.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FirstTimeDailyScoreWelcome;
