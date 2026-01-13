import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Award, Calendar, Target } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type LisPoint = { date: string; lis: number; bioAge: number };
type AdherencePoint = { date: string; fullDate?: string; rate: number };
type AssessmentScore = { pillar: string; score: number };
type MeasurementPoint = { date: string; weight: number | null; bodyFat: number | null; muscle: number | null; waist: number | null };

type AnalyticsDashboardChartsProps = {
  lisData: LisPoint[];
  adherenceData: AdherencePoint[];
  assessmentScores: AssessmentScore[];
  measurementData: MeasurementPoint[];
};

export default function AnalyticsDashboardCharts({
  lisData,
  adherenceData,
  assessmentScores,
  measurementData,
}: AnalyticsDashboardChartsProps) {
  return (
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
            <CardDescription>Track your daily LIS and biological age impact over time</CardDescription>
          </CardHeader>
          <CardContent>
            {lisData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={lisData}>
                  <defs>
                    <linearGradient id="colorLIS" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorBioAge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
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
            <CardDescription>Daily completion percentage of your wellness protocol</CardDescription>
          </CardHeader>
          <CardContent>
            {adherenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={adherenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="rate" fill="hsl(var(--primary))" name="Adherence %" radius={[8, 8, 0, 0]} />
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
              <CardDescription>Your latest scores across all wellness pillars</CardDescription>
            </CardHeader>
            <CardContent>
              {assessmentScores.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={assessmentScores} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="pillar" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" name="Score" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={assessmentScores}>
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
              <CardDescription>Track changes in weight, body fat, and muscle mass</CardDescription>
            </CardHeader>
            <CardContent>
              {measurementData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={measurementData}>
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
  );
}

