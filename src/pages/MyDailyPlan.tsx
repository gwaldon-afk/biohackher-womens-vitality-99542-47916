import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DailyMotivationHeader } from "@/components/today/DailyMotivationHeader";
import { UnifiedDailyChecklist } from "@/components/today/UnifiedDailyChecklist";
import { ProtocolGenerationPrompt } from "@/components/ProtocolGenerationPrompt";
import { useAssessmentCompletions } from "@/hooks/useAssessmentCompletions";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export default function MyDailyPlan() {
  const { actions, loading } = useDailyPlan();
  const { completions } = useAssessmentCompletions();

  const assessmentsCompleted = useMemo(() => {
    if (!completions) return 0;
    return Object.values(completions).filter(c => c.completed).length;
  }, [completions]);

  const hasNoProtocol = actions.length === 0 && !loading;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        <div className="space-y-6">
          {hasNoProtocol && assessmentsCompleted > 0 && (
            <ProtocolGenerationPrompt 
              assessmentsCompleted={assessmentsCompleted}
              onGenerate={() => {}}
            />
          )}

          <DailyMotivationHeader />
          <UnifiedDailyChecklist />

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/my-protocol'}
              className="flex-1"
            >
              View Full Protocol
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/protocol-library'}
              className="flex-1"
            >
              Browse Library
            </Button>
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
