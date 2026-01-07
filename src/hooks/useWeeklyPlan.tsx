import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useProtocols } from './useProtocols';
import { useNutritionPreferences } from './useNutritionPreferences';
import { supabase } from '@/integrations/supabase/client';
import { templateMealPlans } from '@/data/mealTemplates';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';

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
  is_active: boolean;
  included_in_plan?: boolean;
}

export interface WeeklyAction {
  id: string;
  type: 'protocol' | 'meal' | 'habit';
  title: string;
  description?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  itemType?: string;
  mealType?: string;
  mealData?: any;
  protocolItemId?: string;
  childItems?: Array<{ id: string; name: string; dosage?: string | null; completed: boolean }>;
  actualItemCount?: number;
}

export interface DayPlanData {
  date: Date;
  dayName: string;
  dayKey: string;
  isToday: boolean;
  actions: WeeklyAction[];
  completedCount: number;
  totalCount: number;
}

export interface WeeklyPlanData {
  weekStart: Date;
  weekEnd: Date;
  days: DayPlanData[];
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const DAILY_ESSENTIALS = [
  { id: 'morning_sunlight', title: 'Morning Sunlight', description: '10+ min natural light', timeOfDay: 'morning' as const },
  { id: 'hydration', title: 'Hydration Check', description: '8 glasses goal', timeOfDay: 'morning' as const },
  { id: 'deep_breathing', title: 'Deep Breathing', description: '5 min exercise', timeOfDay: 'afternoon' as const },
  { id: 'sleep_log', title: 'Sleep Log', description: "Record last night's sleep", timeOfDay: 'evening' as const }
];

export const useWeeklyPlan = () => {
  const { user } = useAuth();
  const { protocols, fetchProtocolItems } = useProtocols();
  const { preferences: nutritionPrefs } = useNutritionPreferences();
  
  const [weeklyData, setWeeklyData] = useState<WeeklyPlanData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current week boundaries (Monday start)
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  useEffect(() => {
    if (user) {
      loadWeeklyPlan();
    } else {
      setLoading(false);
    }
  }, [user, protocols, nutritionPrefs]);

  const loadWeeklyPlan = async () => {
    setLoading(true);
    try {
      // Fetch all protocol items from active protocols
      const activeProtocols = protocols.filter(p => p.is_active);
      const allProtocolItems: ProtocolItemLocal[] = [];
      
      for (const protocol of activeProtocols) {
        const items = await fetchProtocolItems(protocol.id);
        const relevantItems = items.filter(item => item.is_active && item.included_in_plan !== false);
        allProtocolItems.push(...relevantItems);
      }

      // Categorize items
      const supplements = allProtocolItems.filter(item => item.item_type === 'supplement');
      const exercises = allProtocolItems.filter(item => item.item_type === 'exercise');
      const therapies = allProtocolItems.filter(item => item.item_type === 'therapy');
      const habits = allProtocolItems.filter(item => item.item_type === 'habit');

      // Fetch all completions for the week
      const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
      
      const { data: protocolCompletions } = await supabase
        .from('protocol_item_completions')
        .select('protocol_item_id, completed_date')
        .eq('user_id', user!.id)
        .in('completed_date', weekDates);

      const { data: essentialsCompletions } = await supabase
        .from('daily_essentials_completions')
        .select('essential_id, date')
        .eq('user_id', user!.id)
        .in('date', weekDates);

      const { data: mealCompletions } = await supabase
        .from('meal_completions')
        .select('meal_type, completed_date')
        .eq('user_id', user!.id)
        .in('completed_date', weekDates);

      // Build daily plans for each day
      const days: DayPlanData[] = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = date.getDay();
        const dayKey = DAY_KEYS[dayOfWeek];
        const isToday = isSameDay(date, today);

        const dayActions: WeeklyAction[] = [];

        // Group supplements by time of day
        const supplementsByTime: Record<string, ProtocolItemLocal[]> = {};
        supplements.forEach(supp => {
          const time = supp.time_of_day?.[0] || 'morning';
          if (!supplementsByTime[time]) supplementsByTime[time] = [];
          supplementsByTime[time].push(supp);
        });

        Object.entries(supplementsByTime).forEach(([time, items]) => {
          const allCompleted = items.every(item =>
            protocolCompletions?.some(c => c.protocol_item_id === item.id && c.completed_date === dateStr)
          );
          
          dayActions.push({
            id: `supplements-${time}-${dateStr}`,
            type: 'protocol',
            title: `Take ${time} supplements`,
            description: `${items.length} supplements`,
            timeOfDay: time === 'evening' ? 'evening' : time === 'afternoon' || time === 'midday' ? 'afternoon' : 'morning',
            completed: allCompleted,
            itemType: 'supplement',
            childItems: items.map(item => ({
              id: item.id,
              name: item.name,
              dosage: item.dosage,
              completed: protocolCompletions?.some(c => c.protocol_item_id === item.id && c.completed_date === dateStr) || false
            })),
            actualItemCount: items.length
          });
        });

        // Exercises - rotate based on day (Sunday rest)
        if (dayOfWeek !== 0 && exercises.length > 0) {
          const exerciseIndex = dayOfWeek % exercises.length;
          const todaysExercise = exercises[exerciseIndex];
          const isCompleted = protocolCompletions?.some(
            c => c.protocol_item_id === todaysExercise.id && c.completed_date === dateStr
          ) || false;

          dayActions.push({
            id: `exercise-${todaysExercise.id}-${dateStr}`,
            type: 'protocol',
            title: todaysExercise.name,
            description: todaysExercise.description || undefined,
            timeOfDay: 'afternoon',
            completed: isCompleted,
            itemType: 'exercise',
            protocolItemId: todaysExercise.id
          });
        }

        // Therapies - one per day on rotation
        if (therapies.length > 0) {
          const therapyIndex = dayOfWeek % therapies.length;
          const todaysTherapy = therapies[therapyIndex];
          const isCompleted = protocolCompletions?.some(
            c => c.protocol_item_id === todaysTherapy.id && c.completed_date === dateStr
          ) || false;

          dayActions.push({
            id: `therapy-${todaysTherapy.id}-${dateStr}`,
            type: 'protocol',
            title: todaysTherapy.name,
            description: todaysTherapy.description || undefined,
            timeOfDay: 'evening',
            completed: isCompleted,
            itemType: 'therapy',
            protocolItemId: todaysTherapy.id
          });
        }

        // Habits - all habits daily
        habits.forEach(habit => {
          const isCompleted = protocolCompletions?.some(
            c => c.protocol_item_id === habit.id && c.completed_date === dateStr
          ) || false;
          const tod = habit.time_of_day?.[0] || 'morning';

          dayActions.push({
            id: `habit-${habit.id}-${dateStr}`,
            type: 'habit',
            title: habit.name,
            description: habit.description || undefined,
            timeOfDay: tod === 'evening' ? 'evening' : tod === 'afternoon' || tod === 'midday' ? 'afternoon' : 'morning',
            completed: isCompleted,
            itemType: 'habit',
            protocolItemId: habit.id
          });
        });

        // Daily essentials
        DAILY_ESSENTIALS.forEach(essential => {
          const isCompleted = essentialsCompletions?.some(
            c => c.essential_id === essential.id && c.date === dateStr
          ) || false;

          dayActions.push({
            id: `essential-${essential.id}-${dateStr}`,
            type: 'habit',
            title: essential.title,
            description: essential.description,
            timeOfDay: essential.timeOfDay,
            completed: isCompleted,
            itemType: 'essential'
          });
        });

        // Meals from selected template
        if (nutritionPrefs?.selectedMealPlanTemplate) {
          const dayMeals = templateMealPlans[nutritionPrefs.selectedMealPlanTemplate]?.[dayKey];
          
          if (dayMeals) {
            const mealTypes: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; tod: 'morning' | 'afternoon' | 'evening' }> = [
              { type: 'breakfast', tod: 'morning' },
              { type: 'lunch', tod: 'afternoon' },
              { type: 'dinner', tod: 'evening' }
            ];

            mealTypes.forEach(({ type, tod }) => {
              const meal = dayMeals[type];
              if (meal) {
                const isCompleted = mealCompletions?.some(
                  c => c.meal_type === type && c.completed_date === dateStr
                ) || false;

                dayActions.push({
                  id: `meal-${type}-${dateStr}`,
                  type: 'meal',
                  title: meal.name,
                  description: `${meal.calories} cal • ${meal.protein}g protein`,
                  timeOfDay: tod,
                  completed: isCompleted,
                  mealType: type,
                  mealData: meal
                });
              }
            });
          }
        }

        // Sort by time of day
        const timeOrder = { morning: 0, afternoon: 1, evening: 2 };
        dayActions.sort((a, b) => timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay]);

        const completedCount = dayActions.filter(a => a.completed).length;

        days.push({
          date,
          dayName: format(date, 'EEEE'),
          dayKey,
          isToday,
          actions: dayActions,
          completedCount,
          totalCount: dayActions.length
        });
      }

      setWeeklyData({
        weekStart,
        weekEnd,
        days
      });
    } catch (error) {
      console.error('Error loading weekly plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    weeklyData,
    loading,
    refetch: loadWeeklyPlan
  };
};
