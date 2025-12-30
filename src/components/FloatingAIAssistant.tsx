import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { FloatingAIChatDrawer } from "./FloatingAIChatDrawer";
import { useLocation } from "react-router-dom";

export const FloatingAIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Don't show on health assistant page (to avoid duplicate)
  if (location.pathname === "/health-assistant") {
    return null;
  }

  return (
    <>
      {/* Floating Button - Bottom Right (below MealSnap FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Drawer */}
      <FloatingAIChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
