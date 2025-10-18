import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getContextualPrompts } from "@/utils/aiContextualPrompts";

interface FloatingAIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingAIChatDrawer = ({ isOpen, onClose }: FloatingAIChatDrawerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!isOpen) return null;

  const contextualPrompts = getContextualPrompts(location.pathname);

  const handlePromptClick = (prompt: string) => {
    // Navigate to health assistant with the prompt as a query parameter
    navigate(`/health-assistant?prompt=${encodeURIComponent(prompt)}`);
    onClose();
  };

  const handleFullAssistant = () => {
    navigate('/health-assistant');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="fixed bottom-24 right-6 w-full max-w-md animate-in slide-in-from-bottom-5"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ask Us
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Quick help for your current page
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-3">
            {contextualPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/5 hover:border-primary/30"
                onClick={() => handlePromptClick(prompt.text)}
              >
                <div className="flex items-start gap-3 w-full">
                  <prompt.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm flex-1">{prompt.text}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              </Button>
            ))}
            
            <div className="pt-2 border-t">
              <Button
                variant="default"
                className="w-full"
                onClick={handleFullAssistant}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Ask Us Anything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
