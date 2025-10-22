import { motion } from "framer-motion";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

interface PillarScore {
  sleep: number | null;
  stress: number | null;
  activity: number | null;
  nutrition: number | null;
  social: number | null;
  cognitive: number | null;
}

interface LISRadarChartProps {
  pillarScores: PillarScore;
  compositeScore: number;
  size?: number;
}

export const LISRadarChart = ({ pillarScores, compositeScore, size = 350 }: LISRadarChartProps) => {
  // Transform pillar scores for Recharts
  const chartData = [
    {
      dimension: "🌙 Sleep",
      score: pillarScores.sleep ?? 0,
      fullMark: 100,
    },
    {
      dimension: "💪 Activity",
      score: pillarScores.activity ?? 0,
      fullMark: 100,
    },
    {
      dimension: "🥗 Nutrition",
      score: pillarScores.nutrition ?? 0,
      fullMark: 100,
    },
    {
      dimension: "❤️ Stress",
      score: pillarScores.stress ?? 0,
      fullMark: 100,
    },
    {
      dimension: "👥 Social",
      score: pillarScores.social ?? 0,
      fullMark: 100,
    },
    {
      dimension: "🧠 Cognitive",
      score: pillarScores.cognitive ?? 0,
      fullMark: 100,
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--primary))";
    if (score >= 40) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Attention";
  };

  const chartConfig = {
    score: {
      label: "LIS Score",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <defs>
                <linearGradient id="lisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
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
                name="LIS Score"
                dataKey="score"
                stroke="hsl(var(--primary))"
                fill="url(#lisGradient)"
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </motion.div>

      {/* Center score overlay - positioned much lower to avoid graph overlap */}
      <motion.div
        className="absolute left-1/2 top-[65%] -translate-x-1/2 pointer-events-none"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="bg-background/95 backdrop-blur-sm rounded-full px-6 py-4 border-2 shadow-lg" style={{ borderColor: getScoreColor(compositeScore) }}>
          <div className="text-xs text-muted-foreground mb-1 text-center font-medium">Longevity Score</div>
          <div
            className="text-4xl font-bold text-center"
            style={{ color: getScoreColor(compositeScore) }}
          >
            {Math.round(compositeScore)}
          </div>
          <div className="text-sm font-medium text-center mt-1" style={{ color: getScoreColor(compositeScore) }}>
            {getScoreCategory(compositeScore)}
          </div>
        </div>
      </motion.div>

      {/* Pulsing glow effect when score is excellent */}
      {compositeScore >= 80 && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, hsl(var(--success) / 0.2) 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};
