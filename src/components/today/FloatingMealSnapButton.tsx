import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useFoodLogging } from "@/hooks/useFoodLogging";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SHOW_ON_ROUTES = ['/today', '/dashboard', '/nutrition', '/', '/master-dashboard'];

export const FloatingMealSnapButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { dailyTotals } = useFoodLogging();
  const [isHovered, setIsHovered] = useState(false);

  // Only show on specific routes and when user is logged in
  const shouldShow = user && SHOW_ON_ROUTES.some(route => 
    route === '/' ? location.pathname === '/' : location.pathname.startsWith(route)
  );

  // Don't show on the scan page itself
  if (location.pathname === '/nutrition-scan' || !shouldShow) {
    return null;
  }

  const handleClick = () => {
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
        className="fixed bottom-24 right-6 z-50"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              onClick={handleClick}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 relative group"
            >
              <motion.div
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Camera className="h-6 w-6" />
              </motion.div>
              
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
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            <p>{t('mealSnap.fabTooltip', 'Snap a meal')}</p>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
};
