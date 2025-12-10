import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HormoneAgeDisplayProps {
  hormoneAge: number;
  chronologicalAge: number;
  ageOffset: number;
  className?: string;
}

export function HormoneAgeDisplay({
  hormoneAge,
  chronologicalAge,
  ageOffset,
  className
}: HormoneAgeDisplayProps) {
  const getAgeComparison = () => {
    if (ageOffset > 0) {
      return {
        icon: TrendingUp,
        text: `${Math.abs(ageOffset)} years older`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-900/50',
        description: 'Your hormones are showing signs of accelerated aging. The good news? This is modifiable with targeted support.'
      };
    } else if (ageOffset < 0) {
      return {
        icon: TrendingDown,
        text: `${Math.abs(ageOffset)} years younger`,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
        borderColor: 'border-green-200 dark:border-green-900/50',
        description: 'Your hormones are functioning like someone younger. Keep up the great work maintaining your hormone health!'
      };
    } else {
      return {
        icon: Minus,
        text: 'Right on track',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-900/50',
        description: 'Your hormone health aligns with what\'s expected for your age. Focus on maintaining this balance.'
      };
    }
  };

  const comparison = getAgeComparison();
  const ComparisonIcon = comparison.icon;

  return (
    <Card className={cn(
      "bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-2 border-primary/30 shadow-lg overflow-hidden",
      className
    )}>
      <CardContent className="p-6 sm:p-8">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-semibold">Your Hormone Age</h2>
          </div>

          {/* Main Age Display */}
          <div className="space-y-2">
            <div className="relative inline-block">
              <span className="text-7xl sm:text-8xl font-bold text-primary">
                {hormoneAge}
              </span>
              <span className="absolute -bottom-2 right-0 text-lg text-muted-foreground">
                years
              </span>
            </div>
          </div>

          {/* Age Comparison */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full",
            comparison.bgColor,
            comparison.borderColor,
            "border"
          )}>
            <ComparisonIcon className={cn("w-5 h-5", comparison.color)} />
            <span className={cn("font-semibold", comparison.color)}>
              {comparison.text}
            </span>
          </div>

          {/* Chronological Age Reference */}
          <p className="text-muted-foreground">
            Your chronological age is <span className="font-semibold text-foreground">{chronologicalAge}</span> — 
            your hormones are functioning like someone{' '}
            <span className={cn("font-semibold", comparison.color)}>
              {ageOffset === 0 ? 'your age' : `${Math.abs(ageOffset)} years ${ageOffset > 0 ? 'older' : 'younger'}`}
            </span>.
          </p>

          {/* Explanation */}
          <div className="bg-muted/30 rounded-lg p-4 max-w-lg mx-auto">
            <p className="text-sm text-muted-foreground">
              {comparison.description}
            </p>
          </div>

          {/* Methodology Note */}
          <p className="text-xs text-muted-foreground">
            Based on symptom patterns compared to MRS population norms for your age group
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
