import { useTranslation } from "react-i18next";
import { Sparkles, Target, Shield } from "lucide-react";

const BenefitsSection = () => {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Sparkles,
      headlineKey: "home.benefits.energy.headline",
      descriptionKey: "home.benefits.energy.description"
    },
    {
      icon: Target,
      headlineKey: "home.benefits.blueprint.headline",
      descriptionKey: "home.benefits.blueprint.description"
    },
    {
      icon: Shield,
      headlineKey: "home.benefits.confidence.headline",
      descriptionKey: "home.benefits.confidence.description"
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('home.benefits.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.benefits.sectionSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={index}
                className="bg-card border-2 border-primary/20 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">
                  {t(benefit.headlineKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(benefit.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
