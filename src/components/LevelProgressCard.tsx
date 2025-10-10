import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star } from "lucide-react";

interface LevelProgressCardProps {
  level: number;
  totalPoints: number;
  pointsToNextLevel: number;
  progressPercentage: number;
  unlockedCount: number;
  totalAchievements: number;
}

export const LevelProgressCard = ({
  level,
  totalPoints,
  pointsToNextLevel,
  progressPercentage,
  unlockedCount,
  totalAchievements
}: LevelProgressCardProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Progress
          </div>
          <Badge variant="default" className="text-lg px-3 py-1">
            Level {level}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Points Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Experience Points</span>
            <span className="font-semibold">{totalPoints} total</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">
            {pointsToNextLevel} points to Level {level + 1}
          </p>
        </div>

        {/* Achievements Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Achievements</span>
            </div>
            <p className="text-2xl font-bold">
              {unlockedCount}/{totalAchievements}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Completion</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.round((unlockedCount / totalAchievements) * 100)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
