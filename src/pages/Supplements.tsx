import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Legacy redirect page for Supplements
 * Redirects to the new dynamic toolkit category page
 */
const Supplements = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/supplements', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Redirecting to Supplements...</p>
      </div>
    </div>
  );
};

export default Supplements;
