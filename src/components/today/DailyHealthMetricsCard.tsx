import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Moon, Heart, TrendingUp, Users, Brain, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LISInputForm from "@/components/LISInputForm";
import { format } from "date-fns";

export const DailyHealthMetricsCard = () => {
  const { user } = useAuth();
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayScore, setTodayScore] = useState<number | null>(null);

  const checkTodayLog = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('daily_scores')
        .select('longevity_impact_score')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking today log:', error);
      }

      setHasLoggedToday(!!data);
      setTodayScore(data?.longevity_impact_score || null);
    } catch (error) {
      console.error('Error checking today log:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkTodayLog();
  }, [user]);

  const metrics = [
    { icon: Moon, label: "Sleep", color: "text-blue-500" },
    { icon: Heart, label: "Stress", color: "text-red-500" },
    { icon: Activity, label: "Activity", color: "text-orange-500" },
    { icon: TrendingUp, label: "Nutrition", color: "text-green-500" },
    { icon: Users, label: "Social", color: "text-pink-500" },
    { icon: Brain, label: "Cognitive", color: "text-purple-500" },
  ];

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <LISInputForm onScoreCalculated={checkTodayLog}>
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Daily Health Check-In
                {hasLoggedToday ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                    <Circle className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {hasLoggedToday 
                  ? `Today's LIS Score: ${todayScore}/100 • Track your progress over time`
                  : "Log your daily metrics to calculate your Longevity Impact Score"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                  {hasLoggedToday && (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button
              className="w-full"
              variant={hasLoggedToday ? "outline" : "default"}
              size="lg"
            >
              {hasLoggedToday ? "Update Today's Metrics" : "Log Today's Health Data"}
            </Button>
          </div>

          {!hasLoggedToday && (
            <p className="text-xs text-center text-muted-foreground">
              Takes 2-3 minutes • Connects your daily actions to your LIS score
            </p>
          )}
        </CardContent>
      </Card>
    </LISInputForm>
  );
};
