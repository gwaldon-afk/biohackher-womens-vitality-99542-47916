import { Navigation } from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { GoalStatementCard } from "@/components/today/GoalStatementCard";
import { DailyEssentialsCard } from "@/components/today/DailyEssentialsCard";
import { NutritionSummaryCard } from "@/components/today/NutritionSummaryCard";
import { MovementCard } from "@/components/today/MovementCard";
import { SupplementsCard } from "@/components/today/SupplementsCard";
import { SimpleProgressTracker } from "@/components/today/SimpleProgressTracker";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function MyDailyPlan() {
  const { user } = useAuth();
  const { 
    actions, 
    loading, 
    completedCount, 
    totalCount, 
    dailyStreak,
    refetch 
  } = useDailyPlan();

  // Separate actions by type
  const movements = actions.filter(a => 
    a.type === 'protocol' && (a.title.toLowerCase().includes('exercise') || a.title.toLowerCase().includes('workout') || a.title.toLowerCase().includes('walk'))
  );
  
  const supplements = actions.filter(a => 
    a.type === 'protocol' && (a.title.toLowerCase().includes('supplement') || a.title.toLowerCase().includes('vitamin'))
  );

  // Calculate estimated time remaining
  const remainingActions = actions.filter(a => !a.completed);
  const estimatedMinutesRemaining = remainingActions.reduce((sum, action) => sum + action.estimatedMinutes, 0);

  const handleToggleAction = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      if (action.type === 'protocol' && action.protocolItemId) {
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          // Remove completion
          await supabase
            .from('protocol_item_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('protocol_item_id', action.protocolItemId)
            .eq('completed_date', today);
        } else {
          // Add completion
          await supabase
            .from('protocol_item_completions')
            .insert({
              user_id: user.id,
              protocol_item_id: action.protocolItemId,
              completed_date: today
            });
          
          toast.success("Great work!");
        }
        
        refetch();
      }
    } catch (error) {
      console.error('Error toggling action:', error);
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
          <p className="text-center text-muted-foreground">Loading your daily plan...</p>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">My Daily Plan</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-6">
          {/* Goal Statement */}
          <GoalStatementCard />

          {/* Daily Essentials */}
          <DailyEssentialsCard />

          {/* Today's Nutrition */}
          <NutritionSummaryCard />

          {/* Movement & Activities */}
          <MovementCard 
            movements={movements}
            onToggle={handleToggleAction}
          />

          {/* Supplements */}
          <SupplementsCard 
            supplements={supplements}
            onToggle={handleToggleAction}
          />

          {/* Progress Tracker */}
          <SimpleProgressTracker 
            completedCount={completedCount}
            totalCount={totalCount}
            estimatedMinutesRemaining={estimatedMinutesRemaining}
            dailyStreak={dailyStreak}
          />
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
