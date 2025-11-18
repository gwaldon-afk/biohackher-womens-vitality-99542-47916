import { Sparkles, Target, Shield } from "lucide-react";

const benefits = [
  {
    icon: Sparkles,
    headline: "Reclaim Your Energy, Focus & Vitality",
    description: "Feel like yourself again with protocols designed for women's biology—not adapted from male studies."
  },
  {
    icon: Target,
    headline: "Your Personal Blueprint for Aging Well",
    description: "Integrated plans connecting nutrition, hormones, sleep, and movement that work together—not in isolation."
  },
  {
    icon: Shield,
    headline: "Start Free, Transform with Confidence",
    description: "Free assessments and protocols show what's possible. Add supplements and expert guidance when you're ready."
  }
];

const BenefitsSection = () => {
  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Your Complete Longevity System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to transform your health—in one place
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
                  {benefit.headline}
                </h3>
                <p className="text-muted-foreground">
                  {benefit.description}
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
