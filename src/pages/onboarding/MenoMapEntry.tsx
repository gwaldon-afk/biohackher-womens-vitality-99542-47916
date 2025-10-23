import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MenoMapEntry = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    if (!profile) return;

    const timer = setTimeout(() => {
      if (profile.user_stream === 'performance') {
        navigate('/onboarding/menomap-performance', { replace: true });
      } else {
        navigate('/onboarding/menomap-menopause', { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [profile, navigate]);

  const handleManualContinue = () => {
    if (profile?.user_stream === 'performance') {
      navigate('/onboarding/menomap-performance', { replace: true });
    } else {
      navigate('/onboarding/menomap-menopause', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center space-y-4">
        <div className="animate-pulse text-muted-foreground">Routing to assessment...</div>
        <Button onClick={handleManualContinue} variant="outline">
          Continue to Assessment
        </Button>
      </Card>
    </div>
  );
};

export default MenoMapEntry;
