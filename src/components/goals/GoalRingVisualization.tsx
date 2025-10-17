import { motion } from "framer-motion";
import { HealthGoal } from "@/hooks/useGoals";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Scale, Sparkles } from "lucide-react";

interface GoalRingVisualizationProps {
  goal: HealthGoal;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

export const GoalRingVisualization = ({ goal, size = "md", onClick }: GoalRingVisualizationProps) => {
  const sizeConfig = {
    sm: { outer: 120, inner: 96, stroke: 8, text: "text-2xl" },
    md: { outer: 160, inner: 128, stroke: 10, text: "text-3xl" },
    lg: { outer: 200, inner: 160, stroke: 12, text: "text-4xl" },
  };

  const config = sizeConfig[size];
  const radius = (config.outer - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal.current_progress || 0;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getPillarConfig = (pillar: string) => {
    const configs = {
      brain: { 
        color: "hsl(var(--primary))", 
        icon: Brain,
        gradient: "from-purple-500 to-purple-600"
      },
      body: { 
        color: "hsl(120, 45%, 55%)", 
        icon: Heart,
        gradient: "from-green-500 to-emerald-600"
      },
      balance: { 
        color: "hsl(210, 100%, 60%)", 
        icon: Scale,
        gradient: "from-blue-500 to-cyan-600"
      },
      beauty: { 
        color: "hsl(330, 75%, 60%)", 
        icon: Sparkles,
        gradient: "from-pink-500 to-rose-600"
      },
    };
    return configs[pillar as keyof typeof configs] || configs.brain;
  };

  const pillarConfig = getPillarConfig(goal.pillar_category);
  const Icon = pillarConfig.icon;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className={`relative cursor-pointer group ${onClick ? 'hover:shadow-glow' : ''}`}
      style={{ width: config.outer, height: config.outer }}
    >
      {/* Background circle */}
      <svg
        width={config.outer}
        height={config.outer}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.stroke}
        />

        {/* Progress ring with animation */}
        <motion.circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={radius}
          fill="none"
          stroke={pillarConfig.color}
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="drop-shadow-lg"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Icon className="w-8 h-8 mb-2 text-muted-foreground" />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className={`font-bold ${config.text} bg-gradient-to-br ${pillarConfig.gradient} bg-clip-text text-transparent`}
        >
          {Math.round(progress)}%
        </motion.div>
        <div className="text-xs text-muted-foreground text-center px-2 mt-1">
          <p className="line-clamp-2 font-medium">{goal.title}</p>
        </div>
      </div>

      {/* Pillar badge */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
        <Badge className={`text-xs bg-gradient-to-r ${pillarConfig.gradient} text-white`}>
          {goal.pillar_category}
        </Badge>
      </div>

      {/* Hover effect overlay */}
      {onClick && (
        <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </motion.div>
  );
};
