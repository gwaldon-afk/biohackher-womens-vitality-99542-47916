import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DailyMotivationHeader } from "@/components/today/DailyMotivationHeader";
import { UnifiedDailyChecklist } from "@/components/today/UnifiedDailyChecklist";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function MyDailyPlan() {
  const { user } = useAuth();
  const { actions, loading } = useDailyPlan();
  const navigate = useNavigate();

  const hasProtocol = actions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        {/* Hero Header - Always visible */}
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Your Personalized Longevity Protocol</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Today's Biohacking Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Science-backed actions to optimize your healthspan and extend your years of vitality
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {hasProtocol && <DailyMotivationHeader />}
          
          <UnifiedDailyChecklist />

          {/* Action Buttons */}
          {user && hasProtocol && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/my-protocol')}
                className="h-auto py-4"
              >
                <Target className="w-5 h-5 mr-2" />
                View Full Protocol
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/protocol-library')}
                className="h-auto py-4"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Browse Protocol Library
              </Button>
            </div>
          )}

          {/* Guest CTA - Only if no user */}
          {!user && (
            <div className="mt-8 p-8 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center space-y-4">
              <h3 className="text-2xl font-bold">Ready to Unlock Your Full Plan?</h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Create a free account to save your progress, get AI insights, and receive personalized supplement recommendations
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  size="lg"
                  onClick={() => navigate('/auth')}
                  className="text-lg px-8"
                >
                  Create Free Account
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/guest-lis-assessment')}
                  className="text-lg px-8"
                >
                  Take Assessment First
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
