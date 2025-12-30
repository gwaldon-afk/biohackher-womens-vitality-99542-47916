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
 * Persist adherence score to daily_scores table
 * Uses debouncing to avoid excessive writes
 */
let persistTimeout: NodeJS.Timeout | null = null;

export const persistAdherenceScore = async (
  userId: string, 
  adherencePercent: number
): Promise<void> => {
  // Debounce to avoid writing on every toggle
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  
  persistTimeout = setTimeout(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Upsert to daily_scores
      const { error } = await supabase
        .from('daily_scores')
        .upsert({
          user_id: userId,
          date: today,
          protocol_adherence_score: adherencePercent,
          // Minimal required fields - others will be calculated by score-calculate function
          longevity_impact_score: 0, // Will be overwritten by calculation
          biological_age_impact: 0,
          color_code: 'yellow',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error('[adherenceScoreService] Error persisting adherence:', error);
      } else {
        console.log('[adherenceScoreService] Adherence persisted:', adherencePercent);
      }
    } catch (err) {
      console.error('[adherenceScoreService] Unexpected error:', err);
    }
  }, 2000); // 2 second debounce
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
