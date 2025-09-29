import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Zap, Sparkles, UserRound, Pill, Activity, TestTube, Calendar, AlertTriangle, CheckCircle, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAssessmentCompletions } from "@/hooks/useAssessmentCompletions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

const Pillars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { completions, loading } = useAssessmentCompletions();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { t } = useTranslation();

  // Pillars data with biohacks, therapies, supplements, etc.
  const pillars = {
    brain: {
      title: "Brain",
      subtitle: "Get on top of brain fog and sharpen your mind",
      image: brainPillar,
      icon: Brain,
      color: "from-primary to-primary-light",
      biohacks: {
        training: {
          beginner: ["Morning meditation (5-10 mins)", "Deep breathing exercises", "Regular sleep schedule"],
          intermediate: ["Cold shower therapy", "Intermittent fasting", "Brain training games"],
          advanced: ["Wim Hof breathing", "Extended fasting", "Advanced meditation techniques"]
        },
        therapies: {
          gold: ["Neurofeedback therapy", "TMS (Transcranial Magnetic Stimulation)"],
          silver: ["Light therapy", "Float tank sessions"],
          bronze: ["Aromatherapy", "Music therapy"]
        },
        supplements: {
          essential: [
            { name: "Omega-3", dosage: "1000mg EPA/DHA", timing: "With breakfast" },
            { name: "Magnesium", dosage: "400mg", timing: "Before bed" }
          ],
          beneficial: [
            { name: "Lions Mane", dosage: "500mg", timing: "Morning with food" }
          ],
          optional: [
            { name: "Nootropic blend", dosage: "As directed", timing: "Before mental tasks" }
          ]
        }
      }
    },
    body: {
      title: "Body",
      subtitle: "Keep your body agile and mobile by fighting the signs of ageing",
      image: bodyPillar,
      icon: Activity,
      color: "from-green-500 to-emerald-600",
      biohacks: {
        training: {
          beginner: ["Walking 8,000-10,000 steps daily", "Morning movement routine (5-10 minutes)", "Mobility work & dynamic stretching (daily 15 min)"],
          intermediate: ["Zone 2 cardio training (180-age in BPM, 45-60 min)", "Strength training 3-4x/week (compound movements)", "Progressive overload resistance training"],
          advanced: ["High-intensity interval training (HIIT 2x/week)", "Plyometric exercises for power development", "Balance and proprioception training"]
        },
        therapies: {
          gold: ["Heat therapy: Sauna 4x/week (79-100°C, 20 min)", "Cryotherapy sessions for recovery"],
          silver: ["Deep tissue massage (weekly/bi-weekly)", "Physical therapy movement assessment"],
          bronze: ["Myofascial release techniques", "Recovery monitoring (HRV, sleep tracking)"]
        },
        supplements: {
          essential: [
            { name: "Whey or plant protein", dosage: "20-40g post-workout", timing: "Post workout" },
            { name: "Creatine monohydrate", dosage: "3-5g daily", timing: "Anytime" }
          ],
          beneficial: [
            { name: "Collagen peptides", dosage: "10-20g for joints", timing: "Morning or evening" }
          ],
          optional: [
            { name: "CoQ10", dosage: "100-200mg", timing: "With meals" }
          ]
        }
      }
    },
    balance: {
      title: "Balance",
      subtitle: "Achieve inner calm and peace",
      image: balancePillar,
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
      biohacks: {
        training: {
          beginner: ["Morning sunlight exposure (10-30 min for cortisol regulation)", "Sleep hygiene protocol implementation", "Gratitude practice (3 things daily)"],
          intermediate: ["Stress-reducing breathwork training (4-7-8, box breathing)", "Meditation & mindfulness practice (10-20 min daily)", "Yoga & gentle movement practices"],
          advanced: ["Hormonal cycle tracking & optimization", "Forest bathing & nature therapy sessions", "Stress response training techniques"]
        },
        therapies: {
          gold: ["Hormone testing & optimization protocols", "Biofeedback therapy sessions"],
          silver: ["Stress management counseling & CBT", "HRV training for autonomic balance"],
          bronze: ["Professional massage therapy", "Acupuncture for nervous system balance"]
        },
        supplements: {
          essential: [
            { name: "Ashwagandha", dosage: "300-600mg for cortisol regulation", timing: "With meals" },
            { name: "Magnesium glycinate", dosage: "200-400mg for relaxation", timing: "Before bed" }
          ],
          beneficial: [
            { name: "GABA", dosage: "500-750mg for nervous system support", timing: "Before bed" }
          ],
          optional: [
            { name: "L-theanine", dosage: "200mg for calm focus", timing: "Anytime" }
          ]
        }
      }
    },
    beauty: {
      title: "Beauty",
      subtitle: "Learn to glow from the outside in with the latest hacks to keep you looking younger than ever",
      image: beautyPillar,
      icon: Sparkles,
      color: "from-pink-500 to-rose-600",
      biohacks: {
        training: {
          beginner: ["UV protection with broad-spectrum SPF 30+", "Hydration optimization (half body weight in oz)", "Beauty sleep optimization (7-9 hours)"],
          intermediate: ["Facial massage & lymphatic drainage (5 min daily)", "Collagen-boosting nutrition protocols", "Antioxidant-rich diet implementation"],
          advanced: ["Facial exercises for muscle tone (gua sha)", "Cold water face rinses for circulation", "Dry brushing for lymphatic circulation"]
        },
        therapies: {
          gold: ["Professional LED red light therapy (660-850nm)", "Microneedling for collagen induction"],
          silver: ["Chemical peels (glycolic, lactic acid)", "Lymphatic drainage massage therapy"],
          bronze: ["Professional dermatological treatments", "Aesthetic consultation & treatment planning"]
        },
        supplements: {
          essential: [
            { name: "Collagen peptides", dosage: "10-20g daily, types I & III", timing: "Morning or evening" },
            { name: "Vitamin C", dosage: "1000mg for collagen synthesis", timing: "With meals" }
          ],
          beneficial: [
            { name: "Hyaluronic acid", dosage: "100-200mg for hydration", timing: "Anytime" }
          ],
          optional: [
            { name: "Astaxanthin", dosage: "4-8mg for UV protection", timing: "With fats for absorption" }
          ]
        }
      }
    }
  };

  // Protocol details for tooltips
  const protocolDetails = {
    "Morning meditation (5-10 mins)": "Start your day with focused breathing and mindfulness to improve cognitive function and reduce stress.",
    "Deep breathing exercises": "Practice 4-7-8 breathing or box breathing to activate the parasympathetic nervous system.",
    "Cold shower therapy": "Start with 30 seconds of cold water exposure and gradually increase to improve circulation and alertness.",
    "Intermittent fasting": "Limit eating to a 8-10 hour window to improve metabolic health and brain function.",
    "Brain training games": "Use apps like Lumosity or BrainHQ to challenge your cognitive skills regularly.",
    "Wim Hof breathing": "Advanced breathing technique to increase oxygenation and stress resilience.",
    "Extended fasting": "Prolonged fasting periods under supervision to promote autophagy and cellular repair.",
    "Advanced meditation techniques": "Includes transcendental meditation, vipassana, or other deep mindfulness practices.",
    "Neurofeedback therapy": "Non-invasive brain training using real-time monitoring of brain activity to improve focus and reduce anxiety.",
    "TMS (Transcranial Magnetic Stimulation)": "Uses magnetic fields to stimulate nerve cells in the brain to improve mood and cognitive function.",
    "Light therapy": "Exposure to specific wavelengths of light to regulate circadian rhythms and improve mood.",
    "Float tank sessions": "Sensory deprivation therapy to promote deep relaxation and stress reduction.",
    "Aromatherapy": "Use of essential oils to enhance psychological and physical well-being.",
    "Music therapy": "Therapeutic use of music to address emotional and cognitive needs.",
    "Walking 8,000-10,000 steps daily": "Regular walking to improve cardiovascular health and mobility.",
    "Morning movement routine (5-10 minutes)": "Gentle stretching and mobility exercises to start the day energized.",
    "Mobility work & dynamic stretching (daily 15 min)": "Focus on joint health and flexibility to prevent injury.",
    "Zone 2 cardio training (180-age in BPM, 45-60 min)": "Sustained moderate-intensity cardio to improve mitochondrial function.",
    "Strength training 3-4x/week (compound movements)": "Build muscle and bone density with multi-joint exercises.",
    "Progressive overload resistance training": "Gradually increase training intensity to stimulate adaptation.",
    "High-intensity interval training (HIIT 2x/week)": "Short bursts of intense exercise to improve cardiovascular fitness.",
    "Plyometric exercises for power development": "Explosive movements to enhance muscular power and coordination.",
    "Balance and proprioception training": "Exercises to improve body awareness and prevent falls.",
    "Heat therapy: Sauna 4x/week (79-100°C, 20 min)": "Regular sauna use to promote cardiovascular health and detoxification.",
    "Cryotherapy sessions for recovery": "Exposure to extreme cold to reduce inflammation and speed recovery.",
    "Deep tissue massage (weekly/bi-weekly)": "Massage targeting deeper muscle layers to relieve tension.",
    "Physical therapy movement assessment": "Professional evaluation to correct movement dysfunctions.",
    "Myofascial release techniques": "Manual therapy to release fascial restrictions and improve mobility.",
    "Recovery monitoring (HRV, sleep tracking)": "Use of devices to optimize recovery and training load.",
    "Hormone testing & optimization protocols": "Assessment and treatment of hormonal imbalances for better health.",
    "Stress management counseling & CBT": "Therapeutic approaches to manage stress and anxiety.",
    "Acupuncture for nervous system balance": "Traditional Chinese medicine technique to promote nervous system health.",
    "Professional massage therapy": "Massage to reduce muscle tension and promote relaxation.",
    "HRV training for autonomic balance": "Biofeedback techniques to improve heart rate variability and stress resilience.",
    "Light therapy for circadian rhythm support": "Use of light exposure to regulate sleep-wake cycles.",
    "Guided meditation & mindfulness training": "Structured programs to develop mindfulness skills.",
    "Biofeedback therapy sessions": "Training to control physiological functions for health benefits.",
    "Adaptogenic herb protocol guidance": "Use of herbs like ashwagandha and rhodiola to support stress adaptation.",
    "Sleep therapy and optimization": "Interventions to improve sleep quality and duration.",
    "Nutritional therapy for mood balance": "Dietary strategies to support mental health.",
    "Professional LED red light therapy (660-850nm)": "Light therapy to stimulate collagen and reduce inflammation.",
    "Microneedling for collagen induction": "Skin treatment to promote collagen production.",
    "Chemical peels (glycolic, lactic acid)": "Exfoliation treatments to improve skin texture.",
    "Lymphatic drainage massage therapy": "Massage to promote lymph flow and reduce puffiness.",
    "Professional dermatological treatments": "Medical skin treatments for various conditions.",
    "Aesthetic consultation & treatment planning": "Personalized skin care planning with professionals.",
    "Nutrition counseling for skin health": "Dietary advice to support skin appearance.",
    "Hormone optimization for anti-aging": "Balancing hormones to slow aging effects.",
    "Collagen peptides": "Supports joint and skin health by providing collagen building blocks.",
    "Vitamin C": "Essential for collagen synthesis and antioxidant protection.",
    "Hyaluronic acid": "Hydrates skin by retaining moisture.",
    "Astaxanthin": "Powerful antioxidant protecting skin from UV damage."
  };

  // Handler to add supplement to cart
  const handleAddToCart = (supplement: { name: string; dosage: string; timing: string }) => {
    const product = {
      id: supplement.name.toLowerCase().replace(/\s+/g, "-"),
      name: supplement.name,
      price: 29.99, // Placeholder price
      image: "/placeholder.svg",
      brand: "BiohackHer",
      dosage: supplement.dosage,
      description: `Recommended dosage: ${supplement.dosage}, Timing: ${supplement.timing}`
    };
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };

  // Effect to auto-select pillar from URL param if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pillarParam = urlParams.get("pillar");
    if (pillarParam && Object.keys(pillars).includes(pillarParam)) {
      setSelectedPillar(pillarParam);
    }
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-4">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
                {t("pillars.title")}
              </h1>
              <p className="text-lg text-foreground font-medium max-w-3xl mx-auto">
                Understanding your health through four essential pillars gives you a complete picture of your wellbeing. Each pillar addresses a key area that impacts how you look, feel, and function every day. Take targeted assessments to uncover personalized insights and create your roadmap to optimal health.
              </p>
            </div>
          </div>
        </section>

        {/* Four Pillars Grid */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {Object.entries(pillars).map(([key, pillar]) => (
                <Card
                  key={key}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPillar === key ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => {
                    setSelectedPillar(key);
                    setSelectedSection(null); // Reset dropdown sections when switching pillars
                  }}
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
                    <CardDescription className="text-center">{pillar.subtitle}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Detailed Pillar View */}
            {selectedPillar && (
              <div className="mb-16">
                <Card className="card-elevated">
                  <CardContent className="p-8">
                    {/* Pillar Header */}
                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        {React.createElement(pillars[selectedPillar as keyof typeof pillars].icon, {
                          className: "h-12 w-12 text-primary"
                        })}
                        <h2 className="text-3xl font-bold">{pillars[selectedPillar as keyof typeof pillars].title} Pillar</h2>
                      </div>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {pillars[selectedPillar as keyof typeof pillars].subtitle}
                      </p>
                    </div>

                    {/* Horizontal Section Buttons */}
                    <div className="space-y-6">
                      {/* Button Row */}
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant={selectedSection === "training" ? "default" : "outline"}
                          onClick={() => setSelectedSection(selectedSection === "training" ? null : "training")}
                          className="flex-1 max-w-xs"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Training
                        </Button>
                        <Button
                          variant={selectedSection === "therapy" ? "default" : "outline"}
                          onClick={() => setSelectedSection(selectedSection === "therapy" ? null : "therapy")}
                          className="flex-1 max-w-xs"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          Therapies
                        </Button>
                        <Button
                          variant={selectedSection === "supplements" ? "default" : "outline"}
                          onClick={() => setSelectedSection(selectedSection === "supplements" ? null : "supplements")}
                          className="flex-1 max-w-xs"
                        >
                          <Pill className="h-4 w-4 mr-2" />
                          Supplements
                        </Button>
                      </div>

                      {/* Content Display with Close Button */}
                      {selectedSection && (
                        <Card className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedSection(null)}
                            className="absolute top-4 right-4 z-10"
                          >
                            ×
                          </Button>
                          <CardContent className="pt-6">
                            {selectedSection === "training" && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Evidence-based training protocols you can implement yourself
                                </p>

                                {/* Beginner Level */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    Beginner (Start Here)
                                  </h4>
                                  <ul className="space-y-2 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.training.beginner.map(
                                      (training: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                          {protocolDetails[training as keyof typeof protocolDetails] ? (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button className="text-left hover:text-primary underline decoration-dotted">
                                                  {training}
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-md">
                                                <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          ) : (
                                            <span>{training}</span>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                {/* Intermediate Level */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    Intermediate (6+ Weeks Experience)
                                  </h4>
                                  <ul className="space-y-2 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.training.intermediate.map(
                                      (training: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                          {protocolDetails[training as keyof typeof protocolDetails] ? (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button className="text-left hover:text-primary underline decoration-dotted">
                                                  {training}
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-md">
                                                <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          ) : (
                                            <span>{training}</span>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                {/* Advanced Level */}
                                <div>
                                  <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    Advanced (3+ Months Experience)
                                  </h4>
                                  <ul className="space-y-2 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.training.advanced.map(
                                      (training: string, index: number) => (
                                        <li key={index} className="flex items-center gap-2">
                                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                          {protocolDetails[training as keyof typeof protocolDetails] ? (
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <button className="text-left hover:text-primary underline decoration-dotted">
                                                  {training}
                                                </button>
                                              </TooltipTrigger>
                                              <TooltipContent className="max-w-md">
                                                <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          ) : (
                                            <span>{training}</span>
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {selectedSection === "therapy" && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Professional therapies and advanced treatments
                                </p>

                                {/* Gold Tier */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    Gold Tier (Highest Impact)
                                  </h4>
                                  <ul className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.therapies.gold.map(
                                      (therapy: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            {therapy}
                                          </div>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                {/* Silver Tier */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    Silver Tier (Moderate Impact)
                                  </h4>
                                  <ul className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.therapies.silver.map(
                                      (therapy: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-gray-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            {therapy}
                                          </div>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>

                                {/* Bronze Tier */}
                                <div>
                                  <h4 className="font-semibold text-orange-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                    Bronze Tier (Supportive)
                                  </h4>
                                  <ul className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.therapies.bronze.map(
                                      (therapy: string, index: number) => (
                                        <li key={index} className="flex items-start gap-3">
                                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            {therapy}
                                          </div>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              </div>
                            )}

                            {selectedSection === "supplements" && (
                              <div>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Evidence-based supplements with recommended dosages
                                </p>

                                {/* Essential Supplements */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    Essential (Start Here)
                                  </h4>
                                  <div className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.supplements.essential.map(
                                      (supplement: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                                        >
                                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h5 className="font-medium text-green-800">{supplement.name}</h5>
                                                <p className="text-sm text-green-700">{supplement.dosage}</p>
                                                <p className="text-xs text-green-600 mt-1">{supplement.timing}</p>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-300 text-green-700 hover:bg-green-100"
                                                onClick={() => handleAddToCart(supplement)}
                                              >
                                                <ShoppingCart className="h-3 w-3 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Beneficial Supplements */}
                                <div className="mb-6">
                                  <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    Beneficial (Add After 4 Weeks)
                                  </h4>
                                  <div className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.supplements.beneficial.map(
                                      (supplement: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                                        >
                                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h5 className="font-medium text-blue-800">{supplement.name}</h5>
                                                <p className="text-sm text-blue-700">{supplement.dosage}</p>
                                                <p className="text-xs text-blue-600 mt-1">{supplement.timing}</p>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                                                onClick={() => handleAddToCart(supplement)}
                                              >
                                                <ShoppingCart className="h-3 w-3 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Optional Supplements */}
                                <div>
                                  <h4 className="font-semibold text-purple-600 mb-3 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    Optional (Advanced Users)
                                  </h4>
                                  <div className="space-y-3 ml-5">
                                    {pillars[selectedPillar as keyof typeof pillars].biohacks.supplements.optional.map(
                                      (supplement: any, index: number) => (
                                        <div
                                          key={index}
                                          className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg"
                                        >
                                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                          <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                              <div>
                                                <h5 className="font-medium text-purple-800">{supplement.name}</h5>
                                                <p className="text-sm text-purple-700">{supplement.dosage}</p>
                                                <p className="text-xs text-purple-600 mt-1">{supplement.timing}</p>
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-purple-300 text-purple-700 hover:bg-purple-100"
                                                onClick={() => handleAddToCart(supplement)}
                                              >
                                                <ShoppingCart className="h-3 w-3 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
};

export default Pillars;
