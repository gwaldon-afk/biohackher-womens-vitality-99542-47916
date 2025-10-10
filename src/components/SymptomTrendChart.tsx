import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SymptomTrendChartProps {
  data: Array<{ tracked_date: string; severity: number }>;
  symptomName: string;
}

export const SymptomTrendChart = ({ data, symptomName }: SymptomTrendChartProps) => {
  const chartData = data.map(item => ({
    date: new Date(item.tracked_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    severity: item.severity
  }));

  const averageSeverity = data.length > 0
    ? (data.reduce((sum, item) => sum + item.severity, 0) / data.length).toFixed(1)
    : '0';

  const trend = data.length >= 2
    ? data[data.length - 1].severity - data[0].severity
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{symptomName} Severity Trend</CardTitle>
        <CardDescription>
          30-day tracking • Avg: {averageSeverity}/10
          {trend !== 0 && (
            <span className={trend < 0 ? "text-success ml-2" : "text-destructive ml-2"}>
              {trend < 0 ? '↓' : '↑'} {Math.abs(trend).toFixed(1)} pts
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[0, 10]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="severity" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};