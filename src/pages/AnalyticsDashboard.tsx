import { Suspense, lazy, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Activity, Target, Award, Calendar, Sparkles, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { StreakCard } from "@/components/StreakCard";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LazyOnVisible } from "@/components/performance/LazyOnVisible";

const AnalyticsDashboardCharts = lazy(() => import("./AnalyticsDashboardCharts"));

interface DashboardStats {
  lisScores: any[];
  adherenceData: any[];
  assessmentScores: any[];
  measurements: any[];
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [stats, setStats] = useState<DashboardStats>({
    lisScores: [],
    adherenceData: [],
    assessmentScores: [],
    measurements: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  const isPremium = subscription?.subscription_tier === 'premium';

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, timeRange]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));

      // Fetch LIS scores
      const { data: lisScores } = await supabase
        .from('daily_scores')
        .select('date, longevity_impact_score, biological_age_impact, color_code')
        .eq('user_id', user.id)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Fetch protocol adherence
      const { data: adherence } = await supabase
        .from('protocol_adherence')
        .select('date, completed, protocol_item_id')
        .eq('user_id', user.id)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      // Calculate daily adherence rate
      const adherenceByDate = adherence?.reduce((acc: any, item) => {
        const date = item.date;
        if (!acc[date]) {
          acc[date] = { total: 0, completed: 0 };
        }
        acc[date].total++;
        if (item.completed) acc[date].completed++;
        return acc;
      }, {});

      const adherenceData = Object.entries(adherenceByDate || {}).map(([date, data]: [string, any]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date,
        rate: Math.round((data.completed / data.total) * 100)
      }));

      // Fetch assessment scores by pillar
      const { data: assessments } = await supabase
        .from('user_assessment_completions')
        .select('pillar, score, completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', daysAgo.toISOString())
        .order('completed_at', { ascending: true });

      // Group by pillar and get latest score for each
      const assessmentsByPillar = assessments?.reduce((acc: any, item) => {
        if (!acc[item.pillar] || new Date(item.completed_at) > new Date(acc[item.pillar].completed_at)) {
          acc[item.pillar] = item;
        }
        return acc;
      }, {});

      const assessmentScores = Object.values(assessmentsByPillar || {}).map((item: any) => ({
        pillar: item.pillar,
        score: item.score
      }));

      // Fetch measurements
      const { data: measurements } = await supabase
        .from('progress_measurements')
        .select('date, weight, body_fat_percentage, muscle_mass, waist_circumference')
        .eq('user_id', user.id)
        .gte('date', daysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      setStats({
        lisScores: lisScores || [],
        adherenceData: adherenceData || [],
        assessmentScores: assessmentScores || [],
        measurements: measurements || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLISData = () => {
    return stats.lisScores.map(score => ({
      date: new Date(score.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      lis: score.longevity_impact_score,
      bioAge: Math.abs(score.biological_age_impact)
    }));
  };

  const formatMeasurementData = () => {
    return stats.measurements.map(m => ({
      date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: m.weight,
      bodyFat: m.body_fat_percentage,
      muscle: m.muscle_mass,
      waist: m.waist_circumference
    }));
  };

  const getLatestLIS = () => {
    if (stats.lisScores.length === 0) return null;
    return stats.lisScores[stats.lisScores.length - 1];
  };

  const getAverageAdherence = () => {
    if (stats.adherenceData.length === 0) return 0;
    const sum = stats.adherenceData.reduce((acc, item) => acc + item.rate, 0);
    return Math.round(sum / stats.adherenceData.length);
  };

  const getLISTrend = () => {
    if (stats.lisScores.length < 2) return { direction: 'stable', change: 0 };
    const latest = stats.lisScores[stats.lisScores.length - 1].longevity_impact_score;
    const previous = stats.lisScores[stats.lisScores.length - 2].longevity_impact_score;
    const change = latest - previous;
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      change: Math.abs(change).toFixed(1)
    };
  };

  const latestLIS = getLatestLIS();
  const avgAdherence = getAverageAdherence();
  const lisTrend = getLISTrend();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Analytics <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Deep insights into your wellness journey
            </p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your analytics...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Latest LIS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2">
                    <div className="text-3xl font-bold">
                      {latestLIS ? latestLIS.longevity_impact_score.toFixed(1) : 'N/A'}
                    </div>
                    {lisTrend.direction !== 'stable' && (
                      <div className={`flex items-center gap-1 mb-1 ${lisTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {lisTrend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span className="text-sm">{lisTrend.change}</span>
                      </div>
                    )}
                  </div>
                  {latestLIS && (
                    <Badge variant={latestLIS.color_code === 'green' ? 'default' : 'destructive'} className="mt-2">
                      {latestLIS.color_code} day
                    </Badge>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Adherence Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{avgAdherence}%</div>
                  <p className="text-xs text-muted-foreground mt-2">Average protocol completion</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Assessments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.assessmentScores.length}</div>
                  <p className="text-xs text-muted-foreground mt-2">Pillars assessed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Data Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {stats.lisScores.length + stats.measurements.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Total tracked</p>
                </CardContent>
              </Card>
            </div>

            {/* Streaks */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <StreakCard 
                activityType="daily_assessment"
                title="Daily Check-ins"
                description="Consecutive days completing assessments"
              />
              <StreakCard 
                activityType="protocol_adherence"
                title="Protocol Adherence"
                description="Consecutive days following protocol"
              />
              <StreakCard 
                activityType="measurements"
                title="Progress Tracking"
                description="Consecutive days recording data"
              />
            </div>

            {/* Charts (lazy-loaded + mounted on visibility) */}
            <LazyOnVisible
              minHeight={520}
              fallback={
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">Loading charts…</CardContent>
                </Card>
              }
            >
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">Loading charts…</CardContent>
                  </Card>
                }
              >
                <AnalyticsDashboardCharts
                  lisData={formatLISData()}
                  adherenceData={stats.adherenceData}
                  assessmentScores={stats.assessmentScores}
                  measurementData={formatMeasurementData()}
                />
              </Suspense>
            </LazyOnVisible>

            {/* AI Insights */}
            <div className="mt-8">
              <AIInsightsCard />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
