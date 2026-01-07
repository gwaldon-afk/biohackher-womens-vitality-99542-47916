import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Apple, Heart, ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, addMonths, isAfter, isBefore, addDays } from "date-fns";
import { useTranslation } from "react-i18next";

interface AssessmentCardData {
  id: string;
  name: string;
  icon: any;
  benefits: string[];
  route: string;
  resultsRoute?: string;
  completed: boolean;
  completedAt: string | null;
  nextDue: Date | null;
  intervalMonths: number;
}

export const AssessmentOverviewCards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { progress, completedCount, allComplete } = useAssessmentProgress();
  const { t } = useTranslation();

  // Fetch latest LIS assessment
  const { data: latestLIS } = useQuery({
    queryKey: ["latest-lis", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("daily_scores")
        .select("date, longevity_impact_score")
        .eq("user_id", user.id)
        .eq("is_baseline", true)
        .order("date", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch latest Nutrition assessment
  const { data: latestNutrition } = useQuery({
    queryKey: ["latest-nutrition", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("longevity_nutrition_assessments")
        .select("created_at, longevity_nutrition_score")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch latest Hormone Compass assessment
  const { data: latestHormone } = useQuery({
    queryKey: ["latest-hormone", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("hormone_compass_stages")
        .select("created_at, stage")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const calculateNextDue = (completedAt: string | null, intervalMonths: number): Date | null => {
    if (!completedAt) return null;
    return addMonths(new Date(completedAt), intervalMonths);
  };

  const getStatusBadge = (completed: boolean, nextDue: Date | null) => {
    if (!completed) {
      return { label: "Not Started", variant: "outline" as const };
    }

    if (!nextDue) {
      return { label: "Completed ✓", variant: "default" as const };
    }

    const now = new Date();
    const twoWeeksFromNow = addDays(now, 14);

    if (isAfter(now, nextDue)) {
      return { label: "Update Required ⚠️", variant: "destructive" as const };
    } else if (isAfter(twoWeeksFromNow, nextDue)) {
      return { label: "Due Soon ⏰", variant: "secondary" as const };
    } else {
      return { label: "Completed ✓", variant: "default" as const };
    }
  };

  const getCTAButton = (completed: boolean, nextDue: Date | null, route: string, resultsRoute?: string) => {
    if (!completed) {
      return { text: "Start Assessment", action: () => navigate(route) };
    }

    const now = new Date();
    if (nextDue && isAfter(now, nextDue)) {
      return { text: "Retake Assessment", action: () => navigate(route) };
    } else if (nextDue && isAfter(addDays(now, 14), nextDue)) {
      return { text: "Retake Assessment", action: () => navigate(route) };
    } else {
      return { text: "View Results", action: () => navigate(resultsRoute || route) };
    }
  };

  const assessments: AssessmentCardData[] = [
    {
      id: "lis",
      name: t('assessments.lis.name'),
      icon: Activity,
      benefits: [
        t('assessments.lis.benefits.bioAge'),
        t('assessments.lis.benefits.pillars'),
        t('assessments.lis.benefits.protocol')
      ],
      route: "/guest-lis-assessment",
      resultsRoute: "/lis-results",
      completed: !!progress?.lis_completed,
      completedAt: latestLIS?.date || progress?.lis_completed_at || null,
      nextDue: calculateNextDue(latestLIS?.date || progress?.lis_completed_at || null, 3),
      intervalMonths: 3,
    },
    {
      id: "nutrition",
      name: t('assessments.nutrition.name'),
      icon: Apple,
      benefits: [
        t('assessments.nutrition.benefits.habits'),
        t('assessments.nutrition.benefits.score'),
        t('assessments.nutrition.benefits.mealPlans')
      ],
      route: "/longevity-nutrition",
      resultsRoute: "/longevity-nutrition/results",
      completed: !!progress?.nutrition_completed,
      completedAt: latestNutrition?.created_at || progress?.nutrition_completed_at || null,
      nextDue: calculateNextDue(latestNutrition?.created_at || progress?.nutrition_completed_at || null, 3),
      intervalMonths: 3,
    },
    {
      id: "hormone",
      name: t('assessments.hormone.name'),
      icon: Heart,
      benefits: [
        t('assessments.hormone.benefits.domains'),
        t('assessments.hormone.benefits.lifeStage'),
        t('assessments.hormone.benefits.recommendations')
      ],
      route: "/menomap/assessment",
      resultsRoute: "/hormone-compass/results",
      completed: !!progress?.hormone_completed,
      completedAt: latestHormone?.created_at || progress?.hormone_completed_at || null,
      nextDue: calculateNextDue(latestHormone?.created_at || progress?.hormone_completed_at || null, 6),
      intervalMonths: 6,
    },
  ];

  return (
    <div className="mb-8">
      {/* Master Dashboard Unlock Progress */}
      {!allComplete && (
        <Card className="mb-6 bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 border-primary/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    🎯 Complete all 3 assessments to unlock Master Dashboard
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Progress: {completedCount}/3 Complete
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full ${
                      i < completedCount ? "bg-primary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {allComplete && (
        <Card className="mb-6 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 border-primary/40">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    🎉 Congratulations! Master Dashboard Unlocked
                  </p>
                  <p className="text-sm text-muted-foreground">
                    All 3 assessments complete. View your unified health overview.
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/master-dashboard")}>
                View Master Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {assessments.map((assessment) => {
          const Icon = assessment.icon;
          const status = getStatusBadge(assessment.completed, assessment.nextDue);
          const cta = getCTAButton(assessment.completed, assessment.nextDue, assessment.route, assessment.resultsRoute);

          return (
            <Card
              key={assessment.id}
              className="bg-gradient-to-br from-background via-background to-primary/5 border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <h3 className="text-xl font-semibold mb-3">{assessment.name}</h3>

                <div className="space-y-2 mb-4">
                  {assessment.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{benefit}</p>
                    </div>
                  ))}
                </div>

                {assessment.completedAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>Last completed: {format(new Date(assessment.completedAt), "MMM d, yyyy")}</span>
                  </div>
                )}

                {assessment.nextDue && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Calendar className="h-3 w-3" />
                    <span>Next due: {format(assessment.nextDue, "MMM d, yyyy")}</span>
                  </div>
                )}

                <Button
                  onClick={cta.action}
                  className="w-full"
                  variant={assessment.completed ? "outline" : "default"}
                >
                  {cta.text}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
