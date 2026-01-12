import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; value: number | null };

type ProgressTrackingChartsProps = {
  weightData: Point[];
  bodyFatData: Point[];
  muscleData: Point[];
  waistData: Point[];
  hipData: Point[];
};

export default function ProgressTrackingCharts({
  weightData,
  bodyFatData,
  muscleData,
  waistData,
  hipData,
}: ProgressTrackingChartsProps) {
  const lineStroke = "hsl(var(--primary))";

  return (
    <Tabs defaultValue="weight" className="space-y-6">
      <TabsList>
        <TabsTrigger value="weight">Weight</TabsTrigger>
        <TabsTrigger value="body_fat">Body Fat %</TabsTrigger>
        <TabsTrigger value="muscle">Muscle Mass</TabsTrigger>
        <TabsTrigger value="measurements">Measurements</TabsTrigger>
      </TabsList>

      <TabsContent value="weight">
        <Card>
          <CardHeader>
            <CardTitle>Weight Trend</CardTitle>
            <CardDescription>Track your weight changes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={lineStroke} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="body_fat">
        <Card>
          <CardHeader>
            <CardTitle>Body Fat Percentage</CardTitle>
            <CardDescription>Monitor your body composition</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bodyFatData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={lineStroke} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="muscle">
        <Card>
          <CardHeader>
            <CardTitle>Muscle Mass</CardTitle>
            <CardDescription>Track your muscle development</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={muscleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke={lineStroke} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="measurements">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Waist Circumference</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={waistData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={lineStroke} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hip Circumference</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={hipData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={lineStroke} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

