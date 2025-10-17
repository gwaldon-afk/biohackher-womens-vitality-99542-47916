import { useNavigate } from "react-router-dom";
import { useEnergyLoop } from "@/hooks/useEnergyLoop";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Award } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function EnergyProgress() {
  const navigate = useNavigate();
  const { recentScores, loading } = useEnergyLoop();

  if (loading) {
    return <div className="container max-w-6xl mx-auto px-4 py-8">Loading...</div>;
  }

  // Prepare chart data
  const chartData = recentScores
    .slice()
    .reverse()
    .map(score => ({
      date: new Date(score.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      energy: Math.round(score.composite_score),
      sleep: Math.round(score.sleep_recovery_score),
      stress: Math.round(score.stress_load_score),
      nutrition: Math.round(score.nutrition_score),
      movement: Math.round(score.movement_quality_score)
    }));

  // Calculate averages
  const avgEnergy = recentScores.reduce((sum, s) => sum + s.composite_score, 0) / (recentScores.length || 1);
  const avgCompletion = recentScores.reduce((sum, s) => sum + s.loop_completion_percent, 0) / (recentScores.length || 1);

  // Calculate variability
  const energyScores = recentScores.slice(0, 7).map(s => s.composite_score);
  const mean = energyScores.reduce((sum, s) => sum + s, 0) / (energyScores.length || 1);
  const variance = energyScores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / (energyScores.length || 1);
  const variability = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - (variability * 3.33));

  // Calculate streak
  let streak = 0;
  const today = new Date();
  for (const score of recentScores) {
    const scoreDate = new Date(score.date);
    const daysDiff = Math.floor((today.getTime() - scoreDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === streak && score.loop_completion_percent >= 80) {
      streak++;
    } else {
      break;
    }
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/energy-loop')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Energy Loop
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Energy Progress & Trends</h1>
        <p className="text-muted-foreground">
          Track your energy patterns and see how consistent habits improve your vitality
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">30-Day Average</h3>
          </div>
          <div className="text-3xl font-bold">{Math.round(avgEnergy)}/100</div>
          <p className="text-sm text-muted-foreground mt-1">Energy Score</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Consistency</h3>
          </div>
          <div className="text-3xl font-bold">{Math.round(consistencyScore)}%</div>
          <p className="text-sm text-muted-foreground mt-1">Energy Stability</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔥</span>
            <h3 className="font-semibold">Current Streak</h3>
          </div>
          <div className="text-3xl font-bold">{streak} days</div>
          <p className="text-sm text-muted-foreground mt-1">80%+ Loop Completion</p>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Energy Trends (Last 30 Days)</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis domain={[0, 100]} className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Composite Energy"
              />
              <Line 
                type="monotone" 
                dataKey="sleep" 
                stroke="#4A90E2" 
                strokeWidth={2}
                name="Sleep"
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                stroke="#F5A623" 
                strokeWidth={2}
                name="Stress"
              />
              <Line 
                type="monotone" 
                dataKey="nutrition" 
                stroke="#7ED321" 
                strokeWidth={2}
                name="Nutrition"
              />
              <Line 
                type="monotone" 
                dataKey="movement" 
                stroke="#E94B8E" 
                strokeWidth={2}
                name="Movement"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-muted-foreground py-20">
            No data yet. Complete your daily check-ins to see trends!
          </div>
        )}
      </Card>

      {/* Loop Completion Over Time */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Loop Completion Rate</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Track how consistently you're gathering data across all 5 segments
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Average Completion</span>
            <span className="font-semibold">{Math.round(avgCompletion)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all"
              style={{ width: `${avgCompletion}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
        <div className="space-y-4">
          {avgEnergy >= 80 && (
            <div className="flex gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="font-medium">Excellent Energy Management</p>
                <p className="text-sm text-muted-foreground">
                  Your average energy score is {Math.round(avgEnergy)}/100. Keep up the great work!
                </p>
              </div>
            </div>
          )}
          
          {consistencyScore >= 80 && (
            <div className="flex gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium">High Energy Consistency</p>
                <p className="text-sm text-muted-foreground">
                  Your energy is stable at {Math.round(consistencyScore)}% consistency. This shows great habit formation.
                </p>
              </div>
            </div>
          )}
          
          {streak >= 5 && (
            <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium">{streak}-Day Streak!</p>
                <p className="text-sm text-muted-foreground">
                  You've maintained 80%+ loop completion for {streak} consecutive days. Outstanding commitment!
                </p>
              </div>
            </div>
          )}
          
          {recentScores.length < 7 && (
            <div className="flex gap-3 p-4 bg-muted rounded-lg">
              <span className="text-2xl">📊</span>
              <div>
                <p className="font-medium">Keep Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Complete {7 - recentScores.length} more check-ins to unlock full trend analysis and pattern detection.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
