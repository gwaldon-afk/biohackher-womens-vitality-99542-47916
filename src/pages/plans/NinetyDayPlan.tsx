import Navigation from "@/components/Navigation";
import { NinetyDayPlanOverview } from "@/components/NinetyDayPlanOverview";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useAuth } from "@/hooks/useAuth";
import AssessmentGatewayScreen from "@/components/AssessmentGatewayScreen";

export default function NinetyDayPlan() {
  const { user } = useAuth();
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "My Plans", href: "/today" },
    { label: "90-Day Plan", href: "/plans/90-day" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {user && <Breadcrumbs items={breadcrumbs} />}
        
        {!user ? (
          <AssessmentGatewayScreen pageName="90-day" />
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold gradient-text mb-2">Your 90-Day Longevity Roadmap</h1>
              <p className="text-muted-foreground">
                A comprehensive plan designed to optimize your health over the next 90 days
              </p>
            </div>
            <NinetyDayPlanOverview />
          </>
        )}
      </main>
    </div>
  );
}
