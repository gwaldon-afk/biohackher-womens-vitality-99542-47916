import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Lock, Utensils, Calendar, ChevronRight } from "lucide-react";
import { CategoryBlock } from "@/components/today/CategoryBlock";
import { CategoryCardGrid, CategoryCardData } from "@/components/today/CategoryCardGrid";
import { CategoryDrawer } from "@/components/today/CategoryDrawer";
import { NutritionActionCard } from "@/components/today/NutritionActionCard";
import { DailyPlanFilters, ViewByFilter, StatusFilter } from "@/components/today/DailyPlanFilters";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";
import { SAMPLE_DAILY_ACTIONS, SAMPLE_GOALS } from "@/data/sampleDailyPlan";
import { useState, useEffect } from "react";
import { getTodaysQuote } from "@/data/femaleLongevityQuotes";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useCart } from "@/hooks/useCart";
import { LISImpactPreview } from "@/components/today/LISImpactPreview";
import { useLISData } from "@/hooks/useLISData";
import { NutritionScorecardWidget } from "@/components/today/NutritionScorecardWidget";
import { MealDetailModal } from "@/components/today/MealDetailModal";
import { ExerciseDetailModal } from "@/components/today/ExerciseDetailModal";
import { ProteinTrackingSummary } from "@/components/today/ProteinTrackingSummary";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import { DailyHealthMetricsCard } from "@/components/today/DailyHealthMetricsCard";
import { TodayGoalProgressCard } from "@/components/today/TodayGoalProgressCard";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodaysNutritionActions, completeNutritionAction, uncompleteNutritionAction } from '@/services/nutritionActionService';
import { useTranslation } from 'react-i18next';
import { calculateAdherenceScore, persistAdherenceScore } from '@/services/adherenceScoreService';

const TAP_HINT_KEY = 'today_row_tap_hint_shown';
const FILTER_VIEW_KEY = 'today_filter_view';
const FILTER_STATUS_KEY = 'today_filter_status';

