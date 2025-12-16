import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Moon, Heart, TrendingUp, Users, Brain, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import LISInputForm from "@/components/LISInputForm";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';

export const DailyHealthMetricsCard = () => {
  const { t } = useTranslation();
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
    { icon: Moon, labelKey: "today.metrics.sleep", color: "text-blue-500" },
    { icon: Heart, labelKey: "today.metrics.stress", color: "text-red-500" },
    { icon: Activity, labelKey: "today.metrics.activity", color: "text-orange-500" },
    { icon: TrendingUp, labelKey: "today.metrics.nutritionMetric", color: "text-green-500" },
    { icon: Users, labelKey: "today.metrics.social", color: "text-pink-500" },
    { icon: Brain, labelKey: "today.metrics.cognitive", color: "text-purple-500" },
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
                {t('today.metrics.title')}
                {hasLoggedToday ? (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {t('today.metrics.completed')}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 border-orange-500/20">
                    <Circle className="h-3 w-3 mr-1" />
                    {t('today.metrics.pending')}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {hasLoggedToday 
                  ? t('today.metrics.todayScore', { score: todayScore })
                  : t('today.metrics.logMetrics')}
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
                  key={metric.labelKey}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg bg-background/50 border border-border/50"
                >
                  <Icon className={`h-4 w-4 ${metric.color}`} />
                  <span className="text-xs text-muted-foreground">{t(metric.labelKey)}</span>
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
              {hasLoggedToday ? t('today.metrics.updateMetrics') : t('today.metrics.logHealthData')}
            </Button>
          </div>

          {!hasLoggedToday && (
            <p className="text-xs text-center text-muted-foreground">
              {t('today.metrics.timeEstimate')}
            </p>
          )}
        </CardContent>
      </Card>
    </LISInputForm>
  );
};
