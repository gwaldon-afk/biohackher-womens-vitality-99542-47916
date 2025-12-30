import { supabase } from "@/integrations/supabase/client";
import { DailyAction } from "@/hooks/useDailyPlan";

/**
 * Calculate adherence score as percentage of completed actions
 */
export const calculateAdherenceScore = (actions: DailyAction[]): number => {
  if (actions.length === 0) return 0;
  
  const completedCount = actions.filter(a => a.completed).length;
  const totalCount = actions.length;
  
  return Math.round((completedCount / totalCount) * 100);
};

/**
 * Persist adherence score via edge function
 * This calls the backend to calculate and persist the score accurately
 */
let persistTimeout: NodeJS.Timeout | null = null;

export const persistAdherenceScore = async (
  userId: string, 
  _adherencePercent: number
): Promise<{ success: boolean; score?: number; error?: string }> => {
  // Debounce to avoid calling edge function on every toggle
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  
  return new Promise((resolve) => {
    persistTimeout = setTimeout(async () => {
      try {
        console.log('[adherenceScoreService] Calling edge function to persist adherence');
        
        const { data, error } = await supabase.functions.invoke('calculate-daily-adherence', {
          body: {}
        });
        
        if (error) {
          console.error('[adherenceScoreService] Edge function error:', error);
          // Don't fail silently - return error info
          resolve({ success: false, error: error.message || 'Edge function failed' });
          return;
        }
        
        if (data?.success) {
          console.log('[adherenceScoreService] Adherence persisted:', data.adherencePercent + '%');
          resolve({ success: true, score: data.adherencePercent });
        } else {
          console.warn('[adherenceScoreService] Edge function returned unexpected response:', data);
          resolve({ success: false, error: data?.error || 'Unexpected response' });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Network or unexpected error';
        console.error('[adherenceScoreService] Unexpected error:', errorMessage);
        resolve({ success: false, error: errorMessage });
      }
    }, 2000); // 2 second debounce
  });
};

/**
 * Get today's adherence score from database
 */
export const getTodaysAdherence = async (userId: string): Promise<number | null> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_scores')
      .select('protocol_adherence_score')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (error) {
      console.error('[adherenceScoreService] Error fetching adherence:', error);
      return null;
    }
    
    return data?.protocol_adherence_score ?? null;
  } catch (err) {
    console.error('[adherenceScoreService] Unexpected error:', err);
    return null;
  }
};

/**
 * Get adherence stats for a date range
 */
export const getAdherenceStats = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ average: number; trend: 'up' | 'down' | 'stable' }> => {
  try {
    const { data, error } = await supabase
      .from('daily_scores')
      .select('protocol_adherence_score, date')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('protocol_adherence_score', 'is', null)
      .order('date', { ascending: true });
    
    if (error || !data || data.length === 0) {
      return { average: 0, trend: 'stable' };
    }
    
    const scores = data.map(d => d.protocol_adherence_score).filter(Boolean) as number[];
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    
    // Calculate trend (compare first half to second half)
    if (scores.length >= 4) {
      const midpoint = Math.floor(scores.length / 2);
      const firstHalfAvg = scores.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
      const secondHalfAvg = scores.slice(midpoint).reduce((a, b) => a + b, 0) / (scores.length - midpoint);
      
      if (secondHalfAvg > firstHalfAvg + 5) return { average, trend: 'up' };
      if (secondHalfAvg < firstHalfAvg - 5) return { average, trend: 'down' };
    }
    
    return { average, trend: 'stable' };
  } catch (err) {
    console.error('[adherenceScoreService] Unexpected error:', err);
    return { average: 0, trend: 'stable' };
  }
};
