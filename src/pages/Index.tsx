import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Activity, Package, Heart } from "lucide-react";
import biohackherLogo from "@/assets/logos/biohackher-logo-master.svg";
import taglineSvg from "@/assets/logos/biohackher-tagline.svg";
import heroImage from "@/assets/hero-biohackher.jpg";
import { AssessmentHeroCard } from "@/components/AssessmentHeroCard";
import StatisticsBar from "@/components/StatisticsBar";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import TrustIndicators from "@/components/TrustIndicators";
import BenefitsSection from "@/components/BenefitsSection";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const [showPlansBanner, setShowPlansBanner] = useState(false);

  // Redirect authenticated users to /today
  useEffect(() => {
    if (user) {
      navigate("/today");
    }
  }, [user, navigate]);

  useEffect(() => {
    const banner = sessionStorage.getItem('homeBanner');
    if (banner === 'plansRequireAccount') {
      setShowPlansBanner(true);
      sessionStorage.removeItem('homeBanner');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {(notice || showPlansBanner) && (
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <div className="rounded-lg border border-border bg-background/80 px-4 py-3 text-sm text-muted-foreground">
            <div className="flex flex-col gap-3">
              <span>
                {notice || "Create a free account to save your plan and access Today."}
              </span>
              {showPlansBanner && (
                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    onClick={() => navigate("/guest-lis-assessment")}
                  >
                    Start assessment
                  </button>
                  <button
                    className="inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
                    onClick={() => navigate("/auth")}
                  >
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Header Only */}
      <section className="relative overflow-hidden py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-start justify-center gap-8 mb-4">
            <div className="flex flex-col gap-6 max-w-3xl">
              {/* Logo directly above headline */}
              <img src={biohackherLogo} alt="Biohackher Logo" className="h-auto w-full object-contain mb-2" />
              
              <h1 className="sr-only">{t('home.hero.tagline')}</h1>
              <img 
                src={taglineSvg} 
                alt={t('home.hero.tagline')} 
                className="h-auto w-full max-w-xl object-contain" 
              />
              
              <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground">
                  {t('home.hero.welcomeTitle')}
                </p>
                <p>
                   •	{t('home.hero.welcomeDescription')}
                </p>
                
                <p className="font-semibold text-foreground">
                  {t('home.hero.slogan')}
                </p>
              </div>
            </div>
            
            {/* Hero image - expanded to align with text */}
            <img src={heroImage} alt="Woman embodying vitality and longevity" className="hidden lg:block h-auto w-64 object-contain shadow-lg border-2 border-primary/20" />
          </div>
        </div>
      </section>

      {/* Assessment CTAs Section */}
      <section className="py-8 md:py-10 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-1">
              {t('home.assessments.sectionTitle')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            <AssessmentHeroCard 
              icon={Activity} 
              headline={t('home.assessments.lis.headline')} 
              benefit={t('home.assessments.lis.benefit')} 
              duration={t('home.assessments.lis.duration')} 
              ctaRoute="/guest-lis-assessment" 
            />

            <AssessmentHeroCard 
              icon={Package} 
              headline={t('home.assessments.nutrition.headline')} 
              benefit={t('home.assessments.nutrition.benefit')} 
              duration={t('home.assessments.nutrition.duration')} 
              ctaRoute="/longevity-nutrition" 
            />

            <AssessmentHeroCard 
              icon={Heart} 
              headline={t('home.assessments.hormone.headline')} 
              benefit={t('home.assessments.hormone.benefit')} 
              duration={t('home.assessments.hormone.duration')} 
              ctaRoute="/hormone-compass/assessment" 
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Social Proof Section */}
      <StatisticsBar />
      
      <section className="py-12 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <h2 className="text-3xl font-bold text-center">{t('home.testimonials.sectionTitle')}</h2>
          <TestimonialCarousel />
          <TrustIndicators />
        </div>
      </section>
    </div>
  );
};

export default Index;
