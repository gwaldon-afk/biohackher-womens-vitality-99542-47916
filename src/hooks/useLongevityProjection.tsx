import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LongevityProjectionData {
  sustainedLIS: number;
  dataPoints: number;
  isLoading: boolean;
  error: string | null;
}

export const useLongevityProjection = (): LongevityProjectionData => {
  const [sustainedLIS, setSustainedLIS] = useState<number>(100);
  const [dataPoints, setDataPoints] = useState<number>(7);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSustainedLIS();
  }, []);

  const fetchSustainedLIS = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock user ID - in real app would come from auth
      const mockUserId = "123e4567-e89b-12d3-a456-426614174000";

      // Fetch last 30 days of LIS scores
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: scores, error: fetchError } = await supabase
        .from('daily_scores')
        .select('longevity_impact_score, date')
        .eq('user_id', mockUserId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (fetchError) {
        console.error('Error fetching scores:', fetchError);
        // Use mock data for demo
        generateMockSustainedLIS();
        return;
      }

      if (!scores || scores.length === 0) {
        // Generate mock sustained LIS for demo
        generateMockSustainedLIS();
        return;
      }

      // Calculate sustained LIS as 30-day rolling average
      const validScores = scores.filter(score => 
        score.longevity_impact_score !== null && 
        score.longevity_impact_score !== undefined
      );

      if (validScores.length > 0) {
        const totalLIS = validScores.reduce((sum, score) => sum + score.longevity_impact_score, 0);
        const averageLIS = totalLIS / validScores.length;
        
        setSustainedLIS(averageLIS);
        setDataPoints(validScores.length);
      } else {
        generateMockSustainedLIS();
      }

    } catch (error) {
      console.error('Error in fetchSustainedLIS:', error);
      setError('Failed to calculate sustained LIS');
      generateMockSustainedLIS();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockSustainedLIS = () => {
    // Generate a realistic mock sustained LIS based on current trends
    // This simulates various scenarios for demonstration
    const scenarios = [
      { lis: 85, points: 21 }, // Needs improvement
      { lis: 105, points: 28 }, // Good trend
      { lis: 115, points: 30 }, // Excellent trend
      { lis: 95, points: 14 },  // Limited data, neutral
      { lis: 78, points: 18 }   // Concerning trend
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setSustainedLIS(randomScenario.lis);
    setDataPoints(randomScenario.points);
  };

  return {
    sustainedLIS,
    dataPoints,
    isLoading,
    error
  };
};