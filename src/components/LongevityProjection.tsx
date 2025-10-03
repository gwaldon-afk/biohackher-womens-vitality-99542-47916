import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Calendar, Clock, Info, AlertCircle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Link } from "react-router-dom";

interface LongevityProjectionProps {
  sustainedLIS: number;
  dataPoints: number; // How many days of data we have
  currentAge?: number; // User's current age for projected age calculation
}

interface ProjectionData {
  period: string;
  years: number;
  impact: number;
  color: string;
}

const LongevityProjection = ({ sustainedLIS, dataPoints, currentAge = 42 }: LongevityProjectionProps) => {
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
      const totalImprovement = fiveYearImpact - optimalFiveYear; // Gap between current and optimal
      const twentyYearImprovement = twentyYearImpact - optimalTwentyYear;
      
      return {
        type: "empowerment" as const,
        title: "Transform Your Trajectory 🚀",
        message: `Our LIS questionnaire indicates your current path means your biological age is ${fiveYearImpact.toFixed(1)} years older than your actual age just after 5 years. But here's the powerful opportunity: with optimal habits, you could turn it around and your biological age could be ${Math.abs(optimalFiveYear).toFixed(1)} years younger instead. That's a potential overall improvement of ${totalImprovement.toFixed(1)} years just by adopting a longevity-focused lifestyle! This could mean an extra ${totalImprovement.toFixed(1)} years of healthier living to explore life and spend with your loved ones. When calculated over 20 years it could add up to an extra ${twentyYearImprovement.toFixed(1)} years. Priority: sleep quality, physical activity, stress management, and nutrition. To get an accurate assessment of your actual biological age, we recommend you complete a full blood analysis.`,
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
              "Optimising your longevity habits will enhance not just lifespan but healthspan - meaning more years of vitality, mental clarity, physical strength, and overall life satisfaction. The goal is vibrant, high-quality years."
            )}
          </AlertDescription>
        </Alert>

        {/* Projection Chart */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4 text-center">
            Rate of Ageing: Actual vs LIS Biological Age
          </h4>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectionData} margin={{ top: 50, right: 30, left: 20, bottom: 5 }}>
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
                  domain={[(dataMin: number) => Math.floor(dataMin - 0.5), (dataMax: number) => Math.ceil(dataMax + 0.5)]}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}y`}
                  label={{ value: 'Rate of Ageing (Years Impact)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } }}
                />
                <Bar dataKey="impact" radius={[4, 4, 0, 0]}>
                  {projectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="impact"
                    position="top"
                    content={(props: any) => {
                      const { x, y, width, value, index, height } = props;
                      if (index === undefined || !projectionData[index]) return null;
                      const entry = projectionData[index];
                      const lisBioAge = currentAge + entry.years + value;
                      const actualAge = currentAge + entry.years;
                      const bioAgeColor = value > 0 ? '#ef4444' : value < 0 ? '#10b981' : '#6b7280';
                      
                      return (
                        <g>
                          {/* LIS Biological Age - Top label */}
                          <text
                            x={x + width / 2}
                            y={y - 25}
                            fill={bioAgeColor}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="700"
                          >
                            LIS Bio: {lisBioAge.toFixed(1)}yo
                          </text>
                          {/* Actual Age - Second label */}
                          <text
                            x={x + width / 2}
                            y={y - 12}
                            fill="#9ca3af"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="500"
                          >
                            Actual: {actualAge}yo
                          </text>
                        </g>
                      );
                    }}
                  />
                </Bar>
                <ChartTooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value as number;
                      const dataIndex = projectionData.findIndex(d => d.period === label);
                      if (dataIndex === -1) return null;
                      
                      const entry = projectionData[dataIndex];
                      const lisBioAge = currentAge + entry.years + value;
                      const actualAge = currentAge + entry.years;
                      const gap = Math.abs(value);
                      
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
                          <p className="font-semibold text-gray-900 mb-2">{label}</p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-600">Actual Age:</span>
                              <span className="font-semibold text-gray-900">{actualAge} years</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span className="text-gray-600">LIS Bio Age:</span>
                              <span className={`font-semibold ${value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                {lisBioAge.toFixed(1)} years
                              </span>
                            </div>
                            <div className="flex justify-between gap-3 pt-1 border-t border-gray-100">
                              <span className="text-gray-600">Gap:</span>
                              <span className={`font-semibold ${value > 0 ? 'text-red-600' : value < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {gap.toFixed(1)} years {value > 0 ? 'older' : value < 0 ? 'younger' : 'same'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 italic">
                            {value > 0 ? 'Aging faster than chronological age' : value < 0 ? 'Aging slower than chronological age' : 'Aging at normal rate'}
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
          <h4 className="font-semibold text-gray-900 mb-3 text-center">LIS Rate of Ageing Estimates</h4>
          
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
                    const gapFive = Math.abs(currentFiveYear - optimalFiveYear);
                    const currentTwentyYear = projectionData[3].impact;
                    const optimalTwentyYear = optimalProjectionData[3].impact;
                    const gapTwenty = Math.abs(currentTwentyYear - optimalTwentyYear);
                    return `${gapFive.toFixed(1)} years (5yr) | ${gapTwenty.toFixed(1)} years (20yr)`;
                  })()}
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

        {/* Enhanced Disclaimer - Algorithm Transparency */}
        <Alert className="bg-amber-50 border-amber-300">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900 space-y-2">
            <div>
              <strong>Important: About This Projection</strong>
            </div>
            <p>
              This biological age projection uses a <strong>proprietary algorithm</strong> that estimates aging impact based on lifestyle 
              factors (sleep, exercise, nutrition, stress, etc.). While these factors are scientifically validated to influence aging, 
              <strong> this specific calculation is NOT a validated medical biological age test</strong>.
            </p>
            <p>
              <strong>For accurate biological age measurement</strong>, consider professional testing such as:
            </p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Epigenetic testing (DNA methylation clocks like Horvath, GrimAge, PhenoAge)</li>
              <li>Comprehensive blood biomarker panels</li>
              <li>Clinical biological age assessments with your healthcare provider</li>
            </ul>
            <p className="pt-2 border-t border-amber-200 mt-2">
              This tool is designed as a <strong>motivational tracker</strong> to help you visualize the potential impact of lifestyle 
              improvements on longevity, based on current scientific research trends. Results are educational estimates, not medical predictions.
            </p>
          </AlertDescription>
        </Alert>

        {/* Research Basis Note */}
        <div className="text-xs text-muted-foreground text-center">
          Our lifestyle factor weights are based on peer-reviewed longevity research. 
          <Link to="/research-evidence" className="text-primary hover:underline ml-1">
            View our research database →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LongevityProjection;