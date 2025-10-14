// React Query hooks for assessments
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AssessmentCompletion, SymptomAssessment } from '@/types/assessments';
import { useAssessmentStore } from '@/stores/assessmentStore';

// Query keys
export const assessmentKeys = {
  all: ['assessments'] as const,
  completions: (userId: string) => [...assessmentKeys.all, 'completions', userId] as const,
  symptoms: (userId: string) => [...assessmentKeys.all, 'symptoms', userId] as const,
};

// Fetch assessment completions
export function useAssessmentCompletions(userId: string | undefined) {
  const setCompletions = useAssessmentStore(state => state.setCompletions);
  
  return useQuery({
    queryKey: assessmentKeys.completions(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('user_assessment_completions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      const completions = data || [];
      setCompletions(completions);
      return completions as AssessmentCompletion[];
    },
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
}

// Fetch symptom assessments
export function useSymptomAssessments(userId: string | undefined) {
  const setSymptomAssessments = useAssessmentStore(state => state.setSymptomAssessments);
  
  return useQuery({
    queryKey: assessmentKeys.symptoms(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      
      const assessments = data || [];
      setSymptomAssessments(assessments);
      return assessments as SymptomAssessment[];
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}

// Create assessment completion
export function useCreateAssessmentCompletion(userId: string) {
  const queryClient = useQueryClient();
  const addCompletion = useAssessmentStore(state => state.addCompletion);
  
  return useMutation({
    mutationFn: async (completion: Omit<AssessmentCompletion, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('user_assessment_completions')
        .insert({ ...completion, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as AssessmentCompletion;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.completions(userId) });
      addCompletion(data);
    },
  });
}

// Create symptom assessment
export function useCreateSymptomAssessment(userId: string) {
  const queryClient = useQueryClient();
  const addSymptomAssessment = useAssessmentStore(state => state.addSymptomAssessment);
  
  return useMutation({
    mutationFn: async (assessment: Omit<SymptomAssessment, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('symptom_assessments')
        .insert({ ...assessment, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as SymptomAssessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.symptoms(userId) });
      addSymptomAssessment(data);
    },
  });
}
