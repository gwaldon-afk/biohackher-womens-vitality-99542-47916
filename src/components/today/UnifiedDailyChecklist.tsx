import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { CategoryBlock } from "@/components/today/CategoryBlock";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";
import { SAMPLE_DAILY_ACTIONS, SAMPLE_GOALS } from "@/data/sampleDailyPlan";
import { useState } from "react";
import { getTodaysQuote } from "@/data/femaleLongevityQuotes";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useCart } from "@/hooks/useCart";
import { LISImpactPreview } from "@/components/today/LISImpactPreview";
import { useLISData } from "@/hooks/useLISData";
import { NutritionScorecardWidget } from "@/components/today/NutritionScorecardWidget";
import { MealDetailModal } from "@/components/today/MealDetailModal";
import { ProteinTrackingSummary } from "@/components/today/ProteinTrackingSummary";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import { DailyEssentialsCard } from "@/components/today/DailyEssentialsCard";

export const UnifiedDailyChecklist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { addToCart } = useCart();
  const { actions: userActions, loading, completedCount: userCompletedCount, totalCount: userTotalCount, refetch } = useDailyPlan();
  const { currentScore: sustainedLIS } = useLISData();
  const { preferences: nutritionPrefs } = useNutritionPreferences();
  
  const isUsingSampleData = !loading && userActions.length === 0;
  const actions = isUsingSampleData ? SAMPLE_DAILY_ACTIONS : userActions;
  const [sampleCompletedIds, setSampleCompletedIds] = useState<Set<string>>(new Set());
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  
  const totalCount = isUsingSampleData ? SAMPLE_DAILY_ACTIONS.length : userTotalCount;
  const completedCount = isUsingSampleData ? sampleCompletedIds.size : userCompletedCount;
  
  const todaysQuote = getTodaysQuote();
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleToggle = async (actionId: string) => {
    if (isUsingSampleData) {
      setSampleCompletedIds(prev => {
        const next = new Set(prev);
        if (next.has(actionId)) {
          next.delete(actionId);
        } else {
          next.add(actionId);
        }
        return next;
      });
      return;
    }

    const action = userActions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      // Handle meal completion
      if (action.type === 'meal' && action.mealType && action.mealData) {
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          await supabase
            .from('meal_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('meal_type', action.mealType)
            .eq('completed_date', today);
        } else {
          await supabase
            .from('meal_completions')
            .insert({
              user_id: user.id,
              meal_type: action.mealType,
              completed_date: today,
              meal_name: action.mealData.name,
              calories: action.mealData.calories,
              protein: action.mealData.protein,
            });
          toast.success("Meal logged!");
        }
        
        refetch();
      }
      // Handle protocol item completion
      else if (action.type === 'protocol' && 'protocolItemId' in action && action.protocolItemId) {
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          await supabase
            .from('protocol_item_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('protocol_item_id', action.protocolItemId)
            .eq('completed_date', today);
        } else {
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

  const handleBuySupplements = (action: any) => {
    // Mock supplement product for cart
    addToCart({
      id: `supplement-${action.id}`,
      name: action.title,
      price: 45.00,
      originalPrice: 65.00,
      image: '/placeholder.svg',
      brand: 'Longevity Labs',
      dosage: 'Daily',
      quantity: 1
    });
    toast.success("Added to cart!");
  };

  // Helper to check if current time period matches
  const isCurrentPeriod = (period: 'morning' | 'afternoon' | 'evening'): boolean => {
    const hour = new Date().getHours();
    if (period === 'morning') return hour >= 6 && hour < 12;
    if (period === 'afternoon') return hour >= 12 && hour < 17;
    if (period === 'evening') return hour >= 17 && hour < 22;
    return false;
  };

  // Categorize actions by time of day
  const categorizeByTime = () => {
    const currentHour = new Date().getHours();
    
    const morning = actions.filter((a: any) => {
      // Morning: 6am-12pm
      if (a.timeOfDay?.includes('morning')) return true;
      if (a.mealType === 'breakfast') return true;
      if (a.itemType === 'supplement' && !a.timeOfDay) return true; // Default supplements to morning
      return false;
    });

    const afternoon = actions.filter((a: any) => {
      // Afternoon: 12pm-5pm
      if (a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday')) return true;
      if (a.mealType === 'lunch') return true;
      if (a.itemType === 'exercise' && !a.timeOfDay) return true; // Default exercise to afternoon
      return false;
    });

    const evening = actions.filter((a: any) => {
      // Evening: 5pm-10pm
      if (a.timeOfDay?.includes('evening')) return true;
      if (a.mealType === 'dinner') return true;
      if (a.itemType === 'therapy' && !a.timeOfDay) return true; // Default therapy to evening
      return false;
    });

    // "Still To Do" = incomplete actions from past time blocks
    const stillToDo = actions.filter((a: any) => {
      if (a.completed) return false; // Only incomplete actions
      
      // Determine if action is "past due"
      const isMorningAction = morning.some(m => m.id === a.id);
      const isAfternoonAction = afternoon.some(m => m.id === a.id);
      
      // If it's currently evening, show incomplete morning/afternoon actions
      if (currentHour >= 17) {
        return isMorningAction || isAfternoonAction;
      }
      // If it's currently afternoon, show incomplete morning actions
      if (currentHour >= 12) {
        return isMorningAction;
      }
      
      return false;
    });

    // Remove "Still To Do" items from their original time blocks
    const stillToDoIds = new Set(stillToDo.map(a => a.id));
    
    return {
      morning: morning.filter(a => !stillToDoIds.has(a.id)),
      afternoon: afternoon.filter(a => !stillToDoIds.has(a.id)),
      evening: evening.filter(a => !stillToDoIds.has(a.id)),
      stillToDo
    };
  };

  const timeBlocks = categorizeByTime();

  const getItemCompleted = (actionId: string) => {
    if (isUsingSampleData) {
      return sampleCompletedIds.has(actionId);
    }
    return actions.find(a => a.id === actionId)?.completed || false;
  };

  const getCategoryStats = (items: any[]) => {
    const completed = items.filter(a => getItemCompleted(a.id)).length;
    const total = items.length;
    const minutes = items.reduce((sum, a) => sum + (a.estimatedMinutes || 0), 0);
    return { completed, total, minutes };
  };

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const displayGoals = isUsingSampleData ? SAMPLE_GOALS : activeGoals;

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p>Loading your daily plan...</p>
        </div>
      </div>
    );
  }

  // Show message when user has no active protocol items
  if (user && !loading && actions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-foreground">No Active Protocol Items</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your protocol items are currently inactive. Activate them to see your daily plan.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/my-protocol')}
            className="mt-4"
          >
            Manage Your Protocol
          </Button>
        </div>
      </div>
    );
  }

  const handleViewMeal = (action: any) => {
    setSelectedMeal({ ...action.mealData, mealType: action.mealType });
    setMealModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date & Quote Header */}
      <div className="space-y-4 pb-6 border-b-2 border-primary/20">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          TODAY - {dateString}
        </h1>
        {/* Motivational Quote - Compact */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary/70 to-secondary/70 p-4 shadow-md">
          <div className="relative flex items-center gap-3 text-center justify-center">
            <span className="text-3xl">💫</span>
            <div>
              <p className="text-xl font-semibold text-foreground italic leading-tight">
                "{todaysQuote.quote}"
              </p>
              <p className="text-sm text-foreground/80 mt-1">
                — {todaysQuote.author}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      {displayGoals.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">
            YOUR GOALS TODAY
          </h2>
          {displayGoals.map(goal => {
            const daysSinceStart = isUsingSampleData 
              ? goal.days_active 
              : Math.floor((Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24));
            const progress = isUsingSampleData 
              ? goal.progress_percentage 
              : Math.min(Math.round((daysSinceStart / 90) * 100), 100);
            
            return (
              <div key={goal.id} className="flex items-start gap-2">
                <Checkbox checked={progress >= 50} className="mt-1" disabled />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {goal.title} - Day {daysSinceStart}/90 ({progress}% complete)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Daily Essentials */}
      <div className="pb-6">
        <DailyEssentialsCard />
      </div>

      {/* LIS Impact & Biological Age Prediction */}
      <div className="pb-6">
        <LISImpactPreview 
          completedCount={completedCount}
          totalCount={totalCount}
          sustainedLIS={sustainedLIS}
          currentAge={42}
        />
      </div>

      {/* Nutrition Scorecard Widget */}
      {user && (
        <div className="pb-6">
          <NutritionScorecardWidget />
        </div>
      )}

      {/* Progress Summary */}
      <div className="space-y-2 pb-6 border-b-2 border-primary/20">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            Progress: {completedCount}/{totalCount} actions complete
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Protocol Management Link */}
      {user && actions.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
          <div className="flex flex-col">
            <p className="font-semibold text-foreground">From Your Active Protocol</p>
            <p className="text-sm text-muted-foreground">View and edit your supplements, meal plans, and routines</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/my-protocol')}
            className="shrink-0"
          >
            Manage Protocol
          </Button>
        </div>
      )}

      {/* Time-Based Sections */}
      <div className="space-y-4">
        {/* Morning Block */}
        <CategoryBlock
          icon="☀️"
          title="DO THIS NOW (Morning)"
          items={timeBlocks.morning}
          completedCount={getCategoryStats(timeBlocks.morning).completed}
          totalCount={getCategoryStats(timeBlocks.morning).total}
          totalMinutes={getCategoryStats(timeBlocks.morning).minutes}
          color="yellow"
          defaultExpanded={isCurrentPeriod('morning')}
          timeContext={isCurrentPeriod('morning') ? 'now' : 'later'}
          onToggle={handleToggle}
          getItemCompleted={getItemCompleted}
          onBuySupplements={handleBuySupplements}
          onViewMeal={handleViewMeal}
          isUsingSampleData={isUsingSampleData}
          user={user}
          onNavigate={() => navigate('/auth')}
        />

        {/* Afternoon Block */}
        <CategoryBlock
          icon="🌤️"
          title="COMING UP (Afternoon)"
          items={timeBlocks.afternoon}
          completedCount={getCategoryStats(timeBlocks.afternoon).completed}
          totalCount={getCategoryStats(timeBlocks.afternoon).total}
          totalMinutes={getCategoryStats(timeBlocks.afternoon).minutes}
          color="blue"
          defaultExpanded={isCurrentPeriod('afternoon')}
          timeContext={isCurrentPeriod('afternoon') ? 'now' : isCurrentPeriod('morning') ? 'upcoming' : 'later'}
          onToggle={handleToggle}
          getItemCompleted={getItemCompleted}
          onBuySupplements={handleBuySupplements}
          onViewMeal={handleViewMeal}
          isUsingSampleData={isUsingSampleData}
          user={user}
          onNavigate={() => navigate('/auth')}
        />

        {/* Evening Block */}
        <CategoryBlock
          icon="🌅"
          title="TONIGHT (Evening)"
          items={timeBlocks.evening}
          completedCount={getCategoryStats(timeBlocks.evening).completed}
          totalCount={getCategoryStats(timeBlocks.evening).total}
          totalMinutes={getCategoryStats(timeBlocks.evening).minutes}
          color="purple"
          defaultExpanded={isCurrentPeriod('evening')}
          timeContext={isCurrentPeriod('evening') ? 'now' : 'later'}
          onToggle={handleToggle}
          getItemCompleted={getItemCompleted}
          onBuySupplements={handleBuySupplements}
          onViewMeal={handleViewMeal}
          isUsingSampleData={isUsingSampleData}
          user={user}
          onNavigate={() => navigate('/auth')}
        />

        {/* Still To Do - Only if incomplete past items exist */}
        {timeBlocks.stillToDo.length > 0 && (
          <CategoryBlock
            icon="⏰"
            title="STILL TO DO (From Earlier)"
            items={timeBlocks.stillToDo}
            completedCount={getCategoryStats(timeBlocks.stillToDo).completed}
            totalCount={getCategoryStats(timeBlocks.stillToDo).total}
            totalMinutes={getCategoryStats(timeBlocks.stillToDo).minutes}
            color="red"
            defaultExpanded={false}
            isPastDue={true}
            onToggle={handleToggle}
            getItemCompleted={getItemCompleted}
            onBuySupplements={handleBuySupplements}
            onViewMeal={handleViewMeal}
            isUsingSampleData={isUsingSampleData}
            user={user}
            onNavigate={() => navigate('/auth')}
          />
        )}
      </div>

      {/* Guest CTA */}
      {!user && (
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground">Ready to Unlock Your Personalized Plan?</h3>
          <p className="text-muted-foreground">
            Create a free account to save progress, get AI insights, and access personalized protocols
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/guest-lis-assessment')}>
              Take Assessment First
            </Button>
          </div>
        </div>
      )}

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          open={mealModalOpen}
          onOpenChange={setMealModalOpen}
          meal={selectedMeal}
          mealType={selectedMeal.mealType || 'meal'}
        />
      )}
    </div>
  );
};