import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { UnifiedDailyChecklist } from "@/components/today/UnifiedDailyChecklist";
import { FirstTimeUserTourModal } from "@/components/onboarding/FirstTimeUserTourModal";

export default function MyDailyPlan() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const isFirstTime = localStorage.getItem('first_time_user') === 'true';
    if (isFirstTime) {
      setShowTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.removeItem('first_time_user');
    setShowTour(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8 max-w-5xl">
        <UnifiedDailyChecklist />
      </main>
      <MobileBottomNav />
      <FirstTimeUserTourModal isOpen={showTour} onComplete={handleTourComplete} />
    </div>
  );
}
