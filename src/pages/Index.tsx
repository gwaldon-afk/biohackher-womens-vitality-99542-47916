import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Package, Heart } from "lucide-react";
import biohackherLogo from "@/assets/logos/biohackher-logo-master.svg";
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
              <img src={biohackherLogo} alt="Biohackher Logo" className="h-auto w-full object-contain mb-2" />
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight uppercase">
                {t('home.hero.tagline')}
              </h1>
              
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
              ctaRoute="/menomap/assessment" 
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
