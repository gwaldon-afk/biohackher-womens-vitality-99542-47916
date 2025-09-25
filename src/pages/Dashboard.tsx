import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { TrendingUp, TrendingDown, Activity, Heart, Moon, Brain, Users, Utensils } from "lucide-react";
import Navigation from "@/components/Navigation";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, ReferenceLine, Scatter, LabelList } from 'recharts';
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyScore {
  date: string;
  longevity_impact_score: number;
  biological_age_impact: number;
  color_code: 'green' | 'red';
  moving_average: number;
  sleep_score: number;
  stress_score: number;
  physical_activity_score: number;
  nutrition_score: number;
  social_connections_score: number;
  cognitive_engagement_score: number;
}

interface ScoreSummary {
  total_days: number;
  average_score: number;
  total_biological_age_impact: number;
  green_days: number;
  red_days: number;
}

const Dashboard = () => {
  const [scores, setScores] = useState<DailyScore[]>([]);
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScoreHistory();
  }, []);

  const fetchScoreHistory = async () => {
    try {
      // Mock user ID - in real app would come from auth
      const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
      
      const response = await supabase.functions.invoke('score-history', {
        body: {
          user_id: mockUserId,
          days: 7
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { scores: fetchedScores, summary: fetchedSummary } = response.data;
      
      // Generate mock data if no scores exist
      if (fetchedScores.length === 0) {
        const mockScores = generateMockScores();
        setScores(mockScores);
        
        // Calculate summary from actual mock data
        const avgScore = mockScores.reduce((sum, s) => sum + s.longevity_impact_score, 0) / mockScores.length;
        const totalBioAge = mockScores.reduce((sum, s) => sum + s.biological_age_impact, 0);
        const greenDays = mockScores.filter(s => s.biological_age_impact > 0).length;
        const redDays = mockScores.filter(s => s.biological_age_impact < 0).length;
        
        setSummary({
          total_days: mockScores.length,
          average_score: parseFloat(avgScore.toFixed(2)),
          total_biological_age_impact: parseFloat(totalBioAge.toFixed(2)),
          green_days: greenDays,
          red_days: redDays
        });
      } else {
        setScores(fetchedScores);
        setSummary(fetchedSummary);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
      // Show mock data on error
      const mockScores = generateMockScores();
      setScores(mockScores);
      
      // Calculate summary from actual mock data
      const avgScore = mockScores.reduce((sum, s) => sum + s.longevity_impact_score, 0) / mockScores.length;
      const totalBioAge = mockScores.reduce((sum, s) => sum + s.biological_age_impact, 0);
      const greenDays = mockScores.filter(s => s.biological_age_impact > 0).length;
      const redDays = mockScores.filter(s => s.biological_age_impact < 0).length;
      
      setSummary({
        total_days: mockScores.length,
        average_score: parseFloat(avgScore.toFixed(2)),
        total_biological_age_impact: parseFloat(totalBioAge.toFixed(2)),
        green_days: greenDays,
        red_days: redDays
      });
      
      toast({
        title: "Demo Mode",
        description: "Showing sample data. Connect your wearables to see real scores.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockScores = (): DailyScore[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const possibleValues = [-2, -1, 1, 2]; // Removed 0 - every day has some impact
    
    return days.map((day, index) => {
      // Generate discrete scores on a 4-point scale (-2, -1, +1, +2)
      const biologicalImpact = possibleValues[Math.floor(Math.random() * possibleValues.length)];
      const score = 50 + (biologicalImpact * 12.5); // Convert to 0-100 scale for display
      
      return {
        date: day,
        longevity_impact_score: parseFloat(score.toFixed(1)),
        biological_age_impact: biologicalImpact,
        color_code: biologicalImpact > 0 ? 'green' : 'red' as 'green' | 'red',
        moving_average: 0, // Will be calculated below
        sleep_score: 65 + Math.random() * 25,
        stress_score: 55 + Math.random() * 30,
        physical_activity_score: 60 + Math.random() * 30,
        nutrition_score: 50 + Math.random() * 35,
        social_connections_score: 45 + Math.random() * 40,
        cognitive_engagement_score: 55 + Math.random() * 25
      };
    }).map((score, index, array) => {
      // Calculate cumulative moving average up to this point
      const scoresUpToNow = array.slice(0, index + 1);
      const cumulativeSum = scoresUpToNow.reduce((sum, s) => sum + s.biological_age_impact, 0);
      const movingAverage = cumulativeSum / (index + 1);
      
      return {
        ...score,
        moving_average: parseFloat(movingAverage.toFixed(2))
      };
    });
  };

  // Current day's pillar scores for display
  const currentDayScores = scores.length > 0 ? scores[scores.length - 1] : null;
  
  const pillarMetrics = [
    { 
      name: "Sleep Quality", 
      value: currentDayScores?.sleep_score || 78, 
      trend: "up", 
      icon: Moon, 
      color: "text-blue-500",
      weight: "25%" 
    },
    { 
      name: "Stress Management", 
      value: currentDayScores?.stress_score || 65, 
      trend: "up", 
      icon: Heart, 
      color: "text-red-500",
      weight: "20%" 
    },
    { 
      name: "Physical Activity", 
      value: currentDayScores?.physical_activity_score || 82, 
      trend: "up", 
      icon: Activity, 
      color: "text-green-500",
      weight: "15%" 
    },
    { 
      name: "Nutrition", 
      value: currentDayScores?.nutrition_score || 72, 
      trend: "down", 
      icon: Utensils, 
      color: "text-orange-500",
      weight: "15%" 
    },
    { 
      name: "Social Connections", 
      value: currentDayScores?.social_connections_score || 68, 
      trend: "up", 
      icon: Users, 
      color: "text-purple-500",
      weight: "15%" 
    },
    { 
      name: "Cognitive Engagement", 
      value: currentDayScores?.cognitive_engagement_score || 74, 
      trend: "up", 
      icon: Brain, 
      color: "text-pink-500",
      weight: "10%" 
    }
  ];

  // Calculate weekly cumulative score - sum of daily biological age impact scores  
  const weeklyScore = scores.reduce((sum, score) => sum + score.biological_age_impact, 0);
  const weeklyColor = weeklyScore >= 0 ? 'text-green-600' : 'text-red-600';

  const currentScore = summary?.average_score || 72.5;
  const bioAgeImpact = summary?.total_biological_age_impact || weeklyScore;

  const chartConfig = {
    biological_age_impact: {
      label: "Daily LIS Score",
      color: "hsl(var(--primary))",
    },
    moving_average: {
      label: "Cumulative Average",
      color: "#8884d8",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Longevity Impact Score */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Welcome back, <span className="gradient-text">Sarah</span>
          </h1>
          
          <Card className="max-w-md mx-auto bg-white shadow-lg border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Your Longevity Impact Score</CardTitle>
              <CardDescription className="text-gray-600">
                LISE - Daily biological age impact assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center mb-4">
                <ProgressCircle value={currentScore} size="xl">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">{currentScore.toFixed(1)}</div>
                    <div className="text-sm text-gray-500">LIS</div>
                  </div>
                </ProgressCircle>
              </div>
              <div className="text-sm text-gray-600">
                {bioAgeImpact >= 0 ? (
                  <span className="font-semibold text-green-600">
                    -{Math.abs(bioAgeImpact).toFixed(1)} days biological age this week
                  </span>
                ) : (
                  <span className="font-semibold text-red-600">
                    +{Math.abs(bioAgeImpact).toFixed(1)} days biological age this week
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* LIS Chart Section */}
        <Card className="mb-8 bg-white shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              📊 Weekly Longevity Impact Scores
            </CardTitle>
            <CardDescription>
              Daily scores with 7-day moving average trend line
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={scores} margin={{ top: 50, right: 30, left: 20, bottom: 45 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e5e7eb" strokeOpacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280', dy: 20 }}
                  />
                  <YAxis 
                    domain={[-2, 2]} 
                    tickCount={4} 
                    ticks={[-2, -1, 1, 2]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
                  <Bar 
                    dataKey="biological_age_impact" 
                    name="Daily LIS Score"
                    maxBarSize={1}
                    radius={[0, 0, 0, 0]}
                  >
                    {scores.map((entry, index) => (
                      <Cell key={`bar-cell-${index}`} fill={entry.biological_age_impact > 0 ? '#10b981' : '#f87171'} />
                    ))}
                    <LabelList
                      dataKey="longevity_impact_score"
                      position="top"
                      offset={18}
                      style={{ fontSize: '10px', fill: '#374151', fontWeight: '500' }}
                      formatter={(value: number) => value.toFixed(0)}
                    />
                  </Bar>
                  <Scatter 
                    dataKey="biological_age_impact" 
                    name="Bar Tips"
                    fill="#10b981"
                  >
                    {scores.map((entry, index) => (
                      <Cell key={`scatter-cell-${index}`} fill={entry.biological_age_impact > 0 ? '#10b981' : '#f87171'} />
                    ))}
                  </Scatter>
                  <Line 
                    type="monotone" 
                    dataKey="moving_average" 
                    stroke="#6366f1" 
                    strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
                    name="Cumulative Average"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </ComposedChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="flex justify-between items-center mt-4">
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Positive Impact ({summary?.green_days || scores.filter(s => s.biological_age_impact > 0).length} days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-2 border-t-2 border-dashed border-gray-600"></div>
                  <span>No Impact</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Negative Impact ({summary?.red_days || scores.filter(s => s.biological_age_impact < 0).length} days)</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Weekly Longevity Score</div>
                <div className={`text-lg font-bold ${weeklyColor}`}>
                  {weeklyScore >= 0 ? '+' : ''}{weeklyScore.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Longevity Pillars Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Six Longevity Pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillarMetrics.map((metric) => (
              <Card key={metric.name} className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <metric.icon className={`h-5 w-5 ${metric.color}`} />
                      <div>
                        <h3 className="font-medium text-gray-900">{metric.name}</h3>
                        <p className="text-xs text-gray-500">Weight: {metric.weight}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <ProgressCircle value={metric.value} size="md">
                      <span className="text-sm font-semibold text-gray-900">{Math.round(metric.value)}</span>
                    </ProgressCircle>
                    
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Impact</div>
                      <div className="text-sm font-medium text-gray-900">
                        {metric.trend === "up" ? "+" : "-"}{(Math.random() * 0.3).toFixed(1)}d
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Data Input Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex-col gap-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Heart className="h-5 w-5" />
            Log Daily Mood
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Activity className="h-5 w-5" />
            Sync Wearables
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Brain className="h-5 w-5" />
            Track Habits
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
            <Users className="h-5 w-5" />
            Journal Entry
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;