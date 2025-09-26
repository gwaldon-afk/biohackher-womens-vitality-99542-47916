import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Calendar, Clock, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface LongevityProjectionProps {
  sustainedLIS: number;
  dataPoints: number; // How many days of data we have
}

interface ProjectionData {
  period: string;
  years: number;
  impact: number;
  color: string;
}

const LongevityProjection = ({ sustainedLIS, dataPoints }: LongevityProjectionProps) => {
  // Algorithm: Calculate longevity age impact based on sustained LIS
  const calculateLongevityImpact = (lis: number, years: number): number => {
    let baseImpact = 0;
    
    // Base 5-year impact calculation
    if (lis >= 60 && lis < 70) {
      baseImpact = 1.5 + ((lis - 60) / 10) * (2.5 - 1.5); // +1.5 to +2.5
    } else if (lis >= 70 && lis < 80) {
      baseImpact = 0.8 + ((lis - 70) / 10) * (1.5 - 0.8); // +0.8 to +1.5
    } else if (lis >= 80 && lis < 90) {
      baseImpact = 0.2 + ((lis - 80) / 10) * (0.8 - 0.2); // +0.2 to +0.8
    } else if (lis >= 90 && lis <= 110) {
      baseImpact = -0.2 + ((lis - 90) / 20) * (0.2 - (-0.2)); // -0.2 to +0.2
    } else if (lis > 110 && lis <= 120) {
      baseImpact = -0.8 + ((lis - 110) / 10) * (-0.2 - (-0.8)); // -0.8 to -0.2
    } else if (lis > 120 && lis <= 130) {
      baseImpact = -1.5 + ((lis - 120) / 10) * (-0.8 - (-1.5)); // -1.5 to -0.8
    } else if (lis > 130 && lis <= 140) {
      baseImpact = -2.5 + ((lis - 130) / 10) * (-1.5 - (-2.5)); // -2.5 to -1.5
    } else if (lis < 60) {
      baseImpact = 2.5; // Maximum negative impact for very low scores
    } else if (lis > 140) {
      baseImpact = -2.5; // Maximum positive impact for very high scores
    }
    
    // Scale impact by time horizon (non-linear progression)
    const scaleFactor = Math.sqrt(years / 5); // Square root scaling for realistic progression
    return baseImpact * scaleFactor;
  };

  // Generate projection data
  const projectionData: ProjectionData[] = [
    { period: "5 Years", years: 5, impact: calculateLongevityImpact(sustainedLIS, 5), color: "" },
    { period: "10 Years", years: 10, impact: calculateLongevityImpact(sustainedLIS, 10), color: "" },
    { period: "15 Years", years: 15, impact: calculateLongevityImpact(sustainedLIS, 15), color: "" },
    { period: "20 Years", years: 20, impact: calculateLongevityImpact(sustainedLIS, 20), color: "" }
  ].map(item => ({
    ...item,
    color: item.impact > 0 ? "#ef4444" : item.impact < 0 ? "#10b981" : "#6b7280"
  }));

  // Determine messaging based on sustained LIS
  const getMotivationalMessage = (lis: number) => {
    if (lis > 110) {
      return {
        type: "celebration" as const,
        title: "Outstanding Work! 🎉",
        message: `You're doing amazing! Keep up this excellent work. If you maintain these habits, your Longevity Age could be ${Math.abs(projectionData[0].impact).toFixed(1)} years younger than your chronological age in 5 years.`,
        color: "text-green-700 bg-green-50 border-green-200"
      };
    } else if (lis >= 90) {
      return {
        type: "encouragement" as const,
        title: "Solid Foundation 💪",
        message: `Your current habits are keeping you on a healthy path. Imagine the potential! Even small improvements could help you achieve a Longevity Age ${Math.abs(projectionData[0].impact).toFixed(1)} years younger in 5 years.`,
        color: "text-blue-700 bg-blue-50 border-blue-200"
      };
    } else {
      return {
        type: "empowerment" as const,
        title: "Great Potential Ahead 🚀",
        message: `Your current habits are impacting your Longevity Age, but here's the great news: you have the power to change that today! Small, consistent improvements can reverse this trend and set you on a path to a healthier future.`,
        color: "text-amber-700 bg-amber-50 border-amber-200"
      };
    }
  };

  const motivationalContent = getMotivationalMessage(sustainedLIS);
  const chartConfig = {
    impact: {
      label: "Longevity Age Impact (Years)",
    },
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Clock className="h-5 w-5 text-purple-500" />
          Longevity Age Projection
        </CardTitle>
        <CardDescription>
          Based on your {dataPoints}-day sustained LIS of {sustainedLIS.toFixed(1)}
          {dataPoints < 30 && (
            <Badge variant="outline" className="ml-2 text-xs">
              Limited Data
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Motivational Message */}
        <Alert className={motivationalContent.color}>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">{motivationalContent.title}</div>
            {motivationalContent.message}
          </AlertDescription>
        </Alert>

        {/* Projection Chart */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 text-center">
            Projected Longevity Age Impact
          </h4>
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  domain={['dataMin - 1', 'dataMax + 1']}
                />
                <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                  {projectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="impact"
                    position="top"
                    style={{ fontSize: '11px', fontWeight: '600' }}
                    formatter={(value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}y`}
                  />
                </Bar>
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className={`text-sm ${value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            Longevity Age: {value > 0 ? '+' : ''}{value.toFixed(1)} years
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {value > 0 ? 'Older than chronological age' : value < 0 ? 'Younger than chronological age' : 'Same as chronological age'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Impact Summary */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">Current Trend</div>
            <div className={`flex items-center gap-1 ${sustainedLIS >= 100 ? 'text-green-600' : 'text-red-600'}`}>
              {sustainedLIS >= 100 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <span className="font-semibold">
                {sustainedLIS >= 100 ? 'Positive' : 'Needs Improvement'}
              </span>
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900 mb-1">Data Quality</div>
            <div className={`${dataPoints >= 30 ? 'text-green-600' : dataPoints >= 14 ? 'text-amber-600' : 'text-red-600'}`}>
              {dataPoints >= 30 ? 'Excellent' : dataPoints >= 14 ? 'Good' : 'Limited'}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <Alert className="bg-gray-50 border-gray-200">
          <Info className="h-4 w-4 text-gray-500" />
          <AlertDescription className="text-xs text-gray-600">
            <strong>Disclaimer:</strong> This projection is a model-based estimate based on your recent health trends and current scientific research. 
            It is not a medical diagnosis or a guarantee of future health outcomes. Your longevity is influenced by a complex interplay of genetics, 
            environment, and lifestyle, and this feature is intended as a motivational tool to support your wellness journey.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LongevityProjection;