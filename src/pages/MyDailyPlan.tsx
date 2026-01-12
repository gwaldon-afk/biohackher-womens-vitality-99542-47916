import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { UnifiedDailyChecklist } from "@/components/today/UnifiedDailyChecklist";
import { FirstTimeUserTourModal } from "@/components/onboarding/FirstTimeUserTourModal";
import { OnboardingGoalPrompt } from "@/components/onboarding/OnboardingGoalPrompt";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";
import { TrialCountdownBanner } from "@/components/subscription/TrialCountdownBanner";

export default function MyDailyPlan() {
  const { user } = useAuth();
  const { goals } = useGoals();
  const [showTour, setShowTour] = useState(false);
  const [showGoalPrompt, setShowGoalPrompt] = useState(false);
  const [lowestPillars, setLowestPillars] = useState<{ pillar: string; score: number }[]>([]);

  useEffect(() => {
    const isFirstTime = localStorage.getItem('first_time_user') === 'true';
    if (isFirstTime) {
      setShowTour(true);
    }
  }, []);

  // Check if we should show goal prompt
  useEffect(() => {
    const checkGoalPrompt = async () => {
      if (!user) return;
      
      // Don't show if already dismissed
      const dismissed = localStorage.getItem('onboarding_goal_dismissed');
      const completed = localStorage.getItem('onboarding_goal_completed');
      if (dismissed || completed) return;
      
      // Don't show if user already has active goals
      const activeGoals = goals?.filter(g => g.status === 'active') || [];
      if (activeGoals.length > 0) return;
      
      // Check if user has completed at least one assessment
      const { data: progress } = await supabase
        .from('assessment_progress')
        .select('lis_completed, nutrition_completed, hormone_completed')
        .eq('user_id', user.id)
        .maybeSingle();
      
      const hasCompletedAssessment = progress?.lis_completed || progress?.nutrition_completed || progress?.hormone_completed;
      
      if (hasCompletedAssessment) {
        // Get lowest scoring pillars from latest LIS
        const { data: latestLIS } = await supabase
          .from('daily_scores')
          .select('sleep_score, stress_score, nutrition_score, physical_activity_score, social_connections_score, cognitive_engagement_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (latestLIS) {
          const pillars = [
            { pillar: 'balance', score: latestLIS.sleep_score || 50 },
            { pillar: 'balance', score: latestLIS.stress_score || 50 },
            { pillar: 'body', score: latestLIS.nutrition_score || 50 },
            { pillar: 'body', score: latestLIS.physical_activity_score || 50 },
            { pillar: 'brain', score: latestLIS.cognitive_engagement_score || 50 }
          ].sort((a, b) => a.score - b.score).slice(0, 2);
          
          setLowestPillars(pillars);
        }
        
        setShowGoalPrompt(true);
      }
    };
    
    checkGoalPrompt();
  }, [user, goals]);

  const handleTourComplete = () => {
    localStorage.removeItem('first_time_user');
    setShowTour(false);
  };

  const handleGoalPromptClose = () => {
    setShowGoalPrompt(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        <TrialCountdownBanner />
        <UnifiedDailyChecklist />
      </main>
      <MobileBottomNav />
      <FirstTimeUserTourModal isOpen={showTour} onComplete={handleTourComplete} />
      <OnboardingGoalPrompt 
        isOpen={showGoalPrompt} 
        onClose={handleGoalPromptClose}
        lowestPillars={lowestPillars}
      />
    </div>
  );
}
