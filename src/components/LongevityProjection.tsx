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

  // Generate projection data for both current and optimal scenarios
  const projectionData: ProjectionData[] = [
    { period: "5 Years", years: 5, impact: calculateLongevityImpact(sustainedLIS, 5), color: "" },
    { period: "10 Years", years: 10, impact: calculateLongevityImpact(sustainedLIS, 10), color: "" },
    { period: "15 Years", years: 15, impact: calculateLongevityImpact(sustainedLIS, 15), color: "" },
    { period: "20 Years", years: 20, impact: calculateLongevityImpact(sustainedLIS, 20), color: "" }
  ].map(item => ({
    ...item,
    color: item.impact > 0 ? "#ef4444" : item.impact < 0 ? "#10b981" : "#6b7280"
  }));

  // Generate optimal projection data (LIS = 135)
  const optimalProjectionData: ProjectionData[] = [
    { period: "5 Years", years: 5, impact: calculateLongevityImpact(135, 5), color: "#10b981" },
    { period: "10 Years", years: 10, impact: calculateLongevityImpact(135, 10), color: "#10b981" },
    { period: "15 Years", years: 15, impact: calculateLongevityImpact(135, 15), color: "#10b981" },
    { period: "20 Years", years: 20, impact: calculateLongevityImpact(135, 20), color: "#10b981" }
  ];

  // Determine messaging based on sustained LIS and actual impact
  const getMotivationalMessage = (lis: number) => {
    const fiveYearImpact = projectionData[0].impact;
    const twentyYearImpact = projectionData[3].impact;
    const optimalFiveYear = optimalProjectionData[0].impact;
    const optimalTwentyYear = optimalProjectionData[3].impact;
    
    // If the 5-year impact is significantly negative (younger), celebrate
    if (fiveYearImpact < -0.5) {
      return {
        type: "celebration" as const,
        title: "Excellent Trajectory! 🎉",
        message: `Outstanding! Your current habits project to ${Math.abs(fiveYearImpact).toFixed(1)} years younger in 5 years (${Math.abs(twentyYearImpact).toFixed(1)} in 20 years). With optimal habits, you could potentially reach ${Math.abs(optimalFiveYear).toFixed(1)} years younger in 5 years!`,
        color: "text-green-700 bg-green-50 border-green-200"
      };
    }
    // If impact is neutral/minimal, be honest about limited impact
    else if (fiveYearImpact <= 0.5 && fiveYearImpact >= -0.5) {
      return {
        type: "encouragement" as const,
        title: "Huge Potential Ahead 💪",
        message: `Your current habits show minimal impact (${fiveYearImpact > 0 ? '+' : ''}${fiveYearImpact.toFixed(1)} years). But here's the exciting part: with optimal habits, you could achieve ${Math.abs(optimalFiveYear).toFixed(1)} years younger in 5 years! Focus on: consistent sleep (7-8hrs), regular exercise, stress management, and nutrition.`,
        color: "text-blue-700 bg-blue-50 border-blue-200"
      };
    }
    // If impact is positive (aging faster), be direct about need for change
    else {
      return {
        type: "empowerment" as const,
        title: "Transform Your Trajectory 🚀",
        message: `Your current path adds ${fiveYearImpact.toFixed(1)} years to your biological age in 5 years. But here's the powerful opportunity: with optimal habits, you could achieve ${Math.abs(optimalFiveYear).toFixed(1)} years younger instead - shifting from aging ${fiveYearImpact.toFixed(1)} years faster to ${Math.abs(optimalFiveYear).toFixed(1)} years slower! Priority: sleep quality, physical activity, stress management, and nutrition.`,
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

        {/* Quality of Life Assessment */}
        <Alert className="bg-indigo-50 border-indigo-200 text-indigo-700">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-1">🌟 Quality of Life Impact</div>
            {sustainedLIS >= 100 ? (
              "Your current habits don't just add years to your life - they add life to your years! You're likely experiencing better energy, cognitive function, emotional wellbeing, and physical vitality that compound over time."
            ) : (
              "Optimizing your longevity habits will enhance not just lifespan but healthspan - meaning more years of vitality, mental clarity, physical strength, and overall life satisfaction. The goal is vibrant, high-quality years."
            )}
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
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}y`}
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

        {/* Key Projections Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">Key Longevity Age Estimates</h4>
          
          {/* Current vs Optimal Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Current Projections */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">Current Habits</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">5-Year</div>
                  <div className={`text-lg font-bold ${projectionData[0].impact > 0 ? 'text-red-600' : projectionData[0].impact < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {projectionData[0].impact > 0 ? `+${projectionData[0].impact.toFixed(1)}y older` : projectionData[0].impact < 0 ? `${Math.abs(projectionData[0].impact).toFixed(1)}y younger` : `${projectionData[0].impact.toFixed(1)}y same`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">20-Year</div>
                  <div className={`text-lg font-bold ${projectionData[3].impact > 0 ? 'text-red-600' : projectionData[3].impact < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {projectionData[3].impact > 0 ? `+${projectionData[3].impact.toFixed(1)}y older` : projectionData[3].impact < 0 ? `${Math.abs(projectionData[3].impact).toFixed(1)}y younger` : `${projectionData[3].impact.toFixed(1)}y same`}
                  </div>
                </div>
              </div>
            </div>

            {/* Optimal Projections */}
            <div className="border-l border-purple-200 pl-4 md:pl-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">Optimal Habits Potential</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">5-Year</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.abs(optimalProjectionData[0].impact).toFixed(1)}y younger
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">20-Year</div>
                  <div className="text-lg font-bold text-green-600">
                    {Math.abs(optimalProjectionData[3].impact).toFixed(1)}y younger
                  </div>
                </div>
              </div>
              
              {/* Opportunity Gap */}
              <div className="mt-3 text-center">
                <div className="text-xs text-purple-600 font-medium">
                  Opportunity Gap: {(() => {
                    const currentFiveYear = projectionData[0].impact;
                    const optimalFiveYear = optimalProjectionData[0].impact;
                    const gap = Math.abs(currentFiveYear - optimalFiveYear);
                    return `${gap.toFixed(1)} years`;
                  })()} (5yr)
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-center text-gray-600">
            Current based on sustained LIS of {sustainedLIS.toFixed(1)} • Optimal assumes LIS of 135
          </div>
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