export const UnifiedDailyChecklist = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { goals } = useGoals();
  const { addToCart } = useCart();
  const { actions: userActions, loading, completedCount: userCompletedCount, totalCount: userTotalCount, refetch } = useDailyPlan();
  const { currentScore: sustainedLIS, refetch: refetchLIS } = useLISData();
  const { preferences: nutritionPrefs, isLoading: nutritionLoading } = useNutritionPreferences();
  const hasMealPlan = nutritionPrefs?.selectedMealPlanTemplate;
  
  // Adherence state
  const [adherencePercent, setAdherencePercent] = useState<number | null>(null);
  
  // First-visit tap hint state
  const [showTapHint, setShowTapHint] = useState(false);
  
  // Filter state with localStorage persistence
  const [viewBy, setViewBy] = useState<ViewByFilter>(() => {
    const saved = localStorage.getItem(FILTER_VIEW_KEY);
    return (saved as ViewByFilter) || 'time';
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    const saved = localStorage.getItem(FILTER_STATUS_KEY);
    return (saved as StatusFilter) || 'all';
  });
  
  // Persist filter preferences
  useEffect(() => {
    localStorage.setItem(FILTER_VIEW_KEY, viewBy);
  }, [viewBy]);
  
  useEffect(() => {
    localStorage.setItem(FILTER_STATUS_KEY, statusFilter);
  }, [statusFilter]);
  
  // Fetch nutrition actions
  const { data: nutritionActions = [] } = useQuery({
    queryKey: ['nutrition-actions', user?.id, new Date().toISOString().split('T')[0]],
    queryFn: () => getTodaysNutritionActions(user!.id),
    enabled: !!user?.id,
  });

  // Mutation for completing nutrition actions
  const completeActionMutation = useMutation({
    mutationFn: ({ actionId, completed }: { actionId: string; completed: boolean }) => {
      const today = new Date().toISOString().split('T')[0];
      return completed 
        ? uncompleteNutritionAction(user!.id, actionId, today)
        : completeNutritionAction(user!.id, actionId, today);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition-actions'] });
      toast.success(t('today.nutrition.actionUpdated'));
    },
  });
  
  const isUsingSampleData = !loading && userActions.length === 0;
  const actions = isUsingSampleData ? SAMPLE_DAILY_ACTIONS : userActions;
  const [sampleCompletedIds, setSampleCompletedIds] = useState<Set<string>>(new Set());
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [mealModalOpen, setMealModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  
  // State for category card grid drawer
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  
  const totalCount = isUsingSampleData ? SAMPLE_DAILY_ACTIONS.length : userTotalCount;
  const completedCount = isUsingSampleData ? sampleCompletedIds.size : userCompletedCount;
  
  const todaysQuote = getTodaysQuote();
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Calculate and persist adherence when actions change
  useEffect(() => {
    if (user && !isUsingSampleData && userActions.length > 0) {
      const adherence = calculateAdherenceScore(userActions);
      setAdherencePercent(adherence);
      
      // Persist to database (debounced via service) - pass refetchLIS for UI refresh after LIS recalc
      persistAdherenceScore(user.id, adherence, refetchLIS).catch(console.error);
    }
  }, [user, isUsingSampleData, userActions, userCompletedCount, refetchLIS]);

  // Show first-visit tap hint
  useEffect(() => {
    const hasSeenHint = localStorage.getItem(TAP_HINT_KEY);
    if (!hasSeenHint && actions.length > 0) {
      setShowTapHint(true);
      // Show toast with hint
      toast.info(t('today.hints.tapForDetails'), {
        duration: 5000,
        onDismiss: () => {
          localStorage.setItem(TAP_HINT_KEY, 'true');
          setShowTapHint(false);
        },
        onAutoClose: () => {
          localStorage.setItem(TAP_HINT_KEY, 'true');
          setShowTapHint(false);
        }
      });
      localStorage.setItem(TAP_HINT_KEY, 'true');
    }
  }, [actions.length, t]);

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
          toast.success(t('today.toasts.mealLogged'));
        }
        
        refetch();
        refetchLIS();
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
          toast.success(t('today.toasts.greatWork'));
        }
        
        refetch();
        refetchLIS();
      }
      // Handle essential (habit) completion
      else if (action.type === 'habit' && action.id.startsWith('essential-')) {
        const essentialId = action.id.replace('essential-', '');
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          await supabase
            .from('daily_essentials_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('essential_id', essentialId)
            .eq('date', today);
        } else {
          await supabase
            .from('daily_essentials_completions')
            .insert({
              user_id: user.id,
              essential_id: essentialId,
              date: today
            });
          toast.success(t('today.essentials.completed'));
        }
        
        refetch();
      }
      // Handle workout (exercise program) completion
      else if (action.type === 'workout' && action.workoutData) {
        const today = new Date().toISOString().split('T')[0];
        const { programKey, weekNumber, dayNumber } = action.workoutData;
        
        if (action.completed) {
          // Delete the completion record
          await (supabase
            .from('exercise_workout_completions' as any)
            .delete()
            .eq('user_id', user.id)
            .eq('program_key', programKey)
            .eq('workout_date', today) as any);
        } else {
          // Insert completion record
          await (supabase
            .from('exercise_workout_completions' as any)
            .insert({
              user_id: user.id,
              program_key: programKey,
              week_number: weekNumber,
              day_number: dayNumber,
              workout_date: today,
              completed_at: new Date().toISOString()
            }) as any);
          toast.success(t('today.toasts.workoutCompleted'));
        }
        
        refetch();
        refetchLIS();
      }
    } catch (error) {
      console.error('Error toggling action:', error);
      toast.error(t('today.toasts.failedUpdate'));
    }
  };

  const handleBuySupplements = (action: any) => {
    // Navigate to shop with supplement name as search query
    navigate(`/shop?search=${encodeURIComponent(action.title)}`);
  };

  // Handle row click for navigation to details
  const handleRowClick = (action: any) => {
    if (action.type === 'meal' && action.mealData) {
      handleViewMeal(action);
    } else if (action.itemType === 'exercise' || action.category === 'exercise') {
      handleViewExercise(action);
    } else if (action.type === 'goal' && action.goalId) {
      navigate('/my-goals');
    }
    // Removed auto-navigation to /my-protocol on protocol item click
  };

  // Helper to check if current time period matches
  const isCurrentPeriod = (period: 'morning' | 'afternoon' | 'evening'): boolean => {
    const hour = new Date().getHours();
    if (period === 'morning') return hour >= 6 && hour < 12;
    if (period === 'afternoon') return hour >= 12 && hour < 17;
    if (period === 'evening') return hour >= 17 && hour < 22;
    return false;
  };

  // Helper to check if an action is overdue (past its time window and incomplete)
  const isActionOverdue = (action: any, period: 'morning' | 'afternoon' | 'evening'): boolean => {
    if (action.completed) return false;
    const currentHour = new Date().getHours();
    
    if (period === 'morning' && currentHour >= 12) return true;
    if (period === 'afternoon' && currentHour >= 17) return true;
    // Evening actions can't be overdue same day
    return false;
  };

  // Categorize actions by time of day - NO reshuffling, items stay in their blocks
  const categorizeByTime = () => {
    // Filter out meal actions if user has no meal plan
    const filteredActions = !hasMealPlan 
      ? actions.filter((a: any) => a.type !== 'meal')
      : actions;
    
    const morning = filteredActions.filter((a: any) => {
      if (a.timeOfDay?.includes('morning')) return true;
      if (a.mealType === 'breakfast') return true;
      if (a.itemType === 'supplement' && !a.timeOfDay) return true;
      return false;
    }).map((a: any) => ({ ...a, isOverdue: isActionOverdue(a, 'morning') }));

    const afternoon = filteredActions.filter((a: any) => {
      if (a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday')) return true;
      if (a.mealType === 'lunch') return true;
      if (a.itemType === 'exercise' && !a.timeOfDay) return true;
      return false;
    }).map((a: any) => ({ ...a, isOverdue: isActionOverdue(a, 'afternoon') }));

    const evening = filteredActions.filter((a: any) => {
      if (a.timeOfDay?.includes('evening')) return true;
      if (a.mealType === 'dinner') return true;
      if (a.itemType === 'therapy' && !a.timeOfDay) return true;
      return false;
    }).map((a: any) => ({ ...a, isOverdue: false })); // Evening can't be overdue same day

    return { morning, afternoon, evening };
  };

  // Categorize actions by type
  const categorizeByType = () => {
    const filteredActions = !hasMealPlan 
      ? actions.filter((a: any) => a.type !== 'meal')
      : actions;
    
    return {
      supplements: filteredActions.filter((a: any) => a.category === 'supplement' || a.itemType === 'supplement'),
      exercise: filteredActions.filter((a: any) => a.itemType === 'exercise' || a.category === 'exercise'),
      habits: filteredActions.filter((a: any) => a.type === 'habit'),
      meals: filteredActions.filter((a: any) => a.type === 'meal'),
      goals: filteredActions.filter((a: any) => a.type === 'goal'),
    };
  };

  const getItemCompleted = (actionId: string) => {
    if (isUsingSampleData) {
      return sampleCompletedIds.has(actionId);
    }
    return actions.find(a => a.id === actionId)?.completed || false;
  };

  // Categorize actions by status
  const categorizeByStatus = () => {
    const filteredActions = !hasMealPlan 
      ? actions.filter((a: any) => a.type !== 'meal')
      : actions;
    
    return {
      toDo: filteredActions.filter((a: any) => !getItemCompleted(a.id)),
      completed: filteredActions.filter((a: any) => getItemCompleted(a.id)),
    };
  };

  // Apply status filter to any list
  const applyStatusFilter = (items: any[]) => {
    if (statusFilter === 'all') return items;
    if (statusFilter === 'todo') return items.filter(a => !getItemCompleted(a.id));
    return items.filter(a => getItemCompleted(a.id));
  };

  const timeBlocks = categorizeByTime();
  const typeBlocks = categorizeByType();
  const statusBlocks = categorizeByStatus();

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
          <p>{t('today.plan.loading')}</p>
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
          <h2 className="text-2xl font-bold text-foreground">{t('today.plan.noActiveItems')}</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {t('today.plan.noActiveItemsDesc')}
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/my-protocol')}
            className="mt-4"
          >
            {t('today.plan.manageProtocol')}
          </Button>
        </div>
      </div>
    );
  }

  const handleViewMeal = (action: any) => {
    setSelectedMeal({ ...action.mealData, mealType: action.mealType });
    setMealModalOpen(true);
  };

  const handleViewExercise = (action: any) => {
    setSelectedExercise({
      id: action.id,
      title: action.title,
      description: action.description,
      estimatedMinutes: action.estimatedMinutes,
      pillar: action.pillar,
    });
    setExerciseModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date & Quote Header */}
      <div className="space-y-4 pb-4 border-b-2 border-primary/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            TODAY - {dateString}
          </h1>
          {user && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/plans/weekly')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('weeklyPlan.viewWeek')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/plans/90-day')}
              >
                {t('weeklyPlan.view90Day')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
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
        
        {/* Progress Summary + Adherence Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-foreground">
              {t('today.plan.progress', { completed: completedCount, total: totalCount })}
            </span>
            <div className="flex items-center gap-3">
              {adherencePercent !== null && user && (
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  adherencePercent >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  adherencePercent >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {t('today.adherence.label', { percent: adherencePercent })}
                </span>
              )}
              <span className="text-muted-foreground">{progressPercent}%</span>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2 bg-muted" />
        </div>
      </div>

      {/* Guest Top Banner CTA */}
      {!user && (
        <div className="mb-4 p-6 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary border-2 border-primary/30 shadow-lg">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/20 backdrop-blur-sm">
              <span className="text-2xl">👋</span>
              <span className="text-sm font-semibold text-foreground">{t('today.guest.sampleBanner')}</span>
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              {t('today.guest.readyTitle')}
            </h3>
            <p className="text-foreground/90 max-w-2xl mx-auto">
              {t('today.guest.readyDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => navigate('/guest-lis-assessment')}
                className="font-semibold"
              >
                {t('today.guest.takeAssessment')}
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/longevity-nutrition')}
                className="bg-background/10 backdrop-blur-sm border-background/30 hover:bg-background/20"
              >
                {t('today.guest.nutritionAssessment')}
              </Button>
            </div>
            <p className="text-xs text-foreground/70">
              {t('today.guest.alreadyAccount')} <button onClick={() => navigate('/auth')} className="underline hover:text-foreground">{t('today.guest.signIn')}</button>
            </p>
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <DailyPlanFilters
        viewBy={viewBy}
        statusFilter={statusFilter}
        onViewByChange={setViewBy}
        onStatusFilterChange={setStatusFilter}
      />

      {/* TIME BLOCKS - The Core Actionable Content */}
      <div className="space-y-4">
        {viewBy === 'time' && (
          <CategoryCardGrid
            categories={[
              { 
                key: 'morning', 
                icon: '☀️', 
                title: t('today.timeBlocks.morning'), 
                items: applyStatusFilter(timeBlocks.morning),
                completedCount: getCategoryStats(applyStatusFilter(timeBlocks.morning)).completed,
                totalCount: getCategoryStats(applyStatusFilter(timeBlocks.morning)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(timeBlocks.morning)).minutes,
                color: 'yellow',
                isCurrentPeriod: isCurrentPeriod('morning')
              },
              { 
                key: 'afternoon', 
                icon: '🌤️', 
                title: t('today.timeBlocks.afternoon'), 
                items: applyStatusFilter(timeBlocks.afternoon),
                completedCount: getCategoryStats(applyStatusFilter(timeBlocks.afternoon)).completed,
                totalCount: getCategoryStats(applyStatusFilter(timeBlocks.afternoon)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(timeBlocks.afternoon)).minutes,
                color: 'blue',
                isCurrentPeriod: isCurrentPeriod('afternoon')
              },
              { 
                key: 'evening', 
                icon: '🌅', 
                title: t('today.timeBlocks.evening'), 
                items: applyStatusFilter(timeBlocks.evening),
                completedCount: getCategoryStats(applyStatusFilter(timeBlocks.evening)).completed,
                totalCount: getCategoryStats(applyStatusFilter(timeBlocks.evening)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(timeBlocks.evening)).minutes,
                color: 'purple',
                isCurrentPeriod: isCurrentPeriod('evening')
              },
            ]}
            onCardClick={(key) => {
              setSelectedCategory(key);
              setIsCategoryDrawerOpen(true);
            }}
          />
        )}

        {viewBy === 'type' && (
          <CategoryCardGrid
            categories={[
              { 
                key: 'supplements', 
                icon: '💊', 
                title: t('today.filters.supplements'), 
                items: applyStatusFilter(typeBlocks.supplements),
                completedCount: getCategoryStats(applyStatusFilter(typeBlocks.supplements)).completed,
                totalCount: getCategoryStats(applyStatusFilter(typeBlocks.supplements)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(typeBlocks.supplements)).minutes,
                color: 'orange' 
              },
              { 
                key: 'exercise', 
                icon: '🏃', 
                title: t('today.filters.exercise'), 
                items: applyStatusFilter(typeBlocks.exercise),
                completedCount: getCategoryStats(applyStatusFilter(typeBlocks.exercise)).completed,
                totalCount: getCategoryStats(applyStatusFilter(typeBlocks.exercise)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(typeBlocks.exercise)).minutes,
                color: 'green' 
              },
              { 
                key: 'habits', 
                icon: '✨', 
                title: t('today.filters.habits'), 
                items: applyStatusFilter(typeBlocks.habits),
                completedCount: getCategoryStats(applyStatusFilter(typeBlocks.habits)).completed,
                totalCount: getCategoryStats(applyStatusFilter(typeBlocks.habits)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(typeBlocks.habits)).minutes,
                color: 'pink' 
              },
              { 
                key: 'meals', 
                icon: '🍽️', 
                title: t('today.filters.meals'), 
                items: applyStatusFilter(typeBlocks.meals),
                completedCount: getCategoryStats(applyStatusFilter(typeBlocks.meals)).completed,
                totalCount: getCategoryStats(applyStatusFilter(typeBlocks.meals)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(typeBlocks.meals)).minutes,
                color: 'yellow' 
              },
              { 
                key: 'goals', 
                icon: '🎯', 
                title: t('today.filters.goals'), 
                items: applyStatusFilter(typeBlocks.goals),
                completedCount: getCategoryStats(applyStatusFilter(typeBlocks.goals)).completed,
                totalCount: getCategoryStats(applyStatusFilter(typeBlocks.goals)).total,
                totalMinutes: getCategoryStats(applyStatusFilter(typeBlocks.goals)).minutes,
                color: 'blue' 
              },
            ]}
            onCardClick={(key) => {
              setSelectedCategory(key);
              setIsCategoryDrawerOpen(true);
            }}
          />
        )}

        {viewBy === 'status' && (
          <CategoryCardGrid
            categories={[
              { 
                key: 'toDo', 
                icon: '📋', 
                title: t('today.filters.toDo'), 
                items: statusBlocks.toDo,
                completedCount: 0,
                totalCount: statusBlocks.toDo.length,
                totalMinutes: getCategoryStats(statusBlocks.toDo).minutes,
                color: 'orange'
              },
              { 
                key: 'completed', 
                icon: '✅', 
                title: t('today.filters.done'), 
                items: statusBlocks.completed,
                completedCount: statusBlocks.completed.length,
                totalCount: statusBlocks.completed.length,
                totalMinutes: getCategoryStats(statusBlocks.completed).minutes,
                color: 'green'
              },
            ]}
            onCardClick={(key) => {
              setSelectedCategory(key);
              setIsCategoryDrawerOpen(true);
            }}
          />
        )}
      </div>

      {/* SECONDARY CONTENT - Below Time Blocks */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        {/* Protocol Management Link */}
        {user && actions.length > 0 && (
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <div className="flex flex-col">
              <p className="font-semibold text-foreground">{t('today.plan.fromActiveProtocol')}</p>
              <p className="text-sm text-muted-foreground">{t('today.plan.fromActiveProtocolDesc')}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/my-protocol')}
              className="shrink-0"
            >
              {t('today.plan.manageProtocol')}
            </Button>
          </div>
        )}

        {/* Goal Progress - Compact */}
        <TodayGoalProgressCard />

        {/* Daily Health Metrics Check-In */}
        {user && <DailyHealthMetricsCard />}

        {/* LIS Impact & Biological Age Prediction */}
        <LISImpactPreview 
          completedCount={completedCount}
          totalCount={totalCount}
          sustainedLIS={sustainedLIS}
          currentAge={42}
        />

        {/* Nutrition Scorecard Widget or Generic Guidance */}
        {user && hasMealPlan && <NutritionScorecardWidget />}
        
        {user && !hasMealPlan && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Utensils className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t('today.nutrition.focusTitle')}</h3>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• {t('today.nutrition.focusTip1')}</p>
                <p>• {t('today.nutrition.focusTip2')}</p>
                <p>• {t('today.nutrition.focusTip3')}</p>
                <p>• {t('today.nutrition.focusTip4')}</p>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/nutrition/meal-plan')}
                className="w-full mt-4"
              >
                {t('today.nutrition.createMealPlan')}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                {t('today.nutrition.getMealsDesc')}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Guest CTA */}
      {!user && (
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground">{t('today.guest.unlockTitle')}</h3>
          <p className="text-muted-foreground">
            {t('today.guest.unlockDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" onClick={() => navigate('/auth')}>
              {t('today.guest.createAccount')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/guest-lis-assessment')}>
              {t('today.guest.takeAssessmentFirst')}
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

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        open={exerciseModalOpen}
        onOpenChange={setExerciseModalOpen}
        exercise={selectedExercise}
        onViewInProtocol={() => navigate('/my-protocol')}
      />
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        category={selectedCategory ? (() => {
          // Category mapping for all views
          const categoryConfig: Record<string, { icon: string; title: string; color: string; items: any[] }> = {
            // Type view
            supplements: { icon: '💊', title: t('today.filters.supplements'), color: 'orange', items: applyStatusFilter(typeBlocks.supplements) },
            exercise: { icon: '🏃', title: t('today.filters.exercise'), color: 'green', items: applyStatusFilter(typeBlocks.exercise) },
            habits: { icon: '✨', title: t('today.filters.habits'), color: 'pink', items: applyStatusFilter(typeBlocks.habits) },
            meals: { icon: '🍽️', title: t('today.filters.meals'), color: 'yellow', items: applyStatusFilter(typeBlocks.meals) },
            goals: { icon: '🎯', title: t('today.filters.goals'), color: 'blue', items: applyStatusFilter(typeBlocks.goals) },
            // Time view
            morning: { icon: '☀️', title: t('today.timeBlocks.morning'), color: 'yellow', items: applyStatusFilter(timeBlocks.morning) },
            afternoon: { icon: '🌤️', title: t('today.timeBlocks.afternoon'), color: 'blue', items: applyStatusFilter(timeBlocks.afternoon) },
            evening: { icon: '🌅', title: t('today.timeBlocks.evening'), color: 'purple', items: applyStatusFilter(timeBlocks.evening) },
            // Status view
            toDo: { icon: '📋', title: t('today.filters.toDo'), color: 'orange', items: statusBlocks.toDo },
            completed: { icon: '✅', title: t('today.filters.done'), color: 'green', items: statusBlocks.completed },
          };
          const config = categoryConfig[selectedCategory];
          if (!config) return null;
          const stats = getCategoryStats(config.items);
          return {
            key: selectedCategory,
            icon: config.icon,
            title: config.title,
            color: config.color,
            items: config.items,
            completedCount: stats.completed,
            totalCount: stats.total,
          };
        })() : null}
        getItemCompleted={getItemCompleted}
        onToggle={handleToggle}
        onBuySupplements={handleBuySupplements}
        onViewMeal={handleViewMeal}
        onViewExercise={handleViewExercise}
        onRowClick={handleRowClick}
        isUsingSampleData={isUsingSampleData}
        user={user}
      />
    </div>
  );
};
