import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTodayPreview = location.pathname === "/today-preview";
  useEffect(() => {
    if (!loading && !user && !isTodayPreview) {
      // Save current path to return after authentication
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?returnTo=${returnTo}`);
    }
  }, [user, loading, navigate, location, isTodayPreview]);

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

  if (!user && !isTodayPreview) {
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
