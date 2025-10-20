import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useProtocols } from './useProtocols';
import { useGoals } from './useGoals';
import { useEnergyLoop } from './useEnergyLoop';
import { useStreaks } from './useStreaks';
import { useProtocolCompletions } from '@/queries/protocolQueries';
import { matchesTimeOfDay } from '@/utils/timeContext';
import { ProtocolItem } from '@/types/protocols';

export interface DailyAction {
  id: string;
  type: 'protocol' | 'goal' | 'energy' | 'habit';
  title: string;
  description?: string;
  category: 'quick_win' | 'energy_booster' | 'deep_practice' | 'optional';
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
}

export const useDailyPlan = () => {
  const { user } = useAuth();
  const { protocols, fetchProtocolItems } = useProtocols();
  const { goals } = useGoals();
  const { actions: energyActions, currentScore } = useEnergyLoop();
  const { streaks, getStreak } = useStreaks();
  const today = new Date().toISOString().split('T')[0];
  const { data: completions } = useProtocolCompletions(user?.id, today);
  
  const [actions, setActions] = useState<DailyAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDailyPlan();
    }
  }, [user, protocols, goals, energyActions, completions]);

  const loadDailyPlan = async () => {
    setLoading(true);
    try {
      const dailyActions: DailyAction[] = [];

      // 1. Get active protocol items (show all, don't filter by time)
      const activeProtocol = protocols.find(p => p.is_active);
      if (activeProtocol) {
        const items = await fetchProtocolItems(activeProtocol.id);
        const relevantItems = items.filter(item => item.is_active);

        relevantItems.forEach((item: ProtocolItem) => {
          const isCompleted = completions?.some(c => c.protocol_item_id === item.id) || false;
          
          dailyActions.push({
            id: `protocol-${item.id}`,
            type: 'protocol',
            title: item.name,
            description: item.description || undefined,
            category: categorizeActionByType(item.item_type),
            estimatedMinutes: estimateTime(item.item_type),
            priority: 0, // Will be calculated
            icon: getItemIcon(item.item_type),
            completed: isCompleted,
            protocolItemId: item.id,
            timeOfDay: item.time_of_day
          });
        });
      }

      // 2. Get active goal actions
      const activeGoals = goals.filter(g => g.status === 'active');
      activeGoals.forEach(goal => {
        // Extract daily actions from goal (simplified)
        dailyActions.push({
          id: `goal-${goal.id}`,
          type: 'goal',
          title: `Work on: ${goal.title}`,
          description: 'Complete today\'s goal activity',
          category: 'deep_practice',
          estimatedMinutes: 30,
          priority: 0,
          goalAlignment: goal.pillar_category,
          whyItMatters: `Supports your ${goal.pillar_category} goal`,
          icon: getPillarIcon(goal.pillar_category),
          completed: false,
          goalId: goal.id
        });
      });

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

      // Calculate priorities for all actions
      const prioritizedActions = calculatePriorities(dailyActions, activeGoals.length, currentScore?.composite_score);
      
      setActions(prioritizedActions);
    } catch (error) {
      console.error('Error loading daily plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriorities = (actions: DailyAction[], activeGoalCount: number, energyScore?: number): DailyAction[] => {
    return actions.map(action => {
      let score = 0;

      // Goal alignment (×3)
      if (action.goalAlignment) score += 3;

      // Quick win bonus (×2)
      if (action.category === 'quick_win') score += 2;

      // Time sensitivity (×1.5)
      if (action.type === 'protocol') score += 1.5;

      // Energy requirement match (×1)
      if (energyScore && energyScore < 60 && action.category === 'energy_booster') {
        score += 2;
      }

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
