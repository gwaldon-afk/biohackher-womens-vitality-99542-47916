import { Moon, Activity, TrendingUp, Heart, Users, Brain } from "lucide-react";

interface PillarScore {
  sleep: number | null;
  stress: number | null;
  activity: number | null;
  nutrition: number | null;
  social: number | null;
  cognitive: number | null;
}

interface LISRadarLegendProps {
  pillarScores: PillarScore;
}

export const LISRadarLegend = ({ pillarScores }: LISRadarLegendProps) => {
  const pillars = [
    {
      name: "Sleep Quality",
      icon: Moon,
      color: "text-indigo-600",
      bgColor: "bg-indigo-600/10",
      score: pillarScores.sleep,
      description: "Rest and recovery patterns",
    },
    {
      name: "Physical Activity",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
      score: pillarScores.activity,
      description: "Movement and exercise habits",
    },
    {
      name: "Nutrition",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      score: pillarScores.nutrition,
      description: "Diet quality and metabolic health",
    },
    {
      name: "Stress Management",
      icon: Heart,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      score: pillarScores.stress,
      description: "Stress levels and resilience",
    },
    {
      name: "Social Connection",
      icon: Users,
      color: "text-pink-600",
      bgColor: "bg-pink-600/10",
      score: pillarScores.social,
      description: "Relationship quality and support",
    },
    {
      name: "Cognitive Engagement",
      icon: Brain,
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
      score: pillarScores.cognitive,
      description: "Mental stimulation and mindfulness",
    },
  ];

  const getScoreLabel = (score: number | null) => {
    if (score === null) return "No data";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
      {pillars.map((pillar) => (
        <div
          key={pillar.name}
          className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${pillar.bgColor} border-current/20`}
        >
          <div className={`p-2 rounded-md ${pillar.bgColor} ${pillar.color}`}>
            <pillar.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className={`font-semibold text-sm ${pillar.color}`}>{pillar.name}</h4>
              <span className="text-xs font-medium text-muted-foreground">
                {pillar.score !== null ? Math.round(pillar.score) : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{pillar.description}</p>
            <div className="text-xs font-medium mt-1" style={{ color: pillar.score !== null && pillar.score >= 60 ? "hsl(var(--success))" : "hsl(var(--warning))" }}>
              {getScoreLabel(pillar.score)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
