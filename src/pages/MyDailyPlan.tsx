import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { UnifiedDailyChecklist } from "@/components/today/UnifiedDailyChecklist";

export default function MyDailyPlan() {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        <UnifiedDailyChecklist />
      </main>
      <MobileBottomNav />
    </div>
  );
}
