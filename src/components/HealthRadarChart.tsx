import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryScores {
  energy_sleep: number;
  cognitive: number;
  emotional: number;
  physical: number;
  hormonal: number;
  digestive: number;
}

interface HealthRadarChartProps {
  categoryScores: CategoryScores;
  height?: number;
}

export const HealthRadarChart = ({ 
  categoryScores, 
  height = 400 
}: HealthRadarChartProps) => {
  const data = [
    { category: 'Energy & Sleep', score: categoryScores.energy_sleep, fullMark: 100 },
    { category: 'Cognitive', score: categoryScores.cognitive, fullMark: 100 },
    { category: 'Emotional', score: categoryScores.emotional, fullMark: 100 },
    { category: 'Physical', score: categoryScores.physical, fullMark: 100 },
    { category: 'Hormonal', score: categoryScores.hormonal, fullMark: 100 },
    { category: 'Digestive', score: categoryScores.digestive, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'hsl(var(--chart-1))'; // Green
    if (score >= 60) return 'hsl(var(--chart-2))'; // Blue
    if (score >= 40) return 'hsl(var(--chart-3))'; // Yellow
    return 'hsl(var(--chart-4))'; // Red
  };

  // Use average score to determine overall color
  const avgScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / 6;
  const chartColor = getScoreColor(avgScore);

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={height}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Health Score"
              dataKey="score"
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.5}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        
        {/* Category Score Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span className="text-sm font-medium">{item.category}</span>
              <span 
                className="text-sm font-bold"
                style={{ color: getScoreColor(item.score) }}
              >
                {Math.round(item.score)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
