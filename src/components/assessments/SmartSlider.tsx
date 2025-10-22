import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderLabel {
  value: number;
  text: string;
  emoji?: string;
  score: number;
}

interface SmartSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  labels: SliderLabel[];
  showCurrentValue?: boolean;
  className?: string;
}

export function SmartSlider({
  value,
  onChange,
  min,
  max,
  labels,
  showCurrentValue = true,
  className
}: SmartSliderProps) {
  const currentLabel = labels.find(l => l.value === value);
  
  // Helper to strip letter prefixes (A., B., C., D., etc.)
  const stripLetterPrefix = (text: string): string => {
    return text.replace(/^[A-D]\.\s*/, '');
  };
  
  // Calculate color based on score
  const getTrackColor = () => {
    if (!currentLabel) return "bg-muted";
    const score = currentLabel.score;
    if (score >= 90) return "bg-success";
    if (score >= 75) return "bg-primary";
    if (score >= 60) return "bg-warning";
    return "bg-destructive/70";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Current Value Display */}
      {showCurrentValue && currentLabel && (
        <div className="text-center space-y-2 animate-fade-in">
          {currentLabel.emoji && (
            <div className="text-4xl animate-scale-in">
              {currentLabel.emoji}
            </div>
          )}
          <div className="space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {stripLetterPrefix(currentLabel.text)}
            </p>
            <p className="text-sm text-muted-foreground">
              Score: {currentLabel.score}/100
            </p>
          </div>
        </div>
      )}

      {/* Slider */}
      <div className="relative px-2">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={min}
          max={max}
          step={1}
          className="relative"
        />
        
        {/* Track gradient overlay */}
        <div 
          className={cn(
            "absolute top-0 left-2 right-2 h-2 rounded-full pointer-events-none transition-all duration-300 opacity-20",
            getTrackColor()
          )}
          style={{
            width: `${((value - min) / (max - min)) * 100}%`
          }}
        />
      </div>

      {/* Labels at extremes */}
      <div className="flex justify-between items-start gap-4 text-sm text-muted-foreground px-1">
        <div className="flex-1 text-left space-y-1">
          {labels[0].emoji && <span className="text-lg">{labels[0].emoji}</span>}
          <p>{stripLetterPrefix(labels[0].text)}</p>
        </div>
        <div className="flex-1 text-right space-y-1">
          {labels[labels.length - 1].emoji && (
            <span className="text-lg">{labels[labels.length - 1].emoji}</span>
          )}
          <p>{stripLetterPrefix(labels[labels.length - 1].text)}</p>
        </div>
      </div>
    </div>
  );
}
