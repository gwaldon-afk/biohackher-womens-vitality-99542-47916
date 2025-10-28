import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HormoneCompassEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';

  useEffect(() => {
    const timer = setTimeout(() => {
      // Route all users to unified assessment
      const assessmentPath = returnTo
        ? `/onboarding/hormone-compass-performance?returnTo=${encodeURIComponent(returnTo)}`
        : '/onboarding/hormone-compass-performance';
      navigate(assessmentPath, { replace: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [navigate, returnTo]);

  const handleManualContinue = () => {
    const assessmentPath = returnTo
      ? `/onboarding/hormone-compass-performance?returnTo=${encodeURIComponent(returnTo)}`
      : '/onboarding/hormone-compass-performance';
    navigate(assessmentPath, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Let's personalize your experience</h2>
          <p className="text-muted-foreground">
            Complete a quick assessment to create your customized health protocol
          </p>
        </div>
        <div className="animate-pulse text-muted-foreground text-sm">
          Starting assessment...
        </div>
        <Button onClick={handleManualContinue} variant="outline">
          Continue to Assessment
        </Button>
      </Card>
    </div>
  );
};

export default HormoneCompassEntry;
