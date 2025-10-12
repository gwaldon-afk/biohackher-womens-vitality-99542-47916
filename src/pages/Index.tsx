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
      
      {/* Hero Section - Dual Path Messaging */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-20 lg:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left space-y-8">
                <div>
                  <h1 className="text-5xl lg:text-7xl font-bold mb-6 text-white leading-tight">
                    {t('home.hero.title')}<br />
                    <span className="text-white/90">{t('home.hero.subtitle')}</span>
                  </h1>
                  <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
                    {t('home.hero.description')}
                  </p>
                </div>

                {/* Primary CTAs - Two Button Layout aligned with cards below */}
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto w-full sm:w-1/2 whitespace-normal"
                    onClick={() => navigate("/guest-lis-assessment")}
                  >
                    <Target className="h-6 w-6 mr-2 flex-shrink-0" />
                    <span className="text-center flex-1">{t('home.hero.ctaPrimary')}</span>
                  </Button>
                  <Button 
                    size="lg"
                    className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto w-full sm:w-1/2 whitespace-normal"
                    onClick={() => navigate("/health-assistant")}
                  >
                    <Sparkles className="h-6 w-6 mr-2 flex-shrink-0" />
                    <span className="text-center flex-1">Ask Us Anything</span>
                  </Button>
                </div>

                {/* Secondary CTAs - Dual Path */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Card className="flex-1 bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group" onClick={() => navigate("/pillars?path=performance")}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-x-1 transition-transform">{t('home.hero.ctaPerformance')}</h3>
                          <p className="text-white/70 text-sm">{t('home.hero.ctaPerformanceDesc')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex-1 bg-white/10 backdrop-blur border-white/20 hover:bg-white/20 transition-all cursor-pointer group" onClick={() => navigate("/pillars?path=menopause")}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-lg">
                          <Activity className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1 group-hover:translate-x-1 transition-transform">{t('home.hero.ctaMenopause')}</h3>
                          <p className="text-white/70 text-sm">{t('home.hero.ctaMenopauseDesc')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Women's longevity and wellness optimization" 
                  className="rounded-lg shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Four Pillars Section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                {t('home.pillars.title')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('home.pillars.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  title: "Brain",
                  subtitle: "Mental clarity & cognitive optimization",
                  image: brainPillar,
                  icon: Brain,
                  color: "from-primary to-primary-light",
                  path: "/pillars?pillar=brain"
                },
                {
                  title: "Body",
                  subtitle: "Strength, vitality & metabolic health",
                  image: bodyPillar,
                  icon: Activity,
                  color: "from-primary-dark to-primary",
                  path: "/pillars?pillar=body"
                },
                {
                  title: "Balance",
                  subtitle: "Hormonal harmony & stress resilience",
                  image: balancePillar,
                  icon: Zap,
                  color: "from-secondary to-secondary-light",
                  path: "/pillars?pillar=balance"
                },
                {
                  title: "Beauty",
                  subtitle: "Cellular regeneration & radiant aging",
                  image: beautyPillar,
                  icon: Sparkles,
                  color: "from-secondary-dark to-secondary",
                  path: "/pillars?pillar=beauty"
                }
              ].map((pillar, index) => (
                <Card 
                  key={index}
                  className="card-elevated hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group" 
                  onClick={() => navigate(pillar.path)}
                >
                  <div className="relative h-48">
                    <img 
                      src={pillar.image} 
                      alt={`${pillar.title} pillar for women's longevity`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${pillar.color} opacity-70 group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute top-4 left-4">
                      <pillar.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-base">
                      {pillar.subtitle}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <CTAButton
                text="Explore All Pillars"
                href="/pillars"
                variant="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 lg:py-32 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Ready to Optimize Your <span className="gradient-text">Longevity</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of women taking control of their health with science-backed biohacking protocols designed for your unique biology.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate("/guest-lis-assessment")}
              >
                <Target className="h-5 w-5 mr-2" />
                Start Your Free Assessment
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 h-auto"
                onClick={() => navigate("/about")}
              >
                Learn More About Biohackher
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
