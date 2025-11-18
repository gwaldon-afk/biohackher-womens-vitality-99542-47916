import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Package, Heart } from "lucide-react";
import biohackherLogo from "@/assets/brand-face-logo.jpg";
import heroImage from "@/assets/hero-biohackher.jpg";
import Navigation from "@/components/Navigation";
import { AssessmentHeroCard } from "@/components/AssessmentHeroCard";
import StatisticsBar from "@/components/StatisticsBar";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import TrustIndicators from "@/components/TrustIndicators";

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
      
      {/* Hero Section - Triple Assessment Cards */}
      <section className="relative overflow-hidden py-12 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="space-y-12">
            {/* Hero Header */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase">
                  LIVE WELL LONGER
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  Empowering women to beat ageing through biohacking
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
                  Choose Your Starting Point
                </h2>
              </div>
              
              {/* Hero image - rectangular, right of text */}
              <img 
                src={heroImage} 
                alt="Woman embodying vitality and longevity"
                className="h-48 w-auto object-contain shadow-lg border-2 border-primary/20"
              />
            </div>

            {/* Triple Assessment Cards */}
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
                socialProof="50,000+ women completed"
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
                socialProof="Avg score: 62/100"
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
                socialProof="Works for ages 25-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <StatisticsBar />
      
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
