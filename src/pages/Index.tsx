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

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

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
            <p className="text-xl lg:text-2xl text-white/80 leading-relaxed mb-2">
              Get your personalized longevity assessment in 5 minutes. Discover your biological age, identify health risks, and receive a science-backed protocol to optimize your healthspan.
            </p>
            <p className="text-lg text-white/70 leading-relaxed">
              Understand how fast you're aging—and exactly what to do about it.
            </p>
          </div>

          {/* Single Primary CTA + Secondary */}
          <div className="space-y-4">
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 px-8 py-6 h-auto shadow-xl text-lg"
              onClick={() => navigate("/guest-lis-assessment")}
            >
              <Target className="h-6 w-6 mr-2" />
              Get Your Free Longevity Score
            </Button>
            
            <div className="flex items-center justify-center lg:justify-start gap-2 text-white/90 text-sm">
              <Sparkles className="h-4 w-4" />
              <span>5-minute assessment • No signup required • Instant results</span>
            </div>

            {/* Secondary CTA - More Prominent */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => navigate("/health-assistant")}
                className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 hover:border-white/50 px-8 py-6 h-auto text-base"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Ask Our AI Health Assistant
              </Button>
            </div>
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

      {/* You're Not Alone - Women's Top Health Concerns */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                You're Not Alone — We Cover What Matters Most
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These are the top health concerns women face. Our comprehensive assessment addresses all of them.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Hormone Balance */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Heart className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Hormone Balance & Menopause</h3>
                <p className="text-sm text-muted-foreground">
                  Navigate perimenopause symptoms, hot flashes, and hormonal shifts with confidence
                </p>
              </div>

              {/* Energy & Fatigue */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Energy & Fatigue</h3>
                <p className="text-sm text-muted-foreground">
                  Combat exhaustion, brain fog, and afternoon crashes that disrupt your day
                </p>
              </div>

              {/* Weight & Metabolism */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Scale className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Weight & Metabolism</h3>
                <p className="text-sm text-muted-foreground">
                  Understand metabolic changes, stubborn weight, and how to optimize body composition
                </p>
              </div>

              {/* Sleep Quality */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Moon className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Sleep Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Address insomnia, night waking, and poor sleep that leaves you feeling drained
                </p>
              </div>

              {/* Brain Fog & Mental Clarity */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Brain className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Brain Fog & Mental Clarity</h3>
                <p className="text-sm text-muted-foreground">
                  Sharpen focus, improve memory, and clear mental cloudiness affecting your performance
                </p>
              </div>

              {/* Stress & Emotional Balance */}
              <div className="p-6 bg-background rounded-lg border border-primary/20 relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    <span>Covered</span>
                  </div>
                </div>
                <Activity className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-lg font-bold mb-2">Stress & Emotional Balance</h3>
                <p className="text-sm text-muted-foreground">
                  Manage overwhelm, mood swings, and find calm amidst life's demands
                </p>
              </div>
            </div>

            {/* Trust Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span>All 6 areas assessed in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Evidence-based insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Science-backed for women</span>
              </div>
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

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <div className="p-6 bg-background rounded-lg border border-primary/10">
                <Target className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-2">Your Longevity Impact Score (0-100)</h3>
                <p className="text-sm text-muted-foreground">Know exactly where you stand—and how much room you have to improve your healthspan and lifespan</p>
              </div>
              <div className="p-6 bg-background rounded-lg border border-primary/10">
                <Activity className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-2">Scores Across 6 Health Pillars</h3>
                <p className="text-sm text-muted-foreground">See your Sleep, Stress, Activity, Nutrition, Social, and Cognitive ratings so you know which areas need the most attention</p>
              </div>
              <div className="p-6 bg-background rounded-lg border border-primary/10">
                <Brain className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-2">Your Top Risk Categories</h3>
                <p className="text-sm text-muted-foreground">Identify hidden health vulnerabilities before they become problems—early detection saves years</p>
              </div>
              <div className="p-6 bg-background rounded-lg border border-primary/10">
                <TrendingUp className="h-8 w-8 text-primary mb-3" />
                <h3 className="text-xl font-bold mb-2">Longevity Projections</h3>
                <p className="text-sm text-muted-foreground">Understand your biological age vs. chronological age, and see how lifestyle changes could add years to your life</p>
              </div>
            </div>

            {/* Benefits of Creating Account */}
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-lg text-muted-foreground">
                  Create a free account after your assessment to unlock:
                </p>
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

      {/* Your Personalized Longevity Journey */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Your Personalized Longevity Journey
              </h2>
              <p className="text-lg text-muted-foreground">
                Here's what happens after your free assessment
              </p>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-6 items-start p-6 bg-background rounded-lg border">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Get Your Longevity Score</h3>
                  <p className="text-muted-foreground">
                    See your score across Sleep, Stress, Activity, Nutrition, Social, and Cognitive health. Understand your biological age and risk factors.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 items-start p-6 bg-background rounded-lg border">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Receive Your Custom Protocol</h3>
                  <p className="text-muted-foreground">
                    Create a free account to unlock your personalized 7-day plan with supplement recommendations and lifestyle optimizations.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 items-start p-6 bg-background rounded-lg border">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Track Your Progress</h3>
                  <p className="text-muted-foreground">
                    Monitor daily scores, log symptoms, and see how your interventions impact your longevity metrics over time.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-6 items-start p-6 bg-background rounded-lg border">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Optimize with AI Guidance</h3>
                  <p className="text-muted-foreground">
                    Ask questions, refine protocols, and get research-backed answers from our AI health assistant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to Optimize Your Healthspan?
            </h2>
            <p className="text-lg text-muted-foreground">
              Your personalized longevity roadmap is 5 minutes away
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto shadow-lg"
              onClick={() => navigate("/guest-lis-assessment")}
            >
              <Target className="h-5 w-5 mr-2" />
              Start Free Assessment
            </Button>

            <div className="flex items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span>Results in 5 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
