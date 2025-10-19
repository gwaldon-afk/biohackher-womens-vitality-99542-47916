import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Battery } from 'lucide-react';

interface EnergyPredictionProps {
  currentScore?: number;
  recentScores?: Array<{ date: string; composite_score: number }>;
}

export const EnergyPrediction = ({ currentScore, recentScores }: EnergyPredictionProps) => {
  // Generate predicted energy curve for the day
  const generateEnergyPattern = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const baseScore = currentScore || 60;
    
    return hours.map(hour => {
      let score = baseScore;
      
      // Morning peak (8-10am)
      if (hour >= 8 && hour <= 10) score += 15;
      // Midday dip (1-3pm)
      else if (hour >= 13 && hour <= 15) score -= 10;
      // Evening recovery (6-8pm)
      else if (hour >= 18 && hour <= 20) score += 5;
      // Night decline
      else if (hour >= 22 || hour <= 5) score -= 20;
      
      return {
        hour: hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`,
        energy: Math.max(0, Math.min(100, score + (Math.random() * 10 - 5)))
      };
    });
  };

  const data = generateEnergyPattern();
  const currentHour = new Date().getHours();
  const peakHour = data.reduce((max, curr) => curr.energy > max.energy ? curr : max, data[0]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="w-5 h-5 text-primary" />
          Today's Energy Prediction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 10 }}
                interval={3}
              />
              <YAxis hide />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="energy" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>Peak energy expected at <strong>{peakHour.hour}</strong></span>
          </div>
          <p className="text-xs text-muted-foreground">
            Schedule demanding tasks during your peak hours for best results.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
