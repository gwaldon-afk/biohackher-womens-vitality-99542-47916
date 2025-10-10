import { supabase } from "@/integrations/supabase/client";

export interface UserAssessmentCompletion {
  id: string;
  user_id: string;
  assessment_id: string;
  pillar: string | null;
  score: number | null;
  completed_at: string;
}

export interface SymptomAssessment {
  id: string;
  user_id: string;
  symptom_type: string;
  answers: any;
  overall_score: number;
  score_category: string;
  detail_scores: any | null;
  primary_issues: string[] | null;
  recommendations: any;
  completed_at: string;
}

/**
 * Fetch user's assessment completions
 */
export const getUserAssessments = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_assessment_completions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching user assessments:', error);
    throw error;
  }

  return data as UserAssessmentCompletion[];
};

/**
 * Fetch user's latest assessment by pillar
 */
export const getLatestAssessmentByPillar = async (userId: string, pillar: string) => {
  const { data, error } = await supabase
    .from('user_assessment_completions')
    .select('*')
    .eq('user_id', userId)
    .eq('pillar', pillar)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
    console.error('Error fetching latest assessment:', error);
    throw error;
  }

  return data as UserAssessmentCompletion | null;
};

/**
 * Fetch user's symptom assessments
 */
export const getUserSymptomAssessments = async (userId: string) => {
  const { data, error } = await supabase
    .from('symptom_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) {
    console.error('Error fetching symptom assessments:', error);
    throw error;
  }

  return data as SymptomAssessment[];
};

/**
 * Get user's most severe symptoms from latest assessment
 */
export const getUserTopSymptoms = async (userId: string, limit: number = 5) => {
  const { data, error } = await supabase
    .from('symptom_assessments')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching top symptoms:', error);
    throw error;
  }

  if (!data) return [];

  // Extract primary issues (most severe symptoms)
  return data.primary_issues?.slice(0, limit) || [];
};

/**
 * Check if user has completed any assessments
 */
export const hasCompletedAssessments = async (userId: string): Promise<boolean> => {
  const { count, error } = await supabase
    .from('user_assessment_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking assessment completions:', error);
    return false;
  }

  return (count || 0) > 0;
};

/**
 * Get assessment completion rate by pillar
 */
export const getAssessmentCompletionByPillar = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_assessment_completions')
    .select('pillar')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching pillar completions:', error);
    throw error;
  }

  const pillars = ['brain', 'body', 'beauty', 'balance'];
  const completedPillars = new Set(data.map(d => d.pillar).filter(Boolean));

  return {
    total: pillars.length,
    completed: completedPillars.size,
    percentage: Math.round((completedPillars.size / pillars.length) * 100),
    pillars: pillars.map(pillar => ({
      name: pillar,
      completed: completedPillars.has(pillar)
    }))
  };
};

/**
 * Get user's average assessment score
 */
export const getAverageAssessmentScore = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('user_assessment_completions')
    .select('score')
    .eq('user_id', userId)
    .not('score', 'is', null);

  if (error) {
    console.error('Error calculating average score:', error);
    return 0;
  }

  if (!data || data.length === 0) return 0;

  const sum = data.reduce((acc, curr) => acc + (curr.score || 0), 0);
  return Math.round(sum / data.length);
};
