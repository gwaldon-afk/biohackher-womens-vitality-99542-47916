import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children?: React.ReactNode;
}

const sizeVariants = {
  sm: "w-12 h-12",
  md: "w-16 h-16", 
  lg: "w-24 h-24",
  xl: "w-32 h-32"
};

const strokeVariants = {
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5
};

export function ProgressCircle({ 
  value, 
  size = "md", 
  className,
  children 
}: ProgressCircleProps) {
  const radius = size === "sm" ? 20 : size === "md" ? 28 : size === "lg" ? 44 : 60;
  const strokeWidth = strokeVariants[size];
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative", sizeVariants[size], className)}>
      <svg
        className="w-full h-full transform -rotate-90"
        width={radius * 2}
        height={radius * 2}
      >
        {/* Background circle */}
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke="hsl(var(--primary))"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}