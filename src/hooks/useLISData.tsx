import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LISData {
  baselineScore: number | null;
  baselineDate: Date | null;
  currentScore: number | null;
  dailyScores: any[];
  improvement: number;
  opportunityGap: number;
  loading: boolean;
  hasWearableData: boolean;
  hasManualData: boolean;
  manualEntryCount: number;
  lastSyncTime: string | null;
}

export const useLISData = (): LISData => {
  const { user } = useAuth();
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [baselineDate, setBaselineDate] = useState<Date | null>(null);
  const [currentScore, setCurrentScore] = useState<number | null>(null);
  const [dailyScores, setDailyScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasWearableData, setHasWearableData] = useState(false);
  const [hasManualData, setHasManualData] = useState(false);
  const [manualEntryCount, setManualEntryCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLISData();
    }
  }, [user]);

  const fetchLISData = async () => {
    try {
      if (!user) return;

      // Fetch baseline score
      const { data: baseline } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_baseline', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (baseline) {
        setBaselineScore(baseline.longevity_impact_score);
        setBaselineDate(new Date(baseline.created_at));
      }

      // Fetch last 30 days of scores
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: scores } = await supabase
        .from('daily_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_baseline', false)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (scores && scores.length > 0) {
        // Calculate current average
        const avg = scores.reduce((sum, s) => sum + s.longevity_impact_score, 0) / scores.length;
        setCurrentScore(Math.round(avg));
        setDailyScores(scores);

        // Check data sources
        const wearableData = scores.some(s => s.source_type === 'wearable_auto');
        const manualData = scores.filter(s => s.source_type === 'manual_entry');
        
        setHasWearableData(wearableData);
        setHasManualData(manualData.length > 0);
        setManualEntryCount(manualData.length);

        // Get last sync time (most recent wearable entry)
        const lastWearableEntry = scores
          .filter(s => s.source_type === 'wearable_auto')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        if (lastWearableEntry) {
          setLastSyncTime(lastWearableEntry.created_at);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching LIS data:', error);
      setLoading(false);
    }
  };

  const improvement = currentScore && baselineScore ? currentScore - baselineScore : 0;
  const opportunityGap = baselineScore && currentScore ? baselineScore - currentScore : 0;

  return {
    baselineScore,
    baselineDate,
    currentScore,
    dailyScores,
    improvement,
    opportunityGap,
    loading,
    hasWearableData,
    hasManualData,
    manualEntryCount,
    lastSyncTime
  };
};
