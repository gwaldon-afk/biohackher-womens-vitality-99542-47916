import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HormoneCompassStageCompassProps {
  currentStage: 'pre' | 'early-peri' | 'mid-peri' | 'late-peri' | 'post';
  confidenceScore?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onStageClick?: (stage: string) => void;
}

const STAGES = [
  { id: 'pre', label: 'Pre-Menopause', color: 'from-pink-400 to-rose-300', position: 0 },
  { id: 'early-peri', label: 'Early Peri', color: 'from-rose-400 to-pink-400', position: 1 },
  { id: 'mid-peri', label: 'Mid Peri', color: 'from-purple-400 to-rose-400', position: 2 },
  { id: 'late-peri', label: 'Late Peri', color: 'from-violet-400 to-purple-400', position: 3 },
  { id: 'post', label: 'Post-Menopause', color: 'from-indigo-400 to-violet-400', position: 4 },
];

export const HormoneCompassStageCompass = ({
  currentStage,
  confidenceScore,
  size = 'md',
  interactive = false,
  onStageClick
}: HormoneCompassStageCompassProps) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const getCurrentStageData = () => {
    return STAGES.find(s => s.id === currentStage);
  };

  const currentStageData = getCurrentStageData();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Circular Compass */}
      <div className={cn("relative", sizeClasses[size])}>
        {/* Background Circle */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-muted to-background border-2 border-border" />
        
        {/* Stage Segments */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {STAGES.map((stage, index) => {
            const startAngle = (index * 72) - 90;
            const endAngle = ((index + 1) * 72) - 90;
            const isActive = stage.id === currentStage;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 50 + 35 * Math.cos(startRad);
            const y1 = 50 + 35 * Math.sin(startRad);
            const x2 = 50 + 35 * Math.cos(endRad);
            const y2 = 50 + 35 * Math.sin(endRad);
            
            return (
              <g key={stage.id}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A 35 35 0 0 1 ${x2} ${y2} Z`}
                  className={cn(
                    "transition-all duration-300",
                    isActive ? "fill-primary opacity-80" : "fill-muted opacity-30",
                    interactive && "cursor-pointer hover:opacity-60"
                  )}
                  onClick={() => interactive && onStageClick?.(stage.id)}
                />
                {isActive && (
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="fill-none stroke-primary stroke-2 animate-pulse"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "rounded-full bg-primary/10 p-4 backdrop-blur-sm",
            currentStageData && "animate-pulse"
          )}>
            <Moon className="w-8 h-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Stage Info */}
      <div className="text-center space-y-2">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Current Stage</p>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {currentStageData?.label}
          </h3>
        </div>
        
        {confidenceScore && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <span>{confidenceScore}% confidence</span>
          </div>
        )}
      </div>

      {/* Stage Legend */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 w-full max-w-2xl">
        {STAGES.map((stage) => (
          <button
            key={stage.id}
            onClick={() => interactive && onStageClick?.(stage.id)}
            className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium transition-all",
              stage.id === currentStage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
              interactive && "cursor-pointer"
            )}
            disabled={!interactive}
          >
            {stage.label}
          </button>
        ))}
      </div>
    </div>
  );
};
