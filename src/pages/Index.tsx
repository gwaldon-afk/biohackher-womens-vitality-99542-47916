// Placeholder for hero image - will be replaced with actual asset later
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Moon, Thermometer, Zap, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LISInputForm from "@/components/LISInputForm";

const Index = () => {
  const navigate = useNavigate();
  
  const handleScoreCalculated = () => {
    // Callback when LIS score is calculated
    console.log("LIS score calculated from homepage");
  };
  const features = [
    {
      icon: Activity,
      title: "Daily Longevity Inputs",
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
      <section className="relative overflow-hidden z-10">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left z-20 relative">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
                  <span className="text-foreground">Biohack</span>
                  <span className="text-white italic">her</span>
                  <sup className="text-sm font-normal ml-1">®</sup>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 text-white/90">
                  Live well longer.<br />
                  Empowering women to beat ageing through biohacking.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start relative z-30">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-white/90 relative z-50 pointer-events-auto"
                    onClick={() => {
                      console.log("Map my journey clicked");
                      navigate("/auth");
                    }}
                  >
                    Map my journey
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white text-primary border-white hover:bg-white/90 relative z-50 pointer-events-auto"
                    onClick={() => {
                      console.log("View Dashboard clicked");
                      navigate("/dashboard");
                    }}
                  >
                    View Dashboard
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="rounded-lg shadow-2xl w-full max-w-md mx-auto h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">Hero Image Placeholder</p>
                </div>
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
            {features.map((feature, index) => {
              if (feature.title === "Daily Longevity Inputs") {
                return (
                  <LISInputForm key={index} onScoreCalculated={handleScoreCalculated}>
                    <Card className="card-elevated hover:shadow-lg transition-shadow cursor-pointer h-64 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <feature.icon className="h-10 w-10 text-primary mb-4" />
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <CardDescription className="text-base">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </LISInputForm>
                );
              }
              
              return (
                <Card 
                  key={index} 
                  className="card-elevated hover:shadow-lg transition-shadow cursor-pointer h-64 flex flex-col" 
                  onClick={() => {
                    console.log(`${feature.title} card clicked`);
                    if (feature.title === "Symptom Management") {
                      navigate("/symptoms");
                    } else if (feature.title === "Sleep Optimisation") {
                      navigate("/sleep");
                    }
                  }}
                >
                  <CardHeader className="flex-shrink-0">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to <span className="gradient-text">Biohack Your Age</span>?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of women who are taking control of their aging process with evidence-based protocols.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              <Button 
                size="lg" 
                className="primary-gradient relative z-40 pointer-events-auto"
                onClick={() => {
                  console.log("Get Started Free clicked");
                  navigate("/auth");
                }}
              >
                Get Started Free
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="relative z-40 pointer-events-auto"
                onClick={() => {
                  console.log("View Premium Plans clicked");
                  navigate("/upgrade");
                }}
              >
                View Premium Plans
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
