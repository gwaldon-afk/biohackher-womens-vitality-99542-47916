import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useFoodLogging } from "@/hooks/useFoodLogging";
import { motion, AnimatePresence } from "framer-motion";

// Protected routes where user is guaranteed to be logged in
const PROTECTED_ROUTES = ['/today', '/dashboard', '/nutrition', '/master-dashboard'];
const PUBLIC_ROUTES_WITH_FAB = ['/'];

export const FloatingMealSnapButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { dailyTotals } = useFoodLogging();
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNewBadge, setShowNewBadge] = useState(false);

  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );
  const isPublicRouteWithFab = PUBLIC_ROUTES_WITH_FAB.includes(location.pathname);

  // Show on protected routes (after auth loads) or on public routes if logged in
  const shouldShow = 
    (isProtectedRoute && !loading) || 
    (isPublicRouteWithFab && !!user);

  // Check for first-time user and handle NEW badge
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('mealSnapIntroSeen');
    if (!hasSeenIntro && shouldShow) {
      setShowNewBadge(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowNewBadge(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  // Scroll-collapse behavior
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsExpanded(!scrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Don't show on the scan page itself
  if (location.pathname === '/nutrition-scan' || !shouldShow) {
    return null;
  }

  const handleClick = () => {
    // Mark as seen on first click
    if (showNewBadge) {
      localStorage.setItem('mealSnapIntroSeen', 'true');
      setShowNewBadge(false);
    }
    navigate('/nutrition-scan');
  };

  const mealCount = dailyTotals?.mealCount || 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2"
      >
        {/* NEW Badge */}
        <AnimatePresence>
          {showNewBadge && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg animate-pulse"
            >
              {t('mealSnap.new', 'NEW')}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extended FAB */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <Button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative group px-4 gap-2.5"
          >
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Camera className="h-5 w-5 flex-shrink-0" />
            </motion.div>
            
            {/* Expandable text */}
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-semibold whitespace-nowrap overflow-hidden"
                >
                  {t('mealSnap.snapMeal', 'Snap Meal')}
                </motion.span>
              )}
            </AnimatePresence>
            
            {/* Meal count badge */}
            {mealCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs font-medium flex items-center justify-center shadow-sm">
                {mealCount}
              </span>
            )}
            
            {/* Subtle pulse animation on first render */}
            <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-20 pointer-events-none" 
                  style={{ animationIterationCount: 3, animationDuration: '1.5s' }} />
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
