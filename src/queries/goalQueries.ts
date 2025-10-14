// React Query hooks for goals
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Query keys
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (userId: string) => [...goalKeys.lists(), userId] as const,
  checkIns: (goalId: string) => [...goalKeys.all, 'checkIns', goalId] as const,
};

// Fetch goals for a user
export function useGoals(userId: string | undefined) {
  return useQuery({
    queryKey: goalKeys.list(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_health_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

// Fetch check-ins for a goal
export function useGoalCheckIns(goalId: string | undefined) {
  return useQuery({
    queryKey: goalKeys.checkIns(goalId || ''),
    queryFn: async () => {
      if (!goalId) return [];
      
      const { data, error } = await supabase
        .from('goal_check_ins')
        .select('*')
        .eq('goal_id', goalId)
        .order('check_in_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!goalId,
    staleTime: 30000,
  });
}

// Create a goal
export function useCreateGoal(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goal: any) => {
      const { data, error } = await supabase
        .from('user_health_goals')
        .insert({ ...goal, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.list(userId) });
    },
  });
}

// Update a goal
export function useUpdateGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('user_health_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

// Create a goal check-in
export function useCreateGoalCheckIn(goalId: string, userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (checkIn: any) => {
      const { data, error } = await supabase
        .from('goal_check_ins')
        .insert({ ...checkIn, goal_id: goalId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.checkIns(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}
