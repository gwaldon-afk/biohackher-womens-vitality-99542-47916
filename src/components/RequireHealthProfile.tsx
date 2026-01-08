import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { Loader2 } from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';

interface RequireHealthProfileProps {
  children: React.ReactNode;
  requiredFields?: ('weight_kg' | 'height_cm' | 'activity_level' | 'date_of_birth')[];
}

export function RequireHealthProfile({ 
  children, 
  requiredFields = ['weight_kg', 'height_cm', 'activity_level', 'date_of_birth'] 
}: RequireHealthProfileProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useHealthProfile();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for authenticated test mode - bypass profile check
  const testTier = TEST_MODE_ENABLED ? localStorage.getItem('testModeTier') : null;
  const isAuthenticatedTestMode = TEST_MODE_ENABLED && testTier && testTier !== 'guest';

  const isProfileComplete = () => {
    if (!profile) return false;
    
    return requiredFields.every(field => {
      const value = profile[field as keyof typeof profile];
      return value !== null && value !== undefined && value !== '';
    });
  };

  useEffect(() => {
    // Wait for loading to complete
    if (authLoading || profileLoading) return;
    
    // Only check for authenticated users
    if (!user) return;
    
    // Redirect to complete profile if incomplete
    if (!isProfileComplete()) {
      const returnTo = encodeURIComponent(location.pathname + location.search);
      navigate(`/complete-profile?returnTo=${returnTo}`, { replace: true });
    }
  }, [user, authLoading, profile, profileLoading, navigate, location]);

  // Show loading while checking
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking your profile...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, let children render (ProtectedRoute handles auth)
  if (!user) {
    return <>{children}</>;
  }

  // Bypass profile check in authenticated test mode
  if (isAuthenticatedTestMode) {
    return <>{children}</>;
  }

  // If profile is complete, render children
  if (isProfileComplete()) {
    return <>{children}</>;
  }

  // Still loading/redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecting to complete your profile...</p>
      </div>
    </div>
  );
}
