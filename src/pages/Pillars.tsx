import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Zap, Sparkles, UserRound, Pill, Activity, ChevronDown, Target, Lightbulb, TestTube, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

const Pillars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  // Mock user assessment data - in real app this would come from user profile
  const userAssessments = {
    brain: { completed: false, lastTaken: null },
    body: { completed: true, lastTaken: "2024-01-15" },
    balance: { completed: false, lastTaken: null },
    beauty: { completed: true, lastTaken: "2024-01-10" }
  };

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
      biohacks: {
        training: [
          "Learning new languages (increases neuroplasticity by 30%)",
          "Playing musical instruments (enhances working memory)",
          "Dual N-back cognitive training games (2-3x/week)",
          "Speed reading practice (doubles reading efficiency)",
          "Memory palace technique for information retention",
          "Social engagement & meaningful relationships",
          "Reading fiction (improves empathy and cognitive flexibility)",
          "Meditation & mindfulness practices (8-12 minutes daily)",
          "Breathwork training (4-7-8 breathing, box breathing)",
          "Cold exposure training (2-11 minutes, 50-59°F)",
          "Morning sunlight exposure protocol (10-30 minutes)",
          "Quality sleep optimization (7-9 hours, consistent schedule)",
          "Regular aerobic exercise (Zone 2 cardio for BDNF)",
          "Intermittent fasting (14-16 hour windows)"
        ],
        therapy: [
          "Neurofeedback training sessions",
          "Transcranial direct current stimulation (tDCS)",
          "Cognitive behavioral therapy (CBT)",
          "Hyperbaric oxygen therapy (HBOT)",
          "Red light therapy for mitochondrial function",
          "Flotation tank sessions for deep relaxation",
          "Binaural beats therapy (40Hz gamma waves)",
          "Professional sleep optimization coaching",
          "Brain mapping and assessment",
          "IV therapy for cognitive enhancement"
        ]
      },
      supplements: [
        "Omega-3 fatty acids (EPA/DHA 1-3g daily)",
        "Magnesium glycinate (200-400mg before bed)", 
        "B-complex vitamins for neurotransmitter support",
        "Lion's Mane mushroom (500-1000mg)",
        "Rhodiola rosea for stress adaptation",
        "Phosphatidylserine for memory",
        "Alpha-GPC for acetylcholine support",
        "Creatine monohydrate (3-5g daily)"
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
      biohacks: {
        training: [
          "Zone 2 cardio training (180-age in BPM, 45-60 min)",
          "Strength training 3-4x/week (compound movements)",
          "High-intensity interval training (HIIT 2x/week)",
          "Mobility work & dynamic stretching (daily 15 min)",
          "Functional movement patterns training",
          "Progressive overload resistance training",
          "Plyometric exercises for power development",
          "Balance and proprioception training",
          "Walking 8,000-10,000 steps daily",
          "Morning movement routine (5-10 minutes)",
          "Active recovery protocols (yoga, swimming)",
          "Breathwork training for performance",
          "Movement quality assessment and correction",
          "Sport-specific skill development"
        ],
        therapy: [
          "Heat therapy: Sauna 4x/week (174-212°F, 20 min)",
          "Cold plunge therapy (50-59°F, 2-11 minutes)",
          "Deep tissue massage (weekly/bi-weekly)",
          "Cryotherapy sessions for recovery",
          "Compression therapy for circulation",
          "PEMF (Pulsed Electromagnetic Field) therapy",
          "Infrared sauna for muscle recovery",
          "Physical therapy movement assessment",
          "Myofascial release techniques",
          "Recovery monitoring (HRV, sleep tracking)",
          "IV hydration and nutrient therapy",
          "Hormone optimization therapy"
        ]
      },
      supplements: [
        "Whey or plant protein (20-40g post-workout)",
        "Creatine monohydrate (3-5g daily)",
        "Collagen peptides (10-20g for joints)",
        "Vitamin D3 + K2 (2000-4000 IU D3)",
        "Magnesium (glycinate or citrate, 200-400mg)",
        "Omega-3 fish oil (1-3g EPA/DHA)",
        "Electrolyte replacement (sodium, potassium)",
        "CoQ10 for mitochondrial support (100-200mg)"
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
      biohacks: {
        training: [
          "Morning sunlight exposure (10-30 min for cortisol regulation)",
          "Stress-reducing breathwork training (4-7-8, box breathing)",
          "Meditation & mindfulness practice (10-20 min daily)",
          "Hormonal cycle tracking & optimization",
          "Sleep hygiene protocol implementation",
          "Yoga & gentle movement practices",
          "Journaling for emotional regulation",
          "Gratitude practice (3 things daily)",
          "Social connection & community building",
          "Forest bathing & nature therapy sessions",
          "Digital detox training periods",
          "Mindful eating practices",
          "Stress response training techniques",
          "Emotional regulation skill building"
        ],
        therapy: [
          "Hormone testing & optimization protocols",
          "Stress management counseling & CBT",
          "Acupuncture for nervous system balance",
          "Professional massage therapy",
          "HRV training for autonomic balance",
          "Light therapy for circadian rhythm support",
          "Guided meditation & mindfulness training",
          "Biofeedback therapy sessions",
          "Adaptogenic herb protocol guidance",
          "Sleep therapy and optimization",
          "Nutritional therapy for mood balance",
          "Energy healing and reiki sessions"
        ]
      },
      supplements: [
        "Ashwagandha (300-600mg for cortisol regulation)",
        "Magnesium glycinate (200-400mg for relaxation)",
        "GABA (500-750mg for nervous system support)",
        "L-theanine (200mg for calm focus)",
        "Rhodiola rosea (200-400mg for stress adaptation)",
        "Phosphatidylserine (100mg for cortisol management)",
        "B-complex for neurotransmitter support",
        "Omega-3s for inflammation reduction"
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
      biohacks: {
        training: [
          "Daily skincare routine with active ingredients",
          "Facial massage & lymphatic drainage (5 min daily)",
          "Collagen-boosting nutrition protocols",
          "UV protection with broad-spectrum SPF 30+",
          "Hydration optimization (half body weight in oz)",
          "Sleep on silk pillowcases for skin/hair health",
          "Facial exercises for muscle tone (gua sha)",
          "Antioxidant-rich diet implementation",
          "Sugar reduction for collagen protection",
          "Cold water face rinses for circulation",
          "Dry brushing for lymphatic circulation",
          "Stress management for skin health",
          "Regular exercise for blood flow",
          "Beauty sleep optimization (7-9 hours)"
        ],
        therapy: [
          "Professional LED red light therapy (660-850nm)",
          "Microneedling for collagen induction",
          "Chemical peels (glycolic, lactic acid)",
          "Professional dermatological treatments",
          "Lymphatic drainage massage therapy",
          "Aesthetic consultation & treatment planning",
          "Nutrition counseling for skin health",
          "Hormone optimization for anti-aging",
          "IV therapy for beauty enhancement",
          "Professional skincare treatments",
          "Laser therapy for skin rejuvenation",
          "Platelet-rich plasma (PRP) treatments"
        ]
      },
      supplements: [
        "Collagen peptides (10-20g daily, types I & III)",
        "Vitamin C (1000mg for collagen synthesis)",
        "Hyaluronic acid (100-200mg for hydration)",
        "Biotin & zinc for hair/nail health",
        "Astaxanthin (4-8mg for UV protection)",
        "Marine omega-3s for skin inflammation",
        "NAD+ precursors for cellular repair",
        "Resveratrol for antioxidant protection"
      ],
      content: {
        overview: "Achieve radiant beauty from within using advanced anti-aging protocols, skincare innovations, and holistic beauty practices.",
        keyAreas: ["Skin Health", "Anti-Aging", "Cellular Regeneration", "Beauty Nutrition", "Aesthetic Optimization"]
      }
    }
  };

  // Protocol and therapy details for explanations
  const protocolDetails = {
    "Learning new languages (increases neuroplasticity by 30%)": "Start with 15-30 minutes daily using apps like Duolingo or Babbel. Focus on consistent daily practice rather than long sessions. Neuroplasticity benefits appear within 4-6 weeks.",
    "Zone 2 cardio training (180-age in BPM, 45-60 min)": "Exercise at an intensity where you can still hold a conversation. Use heart rate monitor to stay in zone. Builds mitochondria and improves fat oxidation.",
    "Morning sunlight exposure (10-30 min for cortisol regulation)": "Get outside within 30-60 minutes of waking. No sunglasses needed. Helps set circadian rhythm and optimizes cortisol levels throughout the day.",
    "Daily skincare routine with active ingredients": "Cleanse, apply vitamin C serum (morning), retinol (evening 2-3x/week), moisturize, and SPF daily. Start retinol slowly to build tolerance."
  };

  const therapyExplanations = {
    "Neurofeedback training sessions": "Non-invasive brain training using real-time monitoring of brain activity to improve focus, reduce anxiety, and optimize brain function.",
    "Transcranial direct current stimulation (tDCS)": "Gentle electrical stimulation applied to specific brain areas to enhance cognitive performance and mood.",
    "Hyperbaric oxygen therapy (HBOT)": "Breathing pure oxygen in a pressurized chamber to increase oxygen delivery to tissues and promote healing.",
    "PEMF (Pulsed Electromagnetic Field) therapy": "Low-frequency electromagnetic fields applied to the body to reduce inflammation and promote cellular repair.",
    "HRV training for autonomic balance": "Heart rate variability training using breathing techniques and biofeedback to improve stress resilience and recovery.",
    "Microneedling for collagen induction": "Minimally invasive treatment using tiny needles to stimulate natural collagen production and improve skin texture."
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

  const getMandatoryAssessments = (pillarKey: string) => {
    return pillars[pillarKey as keyof typeof pillars].symptomAssessments.map(assessment => ({
      ...assessment,
      pillar: pillarKey,
      completed: userAssessments[pillarKey as keyof typeof userAssessments]?.completed || false
    }));
  };

  const handle7DayPlan = (pillarKey: string) => {
    const mandatoryAssessments = getMandatoryAssessments(pillarKey);
    const incompleteAssessments = mandatoryAssessments.filter(assessment => !assessment.completed);
    
    if (incompleteAssessments.length > 0) {
      toast({
        title: "Complete Required Assessments",
        description: `You need to complete ${incompleteAssessments.length} assessment(s) before accessing your personalized 7-day plan.`,
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to 7-day plan page with pillar context
    navigate(`/7-day-plan/${pillarKey}`);
  };

  return (
    <TooltipProvider>
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

                   {/* Symptom Assessments & 7-Day Plan */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Required Assessments for Personalized Plan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pillars[selectedPillar as keyof typeof pillars].symptomAssessments.map((assessment, index) => {
                          const isCompleted = userAssessments[selectedPillar as keyof typeof userAssessments]?.completed;
                          return (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                  )}
                                  {assessment.title}
                                </CardTitle>
                                <CardDescription>{assessment.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                  <Badge variant="outline">{assessment.duration}</Badge>
                                  <Badge variant="outline">{assessment.questions} questions</Badge>
                                  {isCompleted && (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleAssessmentStart(selectedPillar, assessment.title)}
                                  className="w-full"
                                  variant={isCompleted ? "outline" : "default"}
                                >
                                  {isCompleted ? "Retake Assessment" : "Start Assessment"}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {/* 7-Day Plan Section */}
                    <div>
                      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Get Your Personalized 7-Day {pillars[selectedPillar as keyof typeof pillars].title} Plan
                          </CardTitle>
                          <CardDescription>
                            Based on your LIS (Longevity Impact Score) and assessment results, get a tailored 7-day protocol designed specifically for your {pillars[selectedPillar as keyof typeof pillars].title.toLowerCase()} optimization goals.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Daily personalized recommendations
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Progress tracking and adjustments
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Evidence-based protocols
                            </div>
                            <Button 
                              onClick={() => handle7DayPlan(selectedPillar)}
                              className="w-full"
                              size="lg"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Get My 7-Day Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-4">
                    {/* Training Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            {pillars[selectedPillar as keyof typeof pillars].title} Training Protocols
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Evidence-based training protocols you can implement yourself
                            </p>
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].biohacks.training.map((training, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {protocolDetails[training as keyof typeof protocolDetails] ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="text-left hover:text-primary underline decoration-dotted">
                                          {training}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>{training}</DialogTitle>
                                          <DialogDescription>
                                            {protocolDetails[training as keyof typeof protocolDetails]}
                                          </DialogDescription>
                                        </DialogHeader>
                                      </DialogContent>
                                    </Dialog>
                                  ) : (
                                    <span>{training}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Therapy Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            {pillars[selectedPillar as keyof typeof pillars].title} Therapies
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Professional therapies and advanced treatments
                            </p>
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].biohacks.therapy.map((therapy, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {therapyExplanations[therapy as keyof typeof therapyExplanations] ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="text-left hover:text-primary underline decoration-dotted">
                                          {therapy}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm">
                                        <p>{therapyExplanations[therapy as keyof typeof therapyExplanations]}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span>{therapy}</span>
                                  )}
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
                            {pillars[selectedPillar as keyof typeof pillars].title} Supplements
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Evidence-based supplements with recommended dosages
                            </p>
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].supplements.map((supplement, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  {supplement}
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
    </TooltipProvider>
  );
};

export default Pillars;