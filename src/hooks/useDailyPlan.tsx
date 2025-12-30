import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProtocols } from './useProtocols';
import { useGoals } from './useGoals';
import { useHealthProfile } from './useHealthProfile';
import { useEnergyLoop } from './useEnergyLoop';
import { useStreaks } from './useStreaks';
import { useProtocolCompletions } from '@/queries/protocolQueries';
import { useNutritionPreferences } from './useNutritionPreferences';
import { supabase } from '@/integrations/supabase/client';


import { templateMealPlans } from '@/data/mealTemplates';

// Local interface matching what useProtocols returns
interface ProtocolItemLocal {
  id: string;
  protocol_id: string;
  item_type: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  name: string;
  description: string | null;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  time_of_day: string[] | null;
  notes: string | null;
  product_link: string | null;
  product_id: string | null;
  is_active: boolean;
  included_in_plan?: boolean;
}

export interface DailyAction {
  id: string;
  type: 'protocol' | 'goal' | 'energy' | 'habit' | 'meal';
  title: string;
  description?: string;
  category: 'quick_win' | 'energy_booster' | 'deep_practice' | 'optional' | 'nutrition';
  estimatedMinutes: number;
  priority: number;
  goalAlignment?: string;
  whyItMatters?: string;
  icon?: string;
  completed: boolean;
  protocolItemId?: string;
  goalId?: string;
  energyActionId?: string;
  timeOfDay?: string[] | null;
  mealData?: any;
  mealType?: string;
  itemType?: string; // Original item_type from database for proper categorization
}

