import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Users, FileText, Zap, Star } from "lucide-react";
import Navigation from "@/components/Navigation";

const Upgrade = () => {
  const features = {
    free: [
      "Basic dashboard & metrics",
      "Onboarding assessment", 
      "Limited symptom tracking",
      "Basic sleep routines",
      "Community access"
    ],
    premium: [
      "Advanced biohackher age calculation",
      "Complete therapy protocols with timers",
      "Detailed symptom → action mapping", 
      "Comprehensive nutrition tracking",
      "Cycle-aware coaching",
      "30 & 90-day PDF reports",
      "Priority customer support",
      "Monthly group coaching calls"
    ],
    cohorts: [
      "Everything in Premium",
      "Live 8-week transformation program",
      "Weekly group coaching sessions", 
      "Peer accountability partners",
      "Exclusive biohacking masterclasses",
      "Direct access to longevity experts",
      "Advanced lab interpretation",
      "Private community forum"
    ]
  };

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Get started with basic biohacking tools",
      features: features.free,
      buttonText: "Current Plan",
      buttonVariant: "outline" as const,
      popular: false
    },
    {
      name: "Premium",
      price: "$29",
      period: "month", 
      description: "Full access to all biohacking protocols and reports",
      features: features.premium,
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
      popular: true,
      stripeLink: "https://buy.stripe.com/premium-link" // Replace with actual Stripe link
    },
    {
      name: "Cohorts",
      price: "$197",
      period: "8 weeks",
      description: "Guided transformation with expert coaching & community",
      features: features.cohorts,
      buttonText: "Join Next Cohort",
      buttonVariant: "default" as const,
      popular: false,
      stripeLink: "https://buy.stripe.com/cohorts-link" // Replace with actual Stripe link
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      age: "42",
      quote: "My Biohackher Age went from 48 to 39 in just 3 months. The cycle-aware training completely transformed my energy levels.",
      program: "Premium"
    },
    {
      name: "Jennifer L.", 
      age: "38",
      quote: "The cohort program gave me the accountability I needed. Having other women on the same journey made all the difference.",
      program: "Cohorts"
    },
    {
      name: "Michelle R.",
      age: "45", 
      quote: "Finally, evidence-based solutions for perimenopause. The red light therapy protocol alone was worth the investment.",
      program: "Premium"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">
            Upgrade Your Longevity Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock advanced biohacking protocols, personalized coaching, and comprehensive tracking 
            to optimize your healthspan and reverse biological aging.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.name === 'Premium' && <Crown className="h-5 w-5 text-primary" />}
                  {plan.name === 'Cohorts' && <Users className="h-5 w-5 text-secondary" />}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                
                <CardDescription className="text-center">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                {plan.stripeLink ? (
                  <Button 
                    className={`w-full ${plan.popular ? 'primary-gradient' : ''}`}
                    variant={plan.buttonVariant}
                    onClick={() => window.open(plan.stripeLink, '_blank')}
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button 
                    className="w-full"
                    variant={plan.buttonVariant}
                    disabled
                  >
                    {plan.buttonText}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Highlights */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What Makes Biohackher Different?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center p-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Evidence-Based</h3>
              <p className="text-sm text-muted-foreground">
                Gold, Silver, Bronze evidence ratings for every recommendation
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Zap className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Cycle-Aware</h3>
              <p className="text-sm text-muted-foreground">
                Protocols that adapt to your hormonal stage and cycle phase
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Biohackher Age</h3>
              <p className="text-sm text-muted-foreground">
                Track your biological age with our proprietary algorithm
              </p>
            </Card>
            
            <Card className="text-center p-6">
              <Users className="h-12 w-12 text-secondary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with like-minded women on similar journeys
              </p>
            </Card>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Success Stories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">Age {testimonial.age}</p>
                  </div>
                  <Badge variant="outline">{testimonial.program}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your Premium subscription at any time. Cohort programs are non-refundable once started.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Do you offer medical advice?</h3>
                <p className="text-sm text-muted-foreground">
                  Biohackher provides educational content and wellness recommendations. Always consult your healthcare provider for medical advice.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">When does the next cohort start?</h3>
                <p className="text-sm text-muted-foreground">
                  Cohorts launch quarterly. The next 8-week program starts April 1st, 2024. Spaces are limited to 25 participants.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;