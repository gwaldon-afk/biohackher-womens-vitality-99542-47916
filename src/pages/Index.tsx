import heroImage from "@/assets/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Moon, Thermometer, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

const Index = () => {
  const features = [
    {
      icon: Activity,
      title: "Biohackher Age",
      description: "Track your biological age with our proprietary algorithm based on sleep, HRV, and lifestyle metrics."
    },
    {
      icon: Thermometer,
      title: "Symptom Management",
      description: "Evidence-based interventions for hot flashes, sleep issues, and mood changes with Gold/Silver/Bronze ratings."
    },
    {
      icon: Heart,
      title: "Cycle-Aware Coaching",
      description: "Personalised training and nutrition recommendations that adapt to your hormonal stage and cycle phase."
    },
    {
      icon: Moon,
      title: "Sleep Optimisation",
      description: "Comprehensive sleep routines, red light protocols, and circadian rhythm management."
    },
    {
      icon: Zap,
      title: "Biohacking Therapies",
      description: "Guided protocols for red light therapy, cold exposure, and HRV breathwork with built-in timers."
    },
    {
      icon: TrendingUp,
      title: "Progress Reports",
      description: "30 and 90-day comprehensive reports with physician-ready summaries and trend analysis."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <Badge className="mb-6 bg-white/10 text-white border-white/20">
                  Women's Longevity Coach
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
                  Biohack<em className="italic">her</em>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-white/90">
                  Live well longer. Empowering women to beat ageing through biohacking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/auth">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                      Map my journey
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button size="lg" variant="outline" className="border-white text-foreground bg-white/10 hover:bg-white/20">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Confident woman tracking her wellness journey with Biohackher" 
                  className="rounded-lg shadow-2xl w-full max-w-md mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 gradient-text">
              Your Complete Longevity Toolkit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Science-backed protocols designed specifically for women's hormonal health and ageing optimisation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-elevated hover:shadow-lg transition-shadow">
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to <span className="gradient-text">Biohack Your Age</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of women who are taking control of their aging process with evidence-based protocols.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="primary-gradient">
                  Get Started Free
                </Button>
              </Link>
              <Link to="/upgrade">
                <Button size="lg" variant="outline">
                  View Premium Plans
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
