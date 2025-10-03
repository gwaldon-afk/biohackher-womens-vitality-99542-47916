import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, TrendingUp } from "lucide-react";
import { useStreaks } from "@/hooks/useStreaks";

interface StreakCardProps {
  activityType: string;
  title: string;
  description: string;
}

export const StreakCard = ({ activityType, title, description }: StreakCardProps) => {
  const { getStreak } = useStreaks();
  const streak = getStreak(activityType);

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`h-5 w-5 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {currentStreak >= 7 && (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3" />
              On Fire!
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-primary">{currentStreak}</div>
            <p className="text-sm text-muted-foreground">Days in a Row</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {longestStreak}
            </div>
            <p className="text-sm text-muted-foreground">Personal Record</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
