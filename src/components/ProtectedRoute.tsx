import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { SoftGate } from '@/components/auth/SoftGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isPlanHome = location.pathname === "/plan-home";
  useEffect(() => {
    if (!loading && !user && !isPlanHome) {
      // Save current path to return after authentication
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?returnTo=${returnTo}`);
    }
  }, [user, loading, navigate, location, isPlanHome]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('common.verifyingAuth', 'Verifying authentication...')}</p>
        </div>
      </div>
    );
  }

  if (!user && isPlanHome) {
    return (
      <SoftGate
        title="Let’s build this around you 💛"
        body="You can explore BiohackHer freely, but to create a personalised plan we need to know a little about you."
        bullets={[
          "You’ll create a free account",
          "Then we’ll ask a few questions to understand your starting point",
          "This helps us tailor your plan properly",
        ]}
        primaryHref="/auth?returnTo=/plan-home"
        primaryLabel="Create free account"
        secondaryHref="/"
        secondaryLabel="Keep exploring"
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-2 w-32 bg-muted rounded-full overflow-hidden mx-auto">
            <div className="h-full w-1/2 bg-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground">
            {t('common.redirectingToAuth', 'Redirecting to sign in...')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
