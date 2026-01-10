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
import { exercisePrograms } from '@/data/exercisePrograms';

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
  type: 'protocol' | 'goal' | 'energy' | 'habit' | 'meal' | 'workout';
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
  // For grouped items (e.g., supplements by time)
  childItems?: Array<{ id: string; name: string; dosage?: string | null; completed: boolean }>;
  actualItemCount?: number;
  // For exercise program workouts
  workoutData?: {
    programKey: string;
    weekNumber: number;
    dayNumber: number;
    workout: any;
  };
}

// Helper to determine which days of the week should have workouts based on sessions per week
const getWorkoutDays = (sessionsPerWeek: number): number[] => {
  // Returns day of week numbers (0 = Sunday, 1 = Monday, etc.)
  switch (sessionsPerWeek) {
    case 1:
      return [3]; // Wednesday
    case 2:
      return [1, 4]; // Monday, Thursday
    case 3:
      return [1, 3, 5]; // Monday, Wednesday, Friday
    case 4:
      return [1, 2, 4, 5]; // Monday, Tuesday, Thursday, Friday
    case 5:
      return [1, 2, 3, 4, 5]; // Monday through Friday
    case 6:
      return [1, 2, 3, 4, 5, 6]; // Monday through Saturday
    case 7:
      return [0, 1, 2, 3, 4, 5, 6]; // Every day
    default:
      return [1, 3, 5]; // Default to 3 days
  }
};

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
          itemType: 'supplement',
          // Store child items for expansion and accurate counting
          childItems: items.map(item => ({
            id: item.id,
            name: item.name,
            dosage: item.dosage,
            completed: completions?.some(c => c.protocol_item_id === item.id) || false
          })),
          actualItemCount: items.length
        });
      });

      // Personalised exercise matching based on user health profile
      const dayOfWeek = new Date().getDay();
      
      // Fetch user health profile for personalisation
      let userHealthData: { activity_level?: string; fitness_goal?: string; training_experience?: string } | null = null;
      if (user) {
        const { data } = await supabase
          .from('user_health_profile')
          .select('activity_level, fitness_goal, training_experience')
          .eq('user_id', user.id)
          .maybeSingle();
        userHealthData = data;
      }
      
      const activityLevel = userHealthData?.activity_level || 'lightly_active';
      const fitnessGoal = userHealthData?.fitness_goal || 'maintain';
      const experience = userHealthData?.training_experience || 'beginner';
      
      // Filter exercises by experience level (beginners get gentler options)
      let eligibleExercises = exercises;
      if (experience === 'beginner') {
        eligibleExercises = exercises.filter(ex => 
          !ex.name.toLowerCase().includes('hiit') &&
          !ex.name.toLowerCase().includes('advanced') &&
          !ex.name.toLowerCase().includes('intense')
        );
        // If all exercises were filtered out, keep original list
        if (eligibleExercises.length === 0) eligibleExercises = exercises;
      }
      
      // Goal-based priority keywords
      const goalPriority: Record<string, string[]> = {
        'weight_loss': ['cardio', 'hiit', 'walking', 'interval', 'running', 'cycling'],
        'muscle_gain': ['resistance', 'compound', 'strength', 'weight', 'lifts', 'training'],
        'maintain': ['walking', 'yoga', 'stretching', 'flexibility', 'balance'],
        'improve_energy': ['walking', 'yoga', 'light', 'morning', 'gentle', 'stretching'],
      };
      
      const priorityKeywords = goalPriority[fitnessGoal] || goalPriority['maintain'];
      
      // Score exercises based on goal alignment
      const scoredExercises = eligibleExercises.map(ex => ({
        exercise: ex,
        score: priorityKeywords.filter(kw => 
          ex.name.toLowerCase().includes(kw) || 
          (ex.description?.toLowerCase().includes(kw) ?? false)
        ).length
      }));
      
      // Sort by score (highest first), then apply day rotation
      scoredExercises.sort((a, b) => b.score - a.score);
      
      // Adjust volume by activity level
      const maxExercises: Record<string, number> = {
        'sedentary': 1,
        'lightly_active': 2,
        'active': 2,
        'very_active': 3,
      };
      
      const exerciseLimit = maxExercises[activityLevel] || 2;
      
      // Sunday rest day
      let todaysExercises: ProtocolItemLocal[] = [];
      if (dayOfWeek !== 0 && scoredExercises.length > 0) {
        // Apply day-based rotation within top-scored exercises
        const topPool = scoredExercises.slice(0, Math.max(exerciseLimit * 2, 4));
        const startIndex = dayOfWeek % topPool.length;
        
        for (let i = 0; i < exerciseLimit && i < topPool.length; i++) {
          const idx = (startIndex + i) % topPool.length;
          todaysExercises.push(topPool[idx].exercise);
        }
      }

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

      // 5. Add Exercise Program Workout (if user has active program)
      if (user) {
        try {
          // Fetch user's active exercise program
          const { data: activeProgram } = await (supabase
            .from('user_exercise_programs' as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle() as any);

          if (activeProgram) {
            const program = exercisePrograms.find(p => p.key === activeProgram.program_key);
            
            if (program) {
              const currentWeek = activeProgram.current_week || 1;
              const weekStructure = program.weeklyStructure.find(w => w.weekNumber === currentWeek);
              
              if (weekStructure) {
                // Calculate which workout day it is based on days since start
                const startDate = new Date(activeProgram.start_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                startDate.setHours(0, 0, 0, 0);
                
                const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                const daysPerWeek = 7;
                const dayOfCurrentWeek = daysSinceStart % daysPerWeek;
                
                // Determine workout days based on sessions per week
                // e.g., 3 sessions = Mon, Wed, Fri (days 0, 2, 4 of week starting Monday)
                const sessionsPerWeek = program.sessionsPerWeek;
                const workoutDays = getWorkoutDays(sessionsPerWeek);
                
                // Check if today is a workout day
                const todayDayOfWeek = new Date().getDay(); // 0 = Sunday
                const workoutDayIndex = workoutDays.indexOf(todayDayOfWeek);
                
                if (workoutDayIndex !== -1 && weekStructure.days[workoutDayIndex]) {
                  const todaysWorkout = weekStructure.days[workoutDayIndex];
                  
                  // Check if workout is completed today
                  const todayStr = new Date().toISOString().split('T')[0];
                  const { data: workoutCompletion } = await (supabase
                    .from('exercise_workout_completions' as any)
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('program_key', activeProgram.program_key)
                    .eq('workout_date', todayStr)
                    .maybeSingle() as any);
                  
                  const isCompleted = !!workoutCompletion;
                  
                  dailyActions.push({
                    id: `workout-${activeProgram.program_key}-w${currentWeek}-d${todaysWorkout.dayNumber}`,
                    type: 'workout',
                    title: todaysWorkout.name,
                    description: `${todaysWorkout.focus} • ${todaysWorkout.estimatedDuration} min`,
                    category: 'deep_practice',
                    estimatedMinutes: todaysWorkout.estimatedDuration,
                    priority: 0,
                    timeOfDay: ['morning', 'afternoon'], // Flexible timing
                    whyItMatters: `Week ${currentWeek} of your ${program.name} program`,
                    icon: '🏋️',
                    completed: isCompleted,
                    itemType: 'exercise_program',
                    workoutData: {
                      programKey: activeProgram.program_key,
                      weekNumber: currentWeek,
                      dayNumber: todaysWorkout.dayNumber,
                      workout: todaysWorkout
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error('[useDailyPlan] Error loading exercise program:', error);
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
