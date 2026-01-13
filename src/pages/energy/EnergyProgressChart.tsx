import { Card } from "@/components/ui/card";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type EnergyProgressPoint = {
  date: string;
  energy: number;
  sleep: number;
  stress: number;
  nutrition: number;
  movement: number;
};

type EnergyProgressChartProps = {
  chartData: EnergyProgressPoint[];
};

export default function EnergyProgressChart({ chartData }: EnergyProgressChartProps) {
  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Energy Trends (Last 30 Days)</h2>
        <div className="text-center text-muted-foreground py-20">
          No data yet. Complete your daily check-ins to see trends!
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Energy Trends (Last 30 Days)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis domain={[0, 100]} className="text-xs" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="energy"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            name="Composite Energy"
          />
          <Line type="monotone" dataKey="sleep" stroke="#4A90E2" strokeWidth={2} name="Sleep" />
          <Line type="monotone" dataKey="stress" stroke="#F5A623" strokeWidth={2} name="Stress" />
          <Line type="monotone" dataKey="nutrition" stroke="#7ED321" strokeWidth={2} name="Nutrition" />
          <Line type="monotone" dataKey="movement" stroke="#E94B8E" strokeWidth={2} name="Movement" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

