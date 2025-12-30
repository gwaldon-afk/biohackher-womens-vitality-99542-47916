import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface PillarScores {
  sleep: number | null;
  stress: number | null;
  activity: number | null;
  nutrition: number | null;
  social: number | null;
  cognitive: number | null;
}

interface LISData {
  baselineScore: number | null;
  baselineDate: Date | null;
  currentScore: number | null;
  rawScore: number | null;
  dailyScores: any[];
  improvement: number;
  opportunityGap: number;
  loading: boolean;
  hasWearableData: boolean;
  hasManualData: boolean;
  manualEntryCount: number;
  lastSyncTime: string | null;
  pillarScores: PillarScores;
  latestAdherence: number | null;
  refetch: () => Promise<void>;
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
  const [pillarScores, setPillarScores] = useState<PillarScores>({
    sleep: null,
    stress: null,
    activity: null,
    nutrition: null,
    social: null,
    cognitive: null,
  });

  const fetchLISData = useCallback(async () => {
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

        // Calculate pillar score averages
        const pillarAverages = {
          sleep: scores.filter(s => s.sleep_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.sleep_score || 0), 0) / scores.filter(s => s.sleep_score !== null).length
            : null,
          stress: scores.filter(s => s.stress_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.stress_score || 0), 0) / scores.filter(s => s.stress_score !== null).length
            : null,
          activity: scores.filter(s => s.physical_activity_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.physical_activity_score || 0), 0) / scores.filter(s => s.physical_activity_score !== null).length
            : null,
          nutrition: scores.filter(s => s.nutrition_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.nutrition_score || 0), 0) / scores.filter(s => s.nutrition_score !== null).length
            : null,
          social: scores.filter(s => s.social_connections_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.social_connections_score || 0), 0) / scores.filter(s => s.social_connections_score !== null).length
            : null,
          cognitive: scores.filter(s => s.cognitive_engagement_score !== null).length > 0
            ? scores.reduce((sum, s) => sum + (s.cognitive_engagement_score || 0), 0) / scores.filter(s => s.cognitive_engagement_score !== null).length
            : null,
        };
        
        setPillarScores(pillarAverages);

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
      } else if (baseline) {
        // Use baseline score as current if no non-baseline scores exist
        setCurrentScore(baseline.longevity_impact_score);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching LIS data:', error);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLISData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const improvement = currentScore && baselineScore ? currentScore - baselineScore : 0;
  const opportunityGap = baselineScore && currentScore ? baselineScore - currentScore : 0;

  // Calculate adherence-weighted LIS if adherence data exists
  const latestAdherence = dailyScores.length > 0 
    ? dailyScores[dailyScores.length - 1]?.protocol_adherence_score 
    : null;

  // Factor adherence into the current score (10% weight)
  const adherenceAdjustedScore = currentScore && latestAdherence !== null
    ? Math.round(currentScore * 0.9 + (latestAdherence / 100) * 10)
    : currentScore;

  return {
    baselineScore,
    baselineDate,
    currentScore: adherenceAdjustedScore,
    rawScore: currentScore, // Original score without adherence adjustment
    dailyScores,
    improvement,
    opportunityGap,
    loading,
    hasWearableData,
    hasManualData,
    manualEntryCount,
    lastSyncTime,
    pillarScores,
    latestAdherence,
    refetch: fetchLISData
  };
};
