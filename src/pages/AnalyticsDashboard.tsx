import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingUp, Activity, Target, Award, Calendar, Sparkles, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AIInsightsCard } from "@/components/AIInsightsCard";
import { StreakCard } from "@/components/StreakCard";
import { useSubscription } from "@/hooks/useSubscription";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <Navigation />
      
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

            {/* Charts */}
            <Tabs defaultValue="lis" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="lis">LIS Trends</TabsTrigger>
                <TabsTrigger value="adherence">Adherence</TabsTrigger>
                <TabsTrigger value="assessments">Assessments</TabsTrigger>
                <TabsTrigger value="body">Body Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="lis">
                <Card>
                  <CardHeader>
                    <CardTitle>Longevity Impact Score Trends</CardTitle>
                    <CardDescription>
                      Track your daily LIS and biological age impact over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formatLISData().length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={formatLISData()}>
                          <defs>
                            <linearGradient id="colorLIS" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                            </linearGradient>
                            <linearGradient id="colorBioAge" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="lis" 
                            stroke="hsl(var(--primary))" 
                            fillOpacity={1} 
                            fill="url(#colorLIS)" 
                            name="LIS Score" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="bioAge" 
                            stroke="hsl(var(--secondary))" 
                            fillOpacity={1} 
                            fill="url(#colorBioAge)" 
                            name="Bio Age Impact" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                        <Activity className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No LIS data available</p>
                        <p className="text-sm">Complete your first daily assessment to see trends</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adherence">
                <Card>
                  <CardHeader>
                    <CardTitle>Protocol Adherence Rate</CardTitle>
                    <CardDescription>
                      Daily completion percentage of your wellness protocol
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.adherenceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={stats.adherenceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar 
                            dataKey="rate" 
                            fill="hsl(var(--primary))" 
                            name="Adherence %" 
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                        <Target className="h-12 w-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No adherence data yet</p>
                        <p className="text-sm">Start tracking your protocol to see completion rates</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assessments">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Scores by Pillar</CardTitle>
                      <CardDescription>
                        Your latest scores across all wellness pillars
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.assessmentScores.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.assessmentScores} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis dataKey="pillar" type="category" width={100} />
                              <Tooltip />
                              <Bar 
                                dataKey="score" 
                                fill="hsl(var(--primary))" 
                                name="Score" 
                                radius={[0, 8, 8, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                          <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={stats.assessmentScores}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="pillar" />
                              <PolarRadiusAxis domain={[0, 100]} />
                              <Radar 
                                name="Score" 
                                dataKey="score" 
                                stroke="hsl(var(--primary))" 
                                fill="hsl(var(--primary))" 
                                fillOpacity={0.6} 
                              />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                          <Calendar className="h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg font-medium">No assessment data yet</p>
                          <p className="text-sm">Complete pillar assessments to see your wellness profile</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="body">
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Body Composition Trends</CardTitle>
                      <CardDescription>
                        Track changes in weight, body fat, and muscle mass
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formatMeasurementData().length > 0 ? (
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={formatMeasurementData()}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line 
                              yAxisId="left" 
                              type="monotone" 
                              dataKey="weight" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2} 
                              name="Weight (kg)" 
                              dot={{ r: 4 }}
                            />
                            <Line 
                              yAxisId="right" 
                              type="monotone" 
                              dataKey="bodyFat" 
                              stroke="hsl(var(--secondary))" 
                              strokeWidth={2} 
                              name="Body Fat %" 
                              dot={{ r: 4 }}
                            />
                            <Line 
                              yAxisId="left" 
                              type="monotone" 
                              dataKey="muscle" 
                              stroke="hsl(var(--accent))" 
                              strokeWidth={2} 
                              name="Muscle (kg)" 
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground">
                          <Award className="h-12 w-12 mb-4 opacity-50" />
                          <p className="text-lg font-medium">No measurement data yet</p>
                          <p className="text-sm">Add your first progress measurement to track trends</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* AI Insights */}
            <div className="mt-8">
              <AIInsightsCard isPremium={isPremium} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
