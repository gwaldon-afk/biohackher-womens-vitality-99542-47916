import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DailyProgressRingProps {
  completed: number;
  total: number;
  streak?: number;
}

export const DailyProgressRing = ({ completed, total, streak }: DailyProgressRingProps) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="text-center">Today's Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative w-40 h-40">
          <svg className="transform -rotate-90 w-full h-full">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold">{Math.round(percentage)}%</span>
            <span className="text-sm text-muted-foreground">
              {completed}/{total}
            </span>
          </div>
        </div>

        {streak !== undefined && streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 px-4 py-2 rounded-full">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-lg">{streak} Day Streak</p>
              <p className="text-xs text-muted-foreground">Keep it going!</p>
            </div>
          </div>
        )}

        <div className="w-full space-y-2">
          <Progress value={percentage} className="h-2" />
          <p className="text-center text-sm text-muted-foreground">
            {percentage === 100 ? "Perfect day! 🎉" : 
             percentage >= 75 ? "Almost there!" : 
             percentage >= 50 ? "Halfway done!" : 
             percentage > 0 ? "Making progress!" : 
             "Let's get started!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
