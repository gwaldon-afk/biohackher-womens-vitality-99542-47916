import heroImage from "@/assets/hero-image.jpg";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, Sparkles, Zap, Target, TrendingUp, Package, MessageSquare, BookOpen, FileText, Heart, Moon, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CTAButton from "@/components/CTAButton";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Redirect authenticated users to Today hub
  useEffect(() => {
    if (user) {
      navigate('/today');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Complete Health Hub */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                    {t('home.hero.title')}
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
                    {t('home.hero.description')}
                  </p>
                </div>

                {/* Multiple Entry Point CTAs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 px-6 py-6 h-auto shadow-xl"
                    onClick={() => navigate("/guest-lis-assessment")}
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Take Free Longevity Assessment
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 px-6 py-6 h-auto backdrop-blur"
                    onClick={() => navigate("/health-assistant")}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Ask Your Health Questions
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 px-6 py-6 h-auto backdrop-blur"
                    onClick={() => navigate("/shop")}
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Browse Products
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 px-6 py-6 h-auto backdrop-blur"
                    onClick={() => navigate("/research-evidence")}
                  >
                    <BookOpen className="h-5 w-5 mr-2" />
                    Explore Research
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

      {/* What You Can Do Here Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Biohack Every Aspect of Your Health
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track progress, get AI insights, shop smart, and access the science all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/dashboard')}>
              <CardHeader>
                <Activity className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Track & Optimize</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Monitor daily health scores, track symptoms, and see how lifestyle changes impact longevity
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/shop')}>
              <CardHeader>
                <Package className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Shop Smart</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get personalized supplement recommendations based on your assessments and goals
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/health-assistant')}>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Get Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Ask our AI assistant about symptoms, protocols, or wellness strategies
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/research-evidence')}>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Learn & Grow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Access curated research, evidence-based protocols, and longevity science
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* For Every Health Goal Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              For Every Health Goal
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether optimizing one area or transforming your entire healthspan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <Zap className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Energy & Vitality</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Combat fatigue, boost mitochondrial function, feel energized
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Brain className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Cognitive Performance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Enhance focus, memory, and mental clarity with targeted interventions
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Scale className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Body Composition</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Build lean muscle, optimize metabolism, sustainable weight management
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Heart className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Hormonal Balance</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Address perimenopause, menopause, restore hormonal equilibrium
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Moon className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Sleep Quality</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Improve sleep duration, depth, wake feeling refreshed every morning
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-6 w-6 text-primary mb-2" />
                <CardTitle className="text-lg">Longevity Optimization</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Extend healthspan, reduce biological age, maximize quality of life
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It All Connects - 4 Steps */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                How It All <span className="text-primary">Connects</span>
              </h2>
              <p className="text-lg text-muted-foreground">From assessment to optimization, everything works together</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Assess</h3>
                <p className="text-muted-foreground text-sm">Take assessments to understand your current health status</p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Discover</h3>
                <p className="text-muted-foreground text-sm">Get personalized product and protocol recommendations</p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Implement</h3>
                <p className="text-muted-foreground text-sm">Shop evidence-based solutions and build your protocol</p>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="mb-4 flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">Optimize</h3>
                <p className="text-muted-foreground text-sm">Track progress and refine your approach with AI guidance</p>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-muted-foreground">
                Plus, ask our AI assistant anytime for guidance, research, or personalized recommendations
              </p>
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
