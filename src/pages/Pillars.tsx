import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Zap, Sparkles, UserRound, Pill, Activity, ChevronDown, Target, Lightbulb, TestTube } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

const Pillars = () => {
  const navigate = useNavigate();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const pillars = {
    brain: {
      title: "Brain",
      subtitle: "Get on top of brain fog and sharpen your mind",
      image: brainPillar,
      icon: Brain,
      color: "from-purple-500 to-indigo-600",
      symptomAssessments: [
        {
          title: "Brain Fog Assessment",
          description: "Evaluate mental clarity and cognitive function",
          duration: "5 minutes",
          questions: 12
        },
        {
          title: "Memory & Focus Analysis",
          description: "Assess concentration and memory performance",
          duration: "4 minutes",
          questions: 10
        }
      ],
      biohacks: [
        "Cold exposure therapy for cognitive enhancement",
        "Intermittent fasting for brain optimization",
        "Red light therapy for neural function",
        "Breathwork techniques for mental clarity"
      ],
      supplements: [
        "Nootropic stacks for cognitive enhancement",
        "Omega-3 fatty acids for brain health",
        "Magnesium for neurotransmitter support",
        "B-complex vitamins for mental energy"
      ],
      therapies: [
        "Neurofeedback training",
        "Cognitive behavioral therapy",
        "Meditation and mindfulness practices",
        "Sleep optimization protocols"
      ],
      content: {
        overview: "Optimize your cognitive function with evidence-based brain health protocols. From nootropics to neurofeedback, discover personalized strategies to enhance memory, focus, and mental clarity.",
        keyAreas: ["Cognitive Enhancement", "Memory Optimization", "Focus & Concentration", "Neuroprotection", "Mental Clarity"]
      }
    },
    body: {
      title: "Body",
      subtitle: "Keep your body agile and mobile by fighting the signs of ageing",
      image: bodyPillar,
      icon: Activity,
      color: "from-green-500 to-emerald-600",
      symptomAssessments: [
        {
          title: "Energy & Fatigue Assessment",
          description: "Evaluate physical energy levels and fatigue patterns",
          duration: "6 minutes",
          questions: 14
        },
        {
          title: "Mobility & Strength Analysis",
          description: "Assess physical function and movement quality",
          duration: "5 minutes",
          questions: 12
        }
      ],
      biohacks: [
        "High-intensity interval training protocols",
        "Strength training for longevity",
        "Movement optimization techniques",
        "Recovery and regeneration protocols"
      ],
      supplements: [
        "Protein powders for muscle maintenance",
        "Creatine for strength and power",
        "Collagen for joint health",
        "Electrolytes for hydration optimization"
      ],
      therapies: [
        "Physical therapy and movement screening",
        "Massage and soft tissue work",
        "Cryotherapy and heat therapy",
        "Functional movement assessment"
      ],
      content: {
        overview: "Maintain peak physical performance and combat aging with cutting-edge body optimization techniques. From strength training to metabolic enhancement.",
        keyAreas: ["Strength & Mobility", "Metabolic Health", "Recovery Optimization", "Body Composition", "Physical Resilience"]
      }
    },
    balance: {
      title: "Balance",
      subtitle: "Achieve inner calm and peace",
      image: balancePillar,
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
      symptomAssessments: [
        {
          title: "Stress & Anxiety Assessment",
          description: "Evaluate stress levels and emotional balance",
          duration: "6 minutes",
          questions: 14
        },
        {
          title: "Hormonal Balance Evaluation",
          description: "Assess hormonal health and mood stability",
          duration: "5 minutes",
          questions: 11
        }
      ],
      biohacks: [
        "Meditation and mindfulness practices",
        "Stress reduction breathing techniques",
        "Hormonal optimization protocols",
        "Circadian rhythm regulation"
      ],
      supplements: [
        "Adaptogenic herbs for stress management",
        "Magnesium for relaxation and sleep",
        "Ashwagandha for cortisol regulation",
        "GABA for nervous system support"
      ],
      therapies: [
        "Hormone replacement therapy consultation",
        "Stress management counseling",
        "Acupuncture for balance",
        "Yoga and movement therapy"
      ],
      content: {
        overview: "Find your equilibrium through stress management, hormonal optimization, and mindfulness practices. Create lasting balance in your daily life.",
        keyAreas: ["Stress Management", "Hormonal Balance", "Emotional Regulation", "Mindfulness", "Life Balance"]
      }
    },
    beauty: {
      title: "Beauty",
      subtitle: "Learn to glow from the outside in with the latest hacks to keep you looking younger than ever",
      image: beautyPillar,
      icon: Sparkles,
      color: "from-pink-500 to-rose-600",
      symptomAssessments: [
        {
          title: "Skin Health Assessment",
          description: "Evaluate skin condition and aging markers",
          duration: "4 minutes",
          questions: 9
        },
        {
          title: "Beauty & Aging Analysis",
          description: "Assess aesthetic concerns and anti-aging needs",
          duration: "6 minutes",
          questions: 13
        }
      ],
      biohacks: [
        "Red light therapy for skin rejuvenation",
        "Facial massage and lymphatic drainage",
        "Collagen synthesis optimization",
        "UV protection and antioxidant protocols"
      ],
      supplements: [
        "Collagen peptides for skin elasticity",
        "Vitamin C for antioxidant protection",
        "Hyaluronic acid for hydration",
        "Biotin and zinc for hair and nails"
      ],
      therapies: [
        "Professional skincare treatments",
        "Dermatological consultations",
        "Aesthetic procedures guidance",
        "Nutrition counseling for beauty"
      ],
      content: {
        overview: "Achieve radiant beauty from within using advanced anti-aging protocols, skincare innovations, and holistic beauty practices.",
        keyAreas: ["Skin Health", "Anti-Aging", "Cellular Regeneration", "Beauty Nutrition", "Aesthetic Optimization"]
      }
    }
  };

  const specializedSections = [
    {
      title: "Coaching",
      subtitle: "Personalized guidance for your biohacking journey",
      icon: UserRound,
      color: "from-orange-500 to-amber-600",
      route: "/coaching",
      description: "Get personalized coaching tailored to your unique biohacking goals and health data."
    },
    {
      title: "Supplements",
      subtitle: "Evidence-based supplement protocols",
      icon: Pill,
      color: "from-teal-500 to-green-600",
      route: "/supplements",
      description: "Discover scientifically-backed supplements organized by the four pillars of wellness."
    },
    {
      title: "Therapy",
      subtitle: "Advanced biohacking therapies and protocols",
      icon: Heart,
      color: "from-red-500 to-pink-600",
      route: "/therapies",
      description: "Explore cutting-edge therapies like red light, cold exposure, and HRV protocols."
    }
  ];

  const handlePillarClick = (pillarKey: string) => {
    setSelectedPillar(selectedPillar === pillarKey ? null : pillarKey);
  };

  const handleAssessmentStart = (pillarKey: string, assessmentTitle: string) => {
    // Navigate to a specialized assessment based on pillar and type
    navigate(`/assessment/${pillarKey}-${assessmentTitle.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              The Four Pillars of Biohacking
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering women to beat ageing through biohacking. Discover personalized protocols across Brain, Body, Balance, and Beauty.
            </p>
          </div>
        </div>
      </section>

      {/* Four Pillars Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {Object.entries(pillars).map(([key, pillar]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPillar === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePillarClick(key)}
              >
                <CardHeader className="text-center">
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={pillar.image} 
                      alt={`${pillar.title} pillar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <pillar.icon className="h-6 w-6" />
                    {pillar.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {pillar.subtitle}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Detailed Pillar View */}
          {selectedPillar && (
            <div className="mb-16">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    {React.createElement(pillars[selectedPillar as keyof typeof pillars].icon, { className: "h-8 w-8" })}
                    {pillars[selectedPillar as keyof typeof pillars].title} Overview
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {pillars[selectedPillar as keyof typeof pillars].content.overview}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Key Focus Areas */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Key Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {pillars[selectedPillar as keyof typeof pillars].content.keyAreas.map((area, index) => (
                        <Badge key={index} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Symptom Assessments */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Related Symptom Assessments
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {pillars[selectedPillar as keyof typeof pillars].symptomAssessments.map((assessment, index) => (
                        <Card key={index} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <CardTitle className="text-lg">{assessment.title}</CardTitle>
                            <CardDescription>{assessment.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between items-center mb-4">
                              <Badge variant="outline">{assessment.duration}</Badge>
                              <Badge variant="outline">{assessment.questions} questions</Badge>
                            </div>
                            <Button 
                              onClick={() => handleAssessmentStart(selectedPillar, assessment.title)}
                              className="w-full"
                            >
                              Start Assessment
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-4">
                    {/* Biohacks Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Explore {pillars[selectedPillar as keyof typeof pillars].title} Biohacks
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].biohacks.map((biohack, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  {biohack}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Supplements Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Pill className="h-4 w-4" />
                            Explore {pillars[selectedPillar as keyof typeof pillars].title} Supplements
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].supplements.map((supplement, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  {supplement}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Therapies Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            Explore {pillars[selectedPillar as keyof typeof pillars].title} Therapies
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].therapies.map((therapy, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  {therapy}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Specialized Sections */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Specialized Biohacking Areas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dive deeper into specialized areas with expert guidance, evidence-based protocols, and advanced therapies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specializedSections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(section.route)}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                      <section.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {section.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Explore {section.title}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pillars;