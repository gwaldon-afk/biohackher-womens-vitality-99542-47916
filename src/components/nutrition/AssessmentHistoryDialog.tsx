import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function AssessmentHistoryDialog({ open, onOpenChange, userId }: Props) {
  const { data: assessments = [], isLoading } = useQuery({
    queryKey: ['nutrition-assessment-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('longevity_nutrition_assessments')
        .select('id, longevity_nutrition_score, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId && open,
  });

  // Transform data for chart (reverse for chronological order)
  const chartData = [...assessments].reverse().map(a => ({
    date: format(new Date(a.completed_at), 'MMM d'),
    score: a.longevity_nutrition_score,
    fullDate: format(new Date(a.completed_at), 'MMMM d, yyyy'),
  }));

  const calculateTrend = (current: number, previous: number | undefined): 'up' | 'down' | 'same' => {
    if (!previous) return 'same';
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'same';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assessment History & Progress</DialogTitle>
          <DialogDescription>
            Track your nutrition score progression over time
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No assessment history found
          </div>
        ) : (
          <div className="space-y-6">
            {/* Line Chart Visualization */}
            {chartData.length >= 2 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Score Progression</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        domain={[0, 100]} 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
                      />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-background border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{payload[0].payload.fullDate}</p>
                                <p className="text-primary font-bold text-lg">
                                  Score: {payload[0].value}/100
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      {/* Reference lines for grade thresholds */}
                      <ReferenceLine y={90} stroke="hsl(142 76% 36%)" strokeDasharray="3 3" label={{ value: 'A', fill: 'hsl(142 76% 36%)' }} />
                      <ReferenceLine y={70} stroke="hsl(38 92% 50%)" strokeDasharray="3 3" label={{ value: 'B', fill: 'hsl(38 92% 50%)' }} />
                      <ReferenceLine y={50} stroke="hsl(0 84% 60%)" strokeDasharray="3 3" label={{ value: 'D', fill: 'hsl(0 84% 60%)' }} />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Assessment List with Trend Indicators */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Assessment History</h3>
              {assessments.map((assessment, index) => {
                const previousScore = assessments[index + 1]?.longevity_nutrition_score;
                const trend = calculateTrend(assessment.longevity_nutrition_score, previousScore);
                const scoreDiff = previousScore 
                  ? assessment.longevity_nutrition_score - previousScore 
                  : 0;

                return (
                  <Card key={assessment.id} className={index === 0 ? 'border-2 border-primary' : ''}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {format(new Date(assessment.completed_at), 'MMMM d, yyyy')}
                            {index === 0 && <span className="ml-2 text-primary font-semibold">(Most Recent)</span>}
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {assessment.longevity_nutrition_score}
                            <span className="text-sm text-muted-foreground ml-2">/100</span>
                          </div>
                          
                          {/* Trend Indicator */}
                          {previousScore && (
                            <div className={`flex items-center gap-1 mt-2 text-sm ${
                              trend === 'up' ? 'text-green-600' : 
                              trend === 'down' ? 'text-red-600' : 
                              'text-muted-foreground'
                            }`}>
                              {trend === 'up' && <TrendingUp className="h-4 w-4" />}
                              {trend === 'down' && <TrendingDown className="h-4 w-4" />}
                              {trend === 'same' && <Minus className="h-4 w-4" />}
                              <span>
                                {trend === 'up' && `+${scoreDiff.toFixed(1)} points from previous`}
                                {trend === 'down' && `${scoreDiff.toFixed(1)} points from previous`}
                                {trend === 'same' && 'No change from previous'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/longevity-nutrition/results?id=${assessment.id}`}>
                            View Results
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