export const useDailyPlan = () => {
  const { user } = useAuth();
  const { protocols, fetchProtocolItems } = useProtocols();
  const { goals } = useGoals();
  const { energyMetrics } = useHealthProfile();
  const { actions: energyActions, currentScore } = useEnergyLoop();
  const { preferences: nutritionPrefs } = useNutritionPreferences();
  const { streaks, getStreak } = useStreaks();
  const today = new Date().toISOString().split('T')[0];
  const { data: completions } = useProtocolCompletions(user?.id, today);
  
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDailyPlan();
    } else {
      // Guest users should not be in loading state
      setLoading(false);
    }
  }, [user, protocols, goals, energyActions, completions, nutritionPrefs]);

  const loadDailyPlan = async () => {
    console.log('[useDailyPlan] Starting loadDailyPlan');
    console.log('[useDailyPlan] User:', user?.id);
    console.log('[useDailyPlan] Available protocols:', protocols);
    
    setLoading(true);
    try {
      const dailyActions: DailyAction[] = [];

      // 0. Add Daily Essentials (merged into time blocks)
      const DAILY_ESSENTIALS = [
        { id: 'morning_sunlight', title: 'Morning Sunlight', description: '10+ min natural light exposure', timeOfDay: ['morning'], estimatedMinutes: 10 },
        { id: 'hydration', title: 'Hydration Check', description: '8 glasses of water goal', timeOfDay: ['morning', 'afternoon'], estimatedMinutes: 2 },
        { id: 'deep_breathing', title: 'Deep Breathing', description: '5 min breathing exercise', timeOfDay: ['afternoon'], estimatedMinutes: 5 },
        { id: 'sleep_log', title: 'Sleep Log', description: 'Record last night\'s sleep', timeOfDay: ['evening'], estimatedMinutes: 2 }
      ];

      // Check essentials completions from database
      let essentialsCompletions: string[] = [];
      if (user) {
        const { data: essentialsData } = await supabase
          .from('daily_essentials_completions')
          .select('essential_id')
          .eq('user_id', user.id)
          .eq('date', today);
        essentialsCompletions = essentialsData?.map(d => d.essential_id) || [];
      }

      DAILY_ESSENTIALS.forEach(essential => {
        dailyActions.push({
          id: `essential-${essential.id}`,
          type: 'habit',
          title: essential.title,
          description: essential.description,
          category: 'quick_win',
          estimatedMinutes: essential.estimatedMinutes,
          priority: 0,
          icon: '✨',
          completed: essentialsCompletions.includes(essential.id),
          timeOfDay: essential.timeOfDay,
          itemType: 'habit'
        });
      });

      // 1. Get active protocol items from ALL active protocols
      const activeProtocols = protocols.filter(p => p.is_active);
      console.log('[useDailyPlan] Active protocols:', activeProtocols);
      
      // Warn if multiple active protocols (data integrity issue)
      if (activeProtocols.length > 1) {
        console.warn(`[useDailyPlan] Found ${activeProtocols.length} active protocols! User should only have 1 active protocol.`);
      }
      
      // Collect all protocol items first for grouping
      const allProtocolItems: ProtocolItemLocal[] = [];
      
      // Fetch and merge items from all active protocols
      for (const protocol of activeProtocols) {
        const items = await fetchProtocolItems(protocol.id);
        console.log(`[useDailyPlan] Protocol ${protocol.id} items fetched:`, items);
        
        // Filter by included_in_plan (not just is_active) to respect user's plan selection
        const relevantItems = items.filter(item => item.is_active && item.included_in_plan !== false);
        console.log(`[useDailyPlan] Items included in plan from protocol ${protocol.id}:`, relevantItems);
        allProtocolItems.push(...relevantItems);
      }

      // Separate items by type for smart grouping
      const supplements = allProtocolItems.filter(item => item.item_type === 'supplement');
      const exercises = allProtocolItems.filter(item => item.item_type === 'exercise');
      const therapies = allProtocolItems.filter(item => item.item_type === 'therapy');
      const habits = allProtocolItems.filter(item => item.item_type === 'habit');
      const dietItems = allProtocolItems.filter(item => item.item_type === 'diet');

      // Group supplements by time of day (reduces 10+ items to 2-3 grouped actions)
      const supplementsByTime: Record<string, ProtocolItemLocal[]> = {};
      supplements.forEach(supp => {
        const time = supp.time_of_day?.[0] || 'morning';
        if (!supplementsByTime[time]) supplementsByTime[time] = [];
        supplementsByTime[time].push(supp);
      });

      // Check if ALL supplements in a group are completed
      Object.entries(supplementsByTime).forEach(([time, items]) => {
        const allCompleted = items.every(item => 
          completions?.some(c => c.protocol_item_id === item.id)
        );
        const suppNames = items.map(s => s.name).slice(0, 3).join(', ');
        const moreCount = items.length > 3 ? ` +${items.length - 3} more` : '';
        
        dailyActions.push({
          id: `supplements-${time}`,
          type: 'protocol',
          title: `Take ${time} supplements`,
          description: `${items.length} supplements: ${suppNames}${moreCount}`,
          category: 'quick_win',
          estimatedMinutes: 2, // 2 min total, not per supplement
          priority: 0,
          icon: '💊',
          completed: allCompleted,
          timeOfDay: [time],
          itemType: 'supplement'
        });
      });

      // Exercise rotation: show 1-2 exercises per day based on schedule
      const dayOfWeek = new Date().getDay();
      const exerciseSchedule: Record<number, string[]> = {
        0: [], // Sunday - rest
        1: ['strength', 'upper', 'resistance'], // Monday
        2: ['cardio', 'walking', 'lower'], // Tuesday
        3: ['hiit', 'interval', 'flexibility'], // Wednesday
        4: ['strength', 'upper', 'resistance'], // Thursday
        5: ['cardio', 'walking', 'lower'], // Friday
        6: ['yoga', 'stretching', 'recovery'], // Saturday
      };
      
      const todayKeywords = exerciseSchedule[dayOfWeek] || [];
      let todaysExercises = exercises.filter(ex => 
        todayKeywords.some(kw => ex.name.toLowerCase().includes(kw))
      );
      
      // If no matches, pick based on index rotation (max 2 per day)
      if (todaysExercises.length === 0 && exercises.length > 0) {
        const startIndex = dayOfWeek % exercises.length;
        todaysExercises = exercises.slice(startIndex, startIndex + 2);
        // Handle wrap-around
        if (todaysExercises.length < 2 && exercises.length > 1) {
          todaysExercises.push(...exercises.slice(0, 2 - todaysExercises.length));
        }
      }
      // Limit to max 2 exercises per day
      todaysExercises = todaysExercises.slice(0, 2);

      todaysExercises.forEach((item: ProtocolItemLocal) => {
        const isCompleted = completions?.some(c => c.protocol_item_id === item.id) || false;
        dailyActions.push({
          id: `protocol-${item.id}`,
          type: 'protocol',
          title: item.name,
          description: item.description || undefined,
          category: 'deep_practice',
          estimatedMinutes: 30,
          priority: 0,
          icon: '💪',
          completed: isCompleted,
          protocolItemId: item.id,
          timeOfDay: item.time_of_day,
          itemType: 'exercise'
        });
      });

      // Therapies: show 1 per day on rotation
      if (therapies.length > 0) {
        const therapyIndex = dayOfWeek % therapies.length;
        const todaysTherapy = therapies[therapyIndex];
        const isCompleted = completions?.some(c => c.protocol_item_id === todaysTherapy.id) || false;
        
        dailyActions.push({
          id: `protocol-${todaysTherapy.id}`,
          type: 'protocol',
          title: todaysTherapy.name,
          description: todaysTherapy.description || undefined,
          category: 'deep_practice',
          estimatedMinutes: 20,
          priority: 0,
          icon: '🧘',
          completed: isCompleted,
          protocolItemId: todaysTherapy.id,
          timeOfDay: todaysTherapy.time_of_day,
          itemType: 'therapy'
        });
      }

      // Habits: add all (usually quick actions)
      habits.forEach((item: ProtocolItemLocal) => {
        const isCompleted = completions?.some(c => c.protocol_item_id === item.id) || false;
        dailyActions.push({
          id: `protocol-${item.id}`,
          type: 'protocol',
          title: item.name,
          description: item.description || undefined,
          category: 'energy_booster',
          estimatedMinutes: 5, // Reduced from 10
          priority: 0,
          icon: '✨',
          completed: isCompleted,
          protocolItemId: item.id,
          timeOfDay: item.time_of_day,
          itemType: 'habit'
        });
      });

      // Diet items: these are guidelines, not time-consuming tasks (0 minutes)
      dietItems.forEach((item: ProtocolItemLocal) => {
        const isCompleted = completions?.some(c => c.protocol_item_id === item.id) || false;
        dailyActions.push({
          id: `protocol-${item.id}`,
          type: 'protocol',
          title: item.name,
          description: item.description || undefined,
          category: 'quick_win',
          estimatedMinutes: 0, // Diet items are guidelines, not tasks
          priority: 0,
          icon: '🥗',
          completed: isCompleted,
          protocolItemId: item.id,
          timeOfDay: item.time_of_day,
          itemType: 'diet'
        });
      });

      // 2. Goals are now tracked separately - removed from daily action time
      // (Goal progress is shown in the dedicated Goals section, not as time-consuming tasks)
      const activeGoals = goals.filter(g => g.status === 'active');

      // 3. Get energy actions (if energy loop is active)
      energyActions.forEach(action => {
        dailyActions.push({
          id: `energy-${action.id}`,
          type: 'energy',
          title: action.action_name,
          description: action.description,
          category: 'energy_booster',
          estimatedMinutes: 15,
          priority: 0,
          whyItMatters: 'Boost your energy loop',
          icon: getEnergyIcon(action.action_type),
          completed: false,
          energyActionId: action.id
        });
      });

      // 4. Get today's meal plan (if template is selected)
      if (nutritionPrefs?.selectedMealPlanTemplate) {
        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
        const todaysMeals = templateMealPlans[nutritionPrefs.selectedMealPlanTemplate]?.[dayOfWeek];
        
        if (todaysMeals && user) {
          // Check meal completions
          const { data: mealCompletions } = await supabase
            .from('meal_completions')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed_date', today);
          
          const mealTypes: Array<'breakfast' | 'lunch' | 'dinner'> = ['breakfast', 'lunch', 'dinner'];
          mealTypes.forEach(mealType => {
            const meal = todaysMeals[mealType];
            const isCompleted = mealCompletions?.some(c => c.meal_type === mealType) || false;
            
            dailyActions.push({
              id: `meal-${mealType}`,
              type: 'meal',
              title: meal.name,
              description: `${meal.calories} cal • ${meal.protein}g protein`,
              category: 'nutrition',
              estimatedMinutes: mealType === 'breakfast' ? 15 : mealType === 'lunch' ? 20 : 30,
              priority: 0,
              timeOfDay: mealType === 'breakfast' ? ['morning'] : mealType === 'lunch' ? ['midday'] : ['evening'],
              whyItMatters: `Part of your ${nutritionPrefs.selectedMealPlanTemplate} meal plan`,
              icon: 'Utensils',
              completed: isCompleted,
              mealData: meal,
              mealType
            });
          });
        }
      }

      // Calculate priorities for all actions
      const prioritizedActions = calculatePriorities(dailyActions, activeGoals.length, currentScore?.composite_score, energyMetrics);
      
      console.log('[useDailyPlan] All actions collected:', dailyActions.length);
      console.log('[useDailyPlan] Protocol actions:', dailyActions.filter(a => a.type === 'protocol'));
      console.log('[useDailyPlan] Final prioritized actions:', prioritizedActions);
      
      setActions(prioritizedActions);
    } catch (error) {
      console.error('Error loading daily plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriorities = (actions: DailyAction[], activeGoalCount: number, energyScore?: number, energyMetrics?: any): DailyAction[] => {
    const isLowEnergy = (energyMetrics?.latestScore ?? 100) < 60;
    
    return actions.map(action => {
      let score = 0;

      // ENERGY-BASED PRIORITIZATION
      if (isLowEnergy) {
        // Boost energy-related actions
        if (action.type === 'protocol' && 
            (action.title.toLowerCase().includes('iron') || 
             action.title.toLowerCase().includes('b12') || 
             action.title.toLowerCase().includes('coq10'))) {
          score += 4; // High boost for energy supplements
        }
        
        if (action.title.toLowerCase().includes('energy')) {
          score += 3; // Boost energy check-ins and activities
        }

        // Prefer quick wins over deep practice when low energy
        if (action.estimatedMinutes && action.estimatedMinutes <= 10) {
          score += 2;
        } else if (action.estimatedMinutes && action.estimatedMinutes > 30) {
          score -= 1; // De-prioritize long activities when fatigued
        }
      }

      // Goal alignment (×3)
      if (action.goalAlignment) score += 3;

      // Quick win bonus (×2)
      if (action.category === 'quick_win') score += 2;

      // Time sensitivity (×1.5)
      if (action.type === 'protocol') score += 1.5;

      // Energy requirement match (×2)
      if (energyScore && energyScore < 60 && action.category === 'energy_booster') {
        score += 2;
      }

      // Completed actions go to bottom
      if (action.completed) score -= 100;

      return { ...action, priority: score };
    }).sort((a, b) => b.priority - a.priority);
  };

  const categorizeActionByType = (itemType: string): DailyAction['category'] => {
    switch (itemType) {
      case 'supplement':
        return 'quick_win';
      case 'exercise':
      case 'therapy':
        return 'deep_practice';
      case 'habit':
        return 'energy_booster';
      case 'diet':
        return 'quick_win';
      default:
        return 'optional';
    }
  };

  const estimateTime = (itemType: string): number => {
    const timeMap: Record<string, number> = {
      supplement: 2,
      therapy: 20,
      habit: 10,
      exercise: 30,
      diet: 15
    };
    return timeMap[itemType] || 10;
  };

  const getItemIcon = (itemType: string): string => {
    const iconMap: Record<string, string> = {
      supplement: '💊',
      therapy: '🧘',
      habit: '✨',
      exercise: '💪',
      diet: '🥗'
    };
    return iconMap[itemType] || '✓';
  };

  const getPillarIcon = (pillar: string): string => {
    const iconMap: Record<string, string> = {
      brain: '🧠',
      body: '💪',
      balance: '⚖️',
      beauty: '✨'
    };
    return iconMap[pillar] || '🎯';
  };

  const getEnergyIcon = (actionType: string): string => {
    const iconMap: Record<string, string> = {
      balance: '⚖️',
      fuel: '⚡',
      calm: '🧘',
      recharge: '🔋'
    };
    return iconMap[actionType] || '⚡';
  };

  const completedCount = actions.filter(a => a.completed).length;
  const totalCount = actions.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const quickWins = actions.filter(a => a.category === 'quick_win');
  const energyBoosters = actions.filter(a => a.category === 'energy_booster');
  const deepPractices = actions.filter(a => a.category === 'deep_practice');
  const top3 = actions.slice(0, 3);

  const dailyStreak = getStreak('daily_completion');

  return {
    actions,
    loading,
    completedCount,
    totalCount,
    completionPercentage,
    quickWins,
    energyBoosters,
    deepPractices,
    top3,
    dailyStreak,
    refetch: loadDailyPlan
  };
};
