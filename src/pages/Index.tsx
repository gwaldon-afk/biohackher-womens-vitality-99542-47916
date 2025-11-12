import heroImage from "@/assets/hero-main.jpg";
import brandLogo from "@/assets/biohackher-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Brain, Sparkles, Target, Apple } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();

  // Redirect authenticated users to Today page
  // TEMPORARILY DISABLED FOR REVIEW
  // useEffect(() => {
  //   if (user && !authLoading) {
  //     navigate('/today', { replace: true });
  //   }
  // }, [user, authLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-6">
                <img 
                  src={brandLogo} 
                  alt="Biohackher" 
                  className="h-32 w-auto mx-auto lg:mx-0 mb-6"
                />
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Live well longer
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
                  Empowering women to beat ageing through biohacking
                </p>
                
                <div className="space-y-4 pt-4">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 px-10 py-7 h-auto shadow-xl text-lg font-semibold"
                    onClick={() => navigate("/guest-lis-assessment")}
                  >
                    <Target className="h-6 w-6 mr-2" />
                    Get Your Free Longevity Score
                  </Button>
                  
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-white/90 text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>5 minutes • No signup required • Instant results</span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Women's health and longevity optimization" 
                  className="rounded-2xl shadow-2xl w-full max-w-lg mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Feature Cards */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {/* LIS Assessment */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                onClick={() => navigate("/guest-lis-assessment")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Know Your Longevity Score</h3>
                  <p className="text-muted-foreground">
                    5-minute assessment reveals your biological age and personalized protocol
                  </p>
                </CardContent>
              </Card>

              {/* Daily Nutrition */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                onClick={() => navigate("/nutrition")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Apple className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Track Your Daily Impact</h3>
                  <p className="text-muted-foreground">
                    Score your nutrition daily and see how each meal affects your longevity
                  </p>
                </CardContent>
              </Card>

              {/* Hormone Compass */}
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                onClick={() => navigate("/hormone-compass/assessment")}
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Understand Your Hormone Health</h3>
                  <p className="text-muted-foreground">
                    Quick assessment identifies hormone imbalances affecting your wellbeing
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-muted/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-5xl font-bold">
              Ready to start?
            </h2>
            <p className="text-xl text-muted-foreground">
              Your personalized longevity plan is 5 minutes away
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-10 py-7 h-auto shadow-lg font-semibold"
              onClick={() => navigate("/guest-lis-assessment")}
            >
              <Target className="h-5 w-5 mr-2" />
              Get Your Free Longevity Score
            </Button>

            <p className="text-sm text-muted-foreground pt-2">
              No signup required • Instant results
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
