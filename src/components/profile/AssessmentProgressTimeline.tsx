import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface AssessmentData {
  id: string;
  type: string;
  completedAt: Date;
  score: number | null;
}

interface AssessmentProgressTimelineProps {
  assessments: AssessmentData[];
}

export function AssessmentProgressTimeline({ assessments }: AssessmentProgressTimelineProps) {
  const chartData = useMemo(() => {
    // Group assessments by date and type
    const dataMap = new Map<string, any>();

    assessments.forEach((assessment) => {
      const date = format(assessment.completedAt, "MMM dd, yyyy");
      
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          timestamp: assessment.completedAt.getTime(),
          lis: null,
          hormoneCompass: null,
        });
      }

      const entry = dataMap.get(date);
      
      if (assessment.type === "lis" && assessment.score !== null) {
        entry.lis = Math.round(assessment.score);
      } else if (assessment.type === "hormone_compass" && assessment.score !== null) {
        entry.hormoneCompass = Math.round(assessment.score);
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(dataMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ timestamp, ...rest }) => rest);
  }, [assessments]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Assessment Progress Timeline</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis 
            domain={[0, 100]}
            className="text-xs"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Line
            type="monotone"
            dataKey="lis"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="LIS Score"
            dot={{ fill: "hsl(var(--primary))", r: 4 }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="hormoneCompass"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            name="Hormone Compass Score"
            dot={{ fill: "hsl(var(--secondary))", r: 4 }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
