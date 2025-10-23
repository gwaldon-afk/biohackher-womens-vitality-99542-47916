import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Zap, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const WelcomeStreamSelect = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const handleStreamSelect = async (stream: 'performance' | 'menopause') => {
    if (!user) return;

    try {
      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ user_stream: stream })
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh profile from database
      await refreshProfile();
      navigate('/onboarding/intro-3step');
    } catch (error) {
      console.error('Error saving stream selection:', error);
      toast({
        title: "Error",
        description: "Failed to save your selection. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Welcome to Your Journey</h1>
          <p className="text-muted-foreground text-lg">Choose your path to vitality</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStreamSelect('performance')}>
            <div className="flex justify-center">
              <div className="p-4 bg-primary/10 rounded-full">
                <Zap className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-center">Performance</h2>
            <p className="text-muted-foreground text-center">
              Optimize energy, focus, and biohacking for peak vitality
            </p>
            <Button className="w-full" size="lg">
              Start Performance Journey
            </Button>
          </Card>

          <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStreamSelect('menopause')}>
            <div className="flex justify-center">
              <div className="p-4 bg-secondary/10 rounded-full">
                <Heart className="w-12 h-12 text-secondary" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-center">Menopause</h2>
            <p className="text-muted-foreground text-center">
              Navigate your menopause journey with personalized support
            </p>
            <Button className="w-full" variant="secondary" size="lg">
              Start Menopause Journey
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStreamSelect;
