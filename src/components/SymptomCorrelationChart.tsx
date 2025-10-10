import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SymptomCorrelationChartProps {
  symptomData: Array<{ tracked_date: string; severity: number }>;
  adherenceData: Array<{ date: string; adherence: number }>;
  symptomName: string;
}

export const SymptomCorrelationChart = ({ 
  symptomData, 
  adherenceData, 
  symptomName 
}: SymptomCorrelationChartProps) => {
  // Merge data by date
  const mergedData = symptomData.map(symptom => {
    const adherence = adherenceData.find(a => a.date === symptom.tracked_date);
    return {
      date: new Date(symptom.tracked_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      severity: symptom.severity,
      adherence: adherence?.adherence || 0
    };
  });

  // Calculate correlation coefficient
  const calculateCorrelation = () => {
    if (mergedData.length < 2) return 0;
    
    const n = mergedData.length;
    const sumX = mergedData.reduce((sum, d) => sum + d.adherence, 0);
    const sumY = mergedData.reduce((sum, d) => sum + d.severity, 0);
    const sumXY = mergedData.reduce((sum, d) => sum + d.adherence * d.severity, 0);
    const sumX2 = mergedData.reduce((sum, d) => sum + d.adherence * d.adherence, 0);
    const sumY2 = mergedData.reduce((sum, d) => sum + d.severity * d.severity, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation();
  const correlationText = 
    correlation < -0.5 ? "Strong negative correlation (Good!)" :
    correlation < -0.2 ? "Moderate negative correlation" :
    correlation < 0.2 ? "Weak correlation" :
    correlation < 0.5 ? "Moderate positive correlation" :
    "Strong positive correlation";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protocol Adherence vs {symptomName}</CardTitle>
        <CardDescription>
          Correlation: {correlation.toFixed(2)} • {correlationText}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mergedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 10]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Severity', angle: -90, position: 'insideLeft' }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Adherence %', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="severity" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name={`${symptomName} Severity`}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="adherence" 
              stroke="hsl(var(--success))" 
              strokeWidth={2}
              name="Protocol Adherence"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};