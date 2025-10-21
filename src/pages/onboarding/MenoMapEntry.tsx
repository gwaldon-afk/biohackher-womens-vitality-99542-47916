import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/stores/userStore";

const MenoMapEntry = () => {
  const navigate = useNavigate();
  const profile = useUserStore((state) => state.profile);

  useEffect(() => {
    if (!profile) return;

    if (profile.user_stream === 'performance') {
      navigate('/onboarding/menomap-performance');
    } else {
      navigate('/onboarding/menomap-menopause');
    }
  }, [profile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Routing to assessment...</div>
    </div>
  );
};

export default MenoMapEntry;
