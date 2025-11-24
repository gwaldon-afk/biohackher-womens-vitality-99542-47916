import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Heart, Check, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AssessmentGatewayScreenProps {
  pageName: string;
}

export default function AssessmentGatewayScreen({ pageName }: AssessmentGatewayScreenProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getPageContent = () => {
    switch (pageName) {
      case "today":
        return {
          title: "Your Personalized Daily Plan",
          description: "Get your customized daily protocol with actions, meals, and progress tracking—all tailored to your unique health profile.",
          icon: <Sparkles className="h-16 w-16 text-primary" />,
        };
      case "90-day":
        return {
          title: "Your 90-Day Longevity Roadmap",
          description: "A comprehensive quarterly plan designed to optimize your health across all four pillars: Body, Brain, Beauty, and Balance.",
          icon: <TrendingUp className="h-16 w-16 text-primary" />,
        };
      case "meal-plan":
        return {
          title: "Your 7-Day Meal Plan",
          description: "Personalized weekly meal plans optimized for longevity, with macros tailored to your goals and dietary preferences.",
          icon: <Heart className="h-16 w-16 text-primary" />,
        };
      default:
        return {
          title: "Your Personalized Plan",
          description: "Get customized health plans tailored to your unique profile.",
          icon: <Sparkles className="h-16 w-16 text-primary" />,
        };
    }
  };

  const content = getPageContent();

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-8 text-center space-y-8 border-2 border-primary/20">
        <div className="flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-6">
            {content.icon}
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold gradient-text">{content.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="bg-muted/30 rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">How It Works</h3>
          <div className="grid gap-3 text-left max-w-xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Take Your Health Assessment</p>
                <p className="text-sm text-muted-foreground">Complete one of our science-backed assessments (5-8 minutes)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Get Your Personalized Results</p>
                <p className="text-sm text-muted-foreground">Receive detailed insights and protocol recommendations</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Access Your Personalized Plans</p>
                <p className="text-sm text-muted-foreground">Unlock daily, weekly, and 90-day plans tailored to you</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Start With One of Our Assessments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button 
                variant="outline"
                className="flex-col h-auto py-4 hover:border-primary hover:bg-primary/5"
                onClick={() => navigate('/assessment')}
              >
                <Sparkles className="h-5 w-5 mb-2 text-primary" />
                <div className="font-semibold">LIS Assessment</div>
                <div className="text-xs text-muted-foreground">5 min</div>
              </Button>
              <Button 
                variant="outline"
                className="flex-col h-auto py-4 hover:border-primary hover:bg-primary/5"
                onClick={() => navigate('/longevity-nutrition')}
              >
                <Heart className="h-5 w-5 mb-2 text-primary" />
                <div className="font-semibold">Nutrition</div>
                <div className="text-xs text-muted-foreground">8 min</div>
              </Button>
              <Button 
                variant="outline"
                className="flex-col h-auto py-4 hover:border-primary hover:bg-primary/5"
                onClick={() => navigate('/hormone-compass/assessment')}
              >
                <TrendingUp className="h-5 w-5 mb-2 text-primary" />
                <div className="font-semibold">Hormone Compass</div>
                <div className="text-xs text-muted-foreground">6 min</div>
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">{user ? "Ready to get started?" : "Already have an account?"}</p>
            <Button 
              variant="secondary"
              onClick={() => {
                if (user) {
                  navigate('/dashboard');
                } else {
                  navigate('/auth');
                }
              }}
              className="w-full"
            >
              {user ? 'Go to Dashboard' : 'Sign In'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
