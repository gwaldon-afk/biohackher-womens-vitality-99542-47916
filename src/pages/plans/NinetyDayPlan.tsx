import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NinetyDayPlanOverview } from "@/components/NinetyDayPlanOverview";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import AssessmentGatewayScreen from "@/components/AssessmentGatewayScreen";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft } from "lucide-react";

export default function NinetyDayPlan() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const breadcrumbs = [
    { label: t('common.home'), href: "/" },
    { label: t('weeklyPlan.myPlans'), href: "/today" },
    { label: "90-Day Plan", href: "/plans/90-day" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {user && <Breadcrumbs items={breadcrumbs} />}
        
        {!user ? (
          <AssessmentGatewayScreen pageName="90-day" />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold gradient-text mb-2">Your 90-Day Longevity Roadmap</h1>
                <p className="text-muted-foreground">
                  A comprehensive plan designed to optimize your health over the next 90 days
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/today')}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('weeklyPlan.viewToday')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/plans/weekly')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('weeklyPlan.viewWeek')}
                </Button>
              </div>
            </div>
            <NinetyDayPlanOverview />
          </>
        )}
      </main>
    </div>
  );
}
