import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Package, Heart } from "lucide-react";
import biohackherLogo from "@/assets/logos/biohackher-logo-master.png";
import heroImage from "@/assets/hero-biohackher.jpg";
import Navigation from "@/components/Navigation";
import { AssessmentHeroCard } from "@/components/AssessmentHeroCard";
import StatisticsBar from "@/components/StatisticsBar";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import TrustIndicators from "@/components/TrustIndicators";
import BenefitsSection from "@/components/BenefitsSection";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Redirect authenticated users to /today
  useEffect(() => {
    if (user) {
      navigate("/today");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Header Only */}
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start justify-center gap-8 mb-4">
            <div className="flex flex-col gap-6 max-w-3xl">
              {/* Logo directly above headline */}
              <img 
                src={biohackherLogo} 
                alt="Biohackher Logo"
                className="h-auto w-full object-contain mb-2"
              />
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase">
                LIVE WELL LONGER
              </h1>
              
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">
                  Welcome to the Biohackher App — Your Personal Playbook to Living Well Longer
                </p>
                <p>
                  Designed exclusively for women, the Biohackher App is your science-backed hub for mastering your healthspan. Forget guesswork. Here, data becomes actionable, longevity becomes personalised, and feeling incredible becomes your new baseline.
                </p>
                <p>
                  Inside, you'll discover powerful assessment tools that reveal where you sit on the healthspan spectrum — from metabolic resilience to stress load, mitochondrial vitality, recovery capacity, hormonal balance, gut health and more. Each insight comes with evidence-based biohacks tailored to your biology, your goals, and your season of life.
                </p>
                <p>
                  No fluff. No overwhelm. Just clear, research-driven strategies to help you boost energy, sharpen your brain, balance your hormones, age vibrantly, and take control of the years ahead.
                </p>
                <p>
                  This is where women rewrite the rules of ageing — with science, self-awareness, and a whole lot of biohacking brilliance.
                </p>
                <p className="font-semibold text-foreground">
                  Live well longer. Thrive harder. Biohack like a woman.
                </p>
              </div>
            </div>
            
            {/* Hero image - expanded to align with text */}
            <img 
              src={heroImage} 
              alt="Woman embodying vitality and longevity"
              className="hidden lg:block h-auto w-80 object-contain shadow-lg border-2 border-primary/20"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Social Proof Section */}
      <StatisticsBar />
      
      {/* Assessment CTAs Section */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
              Choose Your Starting Point
            </h2>
            <p className="text-muted-foreground">
              Pick the assessment that matters most to you right now
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <AssessmentHeroCard
              icon={Activity}
              headline="Discover Your Longevity Impact Score"
              painPoint="How fast are you aging?"
              benefits={[
                "Get your biological age in 5 minutes",
                "Identify your weakest health pillar",
                "Receive personalized protocol"
              ]}
              duration="Free • 5 min • No signup"
              ctaText="Get My Longevity Score"
              ctaRoute="/guest-lis-assessment"
            />

            <AssessmentHeroCard
              icon={Package}
              headline="Get Your Nutrition Longevity Score"
              painPoint="Is your diet aging you faster?"
              benefits={[
                "Score your nutrition on 15 longevity factors",
                "Identify missing nutrients hurting healthspan",
                "Get supplement + meal recommendations"
              ]}
              duration="Free • 8 min • No signup"
              ctaText="Score My Nutrition"
              ctaRoute="/longevity-nutrition"
            />

            <AssessmentHeroCard
              icon={Heart}
              headline="Navigate Your Hormone Health"
              painPoint="Struggling with hormonal symptoms?"
              benefits={[
                "Assess hormone health across 6 domains",
                "Understand your hormone life stage",
                "Get targeted symptom relief protocols"
              ]}
              duration="Free • 6 min • No signup"
              ctaText="Check My Hormones"
              ctaRoute="/menomap/assessment"
            />
          </div>
        </div>
      </section>
      
      <section className="py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-bold text-center">What Women Are Saying</h2>
          <TestimonialCarousel />
          <TrustIndicators />
        </div>
      </section>
    </div>
  );
};

export default Index;
