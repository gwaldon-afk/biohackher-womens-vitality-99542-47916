import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Play, ChevronRight, Pill, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface TodayActivity {
  id: string;
  name: string;
  duration: string;
  type: "morning" | "afternoon" | "evening";
  completed: boolean;
}

interface TodaySupplement {
  name: string;
  dosage: string;
  taken: boolean;
}

export const TodayProtocolWidget = () => {
  const navigate = useNavigate();
  const [activities] = useState<TodayActivity[]>([
    { id: "1", name: "Sunlight Exposure", duration: "15 mins", type: "morning", completed: false },
    { id: "2", name: "Meditation", duration: "12 mins", type: "morning", completed: false },
    { id: "3", name: "Zone 2 Cardio", duration: "30 mins", type: "afternoon", completed: false },
  ]);

  const [supplements] = useState<TodaySupplement[]>([
    { name: "Lion's Mane", dosage: "1000mg", taken: false },
    { name: "Omega-3 Fish Oil", dosage: "1-3g", taken: false },
  ]);

  const morningActivities = activities.filter((a) => a.type === "morning");
  const otherActivities = activities.filter((a) => a.type !== "morning");

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Today's Protocol</CardTitle>
          <Badge variant="outline" className="text-primary border-primary/30">
            Day 3 of Brain Optimization
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">You're on a 5-day streak 🔥</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Morning Activities */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Morning</h4>
          <div className="space-y-2">
            {morningActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  {activity.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className={cn(
                      "font-medium text-sm",
                      activity.completed && "line-through text-muted-foreground"
                    )}>
                      {activity.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.duration}</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="gap-1">
                  <Play className="h-3 w-3" />
                  Start
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Supplements */}
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Today's Supplements
          </h4>
          <div className="space-y-2">
            {supplements.map((supplement, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
              >
                <div className="flex items-center gap-3 flex-1">
                  {supplement.taken ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{supplement.name}</p>
                    <p className="text-xs text-muted-foreground">{supplement.dosage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Buy
                  </Button>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Mark Taken
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Afternoon & Evening */}
        {otherActivities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Afternoon & Evening</h4>
            <div className="space-y-2">
              {otherActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Circle className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.duration}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Start Later
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/my-protocol")}
          >
            View Full Protocol
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => navigate("/my-protocol?tab=recommendations")}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Buy Your 30-Day Stack
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
