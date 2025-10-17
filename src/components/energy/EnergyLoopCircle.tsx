import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.12;

  // Calculate circle circumference
  const circumference = 2 * Math.PI * radius;
  
  // Each segment is 72 degrees (360 / 5)
  const segmentAngle = 72;
  const gapAngle = 2; // Small gap between segments

  const createArc = (startAngle: number, endAngle: number, score: number) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "hsl(var(--success))";
    if (score >= 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <TooltipProvider>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circles */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            opacity={0.2}
          />
          
          {/* Segment arcs */}
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle + (index * gapAngle);
            const endAngle = startAngle + segmentAngle - gapAngle;
            const arcPath = createArc(startAngle, endAngle, segment.score);
            
            // Calculate dash array for progress
            const segmentCircumference = (segmentAngle / 360) * circumference;
            const progress = (segment.score / 100) * segmentCircumference;
            
            return (
              <Tooltip key={segment.name}>
                <TooltipTrigger asChild>
                  <motion.path
                    d={arcPath}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${progress} ${segmentCircumference}`}
                    initial={{ strokeDasharray: `0 ${segmentCircumference}` }}
                    animate={{ strokeDasharray: `${progress} ${segmentCircumference}` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      filter: segment.score > 60 ? "drop-shadow(0 0 8px currentColor)" : "none"
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <div className="text-sm font-medium">{segment.icon} {segment.name}</div>
                    <div className="text-lg font-bold">{Math.round(segment.score)}/100</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </svg>
        
        {/* Center score */}
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-sm text-muted-foreground mb-1">Today's Energy</div>
          <div 
            className="text-5xl font-bold"
            style={{ color: getScoreColor(compositeScore) }}
          >
            {Math.round(compositeScore)}
          </div>
          <div className="text-xl text-muted-foreground">/100</div>
        </motion.div>
        
        {/* Pulsing glow effect when score is high */}
        {compositeScore >= 80 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${getScoreColor(compositeScore)}33 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </TooltipProvider>
  );
};
