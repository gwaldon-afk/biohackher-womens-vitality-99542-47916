import heroImage from "@/assets/hero-image.jpg";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CTAButton from "@/components/CTAButton";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Problem-First Approach */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                    Feeling Exhausted, Foggy, and <span className="text-white/90">Frustrated</span> with Generic Health Advice?
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
                    Get your personalized longevity score in 5 minutes
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="flex flex-col gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 text-xl px-10 py-8 h-auto shadow-xl"
                    onClick={() => navigate("/guest-lis-assessment")}
                  >
                    <Target className="h-7 w-7 mr-3" />
                    Get Your Free Longevity Assessment
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-lg px-8 py-6 h-auto backdrop-blur"
                    onClick={() => navigate("/health-assistant")}
                  >
                    <Sparkles className="h-6 w-6 mr-2" />
                    Ask AI About Your Health
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Women's health and longevity optimization" 
                  className="rounded-lg shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                How It <span className="text-primary">Works</span>
              </h2>
              <p className="text-lg text-muted-foreground">Science-backed protocols designed for women's biology</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">1. Take 5-Minute Assessment</h3>
                <p className="text-muted-foreground">Quick, science-based questions about your health and symptoms</p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">2. Get Your Personalized Plan</h3>
                <p className="text-muted-foreground">AI-powered recommendations based on scientific evidence</p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">3. Track & Optimize</h3>
                <p className="text-muted-foreground">Monitor progress and refine your protocol for best results</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Your Free Assessment Includes */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Your Free Assessment Includes</h2>
              <p className="text-muted-foreground">See exactly where you stand—no signup required</p>
            </div>

            <div className="grid gap-4 max-w-2xl mx-auto mb-16">
              {[
                "Your Longevity Impact Score (0-100)",
                "Risk Category Assessment (Optimal/Protective/Moderate/High Risk)",
                "Biological Age Estimation",
                "Top 3 Strengths & Areas for Improvement",
                "Future Aging Trajectory Projections (5 & 20 year)"
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 bg-background rounded-lg border">
                  <Target className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Create Account to Unlock */}
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Create Free Account to Unlock</h3>
                <p className="text-muted-foreground">Save your results and access personalized protocols</p>
              </div>
              
              <div className="grid gap-4">
                {[
                  "Save & Track Your Progress",
                  "Personalized 7-Day Protocol",
                  "Science-Backed Supplement Recommendations",
                  "AI Health Assistant (5 free questions/day)",
                  "Monthly Reassessments"
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Get Your Free Longevity Score in <span className="text-primary">5 Minutes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See exactly where you stand on Brain, Body, Balance & Beauty
            </p>
            <div className="space-y-4">
              <Button 
                size="lg" 
                className="text-xl px-10 py-8 h-auto shadow-lg"
                onClick={() => navigate("/guest-lis-assessment")}
              >
                <Target className="h-6 w-6 mr-2" />
                Start Free Assessment →
              </Button>
              <p className="text-sm text-muted-foreground">
                No signup required • See results instantly • Create account later to save progress
              </p>
            </div>
            
            {/* Trust Signals - Only Factual */}
            <div className="flex items-center justify-center gap-8 pt-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Evidence-Based Protocols</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
