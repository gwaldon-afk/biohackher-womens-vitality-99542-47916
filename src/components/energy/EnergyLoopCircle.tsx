import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface SegmentData {
  name: string;
  score: number;
  color: string;
  icon: string;
}

interface EnergyLoopCircleProps {
  segments: SegmentData[];
  compositeScore: number;
  size?: number;
}

export const EnergyLoopCircle = ({ segments, compositeScore, size = 280 }: EnergyLoopCircleProps) => {
  // Transform segments data for Recharts
  const chartData = segments.map(segment => ({
    dimension: `${segment.icon} ${segment.name}`,
    score: Math.round(segment.score),
    fullMark: 100,
  }));

  // Brand color mapping for segments
  const brandColors = [
    "hsl(var(--primary))",      // Rest - brand peach
    "hsl(var(--secondary))",     // Calm - brand stone
    "hsl(var(--success))",       // Fuel - green
    "hsl(var(--warning))",       // Move - warning/amber
    "hsl(var(--primary-dark))",  // Flow - darker peach
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--primary))";
    return "hsl(var(--warning))";
  };

  const chartConfig = {
    score: {
      label: "Energy Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid 
                stroke="hsl(var(--border))" 
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ 
                  fill: "hsl(var(--foreground))", 
                  fontSize: 12,
                  fontWeight: 500,
                }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Energy Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Center score overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="bg-background/90 backdrop-blur-sm rounded-full px-6 py-4 border-2 border-border shadow-lg">
          <div className="text-xs text-muted-foreground mb-1 text-center font-medium">Today's Energy</div>
          <div
            className="text-4xl font-bold text-center"
            style={{ color: getScoreColor(compositeScore) }}
          >
            {Math.round(compositeScore)}
          </div>
          <div className="text-sm text-muted-foreground text-center">/100</div>
        </div>
      </motion.div>

      {/* Pulsing glow effect when score is high */}
      {compositeScore >= 80 && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(--success) / 0.15) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};
