import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface GlowMeterRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
}

const GlowMeter_Ring = ({ value, size = 200, strokeWidth = 16 }: GlowMeterRingProps) => {
  const { profile } = useAuth();
  const [previousValue, setPreviousValue] = useState(value);
  const [shouldPulse, setShouldPulse] = useState(false);

  useEffect(() => {
    if (value > previousValue) {
      setShouldPulse(true);
      const timeout = setTimeout(() => setShouldPulse(false), 1000);
      return () => clearTimeout(timeout);
    }
    setPreviousValue(value);
  }, [value, previousValue]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  // Brand color for all streams
  const color = 'hsl(20, 86%, 82%)';
  const glowColor = 'rgba(251, 207, 193, 0.5)';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className={`transform -rotate-90 ${shouldPulse ? 'animate-pulse' : ''}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-20"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-in-out"
          style={{
            filter: shouldPulse ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
          }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {Math.round(value)}
        </span>
        <span className="text-sm text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Glow Score
        </span>
      </div>
    </div>
  );
};

export default GlowMeter_Ring;
