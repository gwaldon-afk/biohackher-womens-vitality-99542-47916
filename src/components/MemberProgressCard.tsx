import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Award, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MemberProgressCardProps {
  daysActive?: number;
  currentStreak?: number;
  lisImprovement?: number;
  achievementsUnlocked?: number;
}

export const MemberProgressCard = ({
  daysActive = 23,
  currentStreak = 5,
  lisImprovement = 12,
  achievementsUnlocked = 3,
}: MemberProgressCardProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/5">
            <Calendar className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{daysActive}</div>
            <p className="text-xs text-muted-foreground">Days Active</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-orange-500/10">
            <div className="text-2xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">+{lisImprovement}</div>
            <p className="text-xs text-muted-foreground">LIS Points</p>
          </div>
          
          <div className="text-center p-4 rounded-lg bg-purple-500/10">
            <Award className="h-5 w-5 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{achievementsUnlocked}</div>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Next Milestone</p>
          <p>Complete 3 more days to unlock the "Consistent Week" badge 🏆</p>
        </div>

        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate("/progress")}
        >
          View Detailed Progress
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
