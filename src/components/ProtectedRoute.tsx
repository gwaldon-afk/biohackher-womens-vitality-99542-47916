import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { SoftGate } from '@/components/auth/SoftGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const location = useLocation();
  const returnTo = encodeURIComponent(location.pathname + location.search);

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

  if (!user) {
    return (
      <SoftGate
        title="Create an account to continue"
        body="You can explore BiohackHer without signing up. Create a free account when you’re ready to save results and personalise your plan."
        primaryHref={`/auth?returnTo=${returnTo}`}
        secondaryHref="/plan-home"
        optionalTertiaryHref="/today-preview"
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
