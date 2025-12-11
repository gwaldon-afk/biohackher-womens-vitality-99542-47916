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
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuth();

  // Redirect authenticated users to /today
  useEffect(() => {
    if (user) {
      navigate("/today");
    }
  }, [user, navigate]);
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section - Header Only */}
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start justify-center gap-8 mb-4">
            <div className="flex flex-col gap-6 max-w-3xl">
              {/* Logo directly above headline */}
              <img src={biohackherLogo} alt="Biohackher Logo" className="h-auto w-full object-contain mb-2" />
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase">
                LIVE WELL LONGER
              </h1>
              
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">
                  Welcome to the Biohackher App — Your Personal Playbook to Living Well Longer
                </p>
                <p>
                   Your one-stop hub for all your healthspan needs, created exclusively for women who want to understand and upgrade their biology — the place where women go to check in, level up and feel incredible.
                </p>
                
                <p className="font-semibold text-foreground">
                  Live well longer. Thrive harder. Biohack like a woman.
                </p>
              </div>
            </div>
            
            {/* Hero image - expanded to align with text */}
            <img src={heroImage} alt="Woman embodying vitality and longevity" className="hidden lg:block h-auto w-80 object-contain shadow-lg border-2 border-primary/20" />
          </div>
        </div>
      </section>

      {/* Assessment CTAs Section */}
      <section className="py-8 md:py-10 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">
              Choose Your Starting Point
            </h2>
            <p className="text-sm text-muted-foreground">
              Pick the assessment that matters most to you right now
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <AssessmentHeroCard icon={Activity} headline="Discover Your Longevity Impact Score" painPoint="How fast are you aging?" benefits={["Get your biological age in 5 minutes", "Identify your weakest health pillar", "Receive personalized protocol"]} duration="Free • 5 min • No signup" ctaText="Get My Longevity Score" ctaRoute="/guest-lis-assessment" />

            <AssessmentHeroCard icon={Package} headline="Discover Your Metabolic Age" painPoint="Is your metabolism aging faster than you?" benefits={["Get your Metabolic Age in 8 minutes", "Compare to women your age", "Receive targeted nutrition protocols"]} duration="Free • 8 min • No signup" ctaText="Get My Metabolic Age" ctaRoute="/longevity-nutrition" />

            <AssessmentHeroCard icon={Heart} headline="Discover Your Hormone Age" painPoint="Are your hormones aging faster than you?" benefits={["Get your Hormone Age in 6 minutes", "Compare to women your age", "Receive targeted protocols to reverse it"]} duration="Free • 6 min • No signup" ctaText="Get My Hormone Age" ctaRoute="/menomap/assessment" />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Social Proof Section */}
      <StatisticsBar />
      
      <section className="py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-bold text-center">What Women Are Saying</h2>
          <TestimonialCarousel />
          <TrustIndicators />
        </div>
      </section>
    </div>;
};
export default Index;