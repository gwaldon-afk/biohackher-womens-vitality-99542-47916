import heroImage from "@/assets/hero-image.jpg";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Activity, Heart, Moon, Thermometer, Zap, TrendingUp, Brain, Flame, Users, CheckCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import LISInputForm from "@/components/LISInputForm";
import { useState } from "react";
const Index = () => {
  const navigate = useNavigate();
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const handleScoreCalculated = () => {
    // Callback when LIS score is calculated
    console.log("LIS score calculated from homepage");
  };
  const features = [{
    icon: Activity,
    title: "Daily Longevity Inputs",
    description: "Track your biological age with our proprietary algorithm based on sleep, HRV, and lifestyle metrics."
  }, {
    icon: Thermometer,
    title: "Symptom Management",
    description: "Evidence-based interventions for hot flashes, sleep issues, and mood changes with Gold/Silver/Bronze ratings."
  }, {
    icon: Heart,
    title: "Cycle-Aware Coaching",
    description: "Personalised training and nutrition recommendations that adapt to your hormonal stage and cycle phase."
  }, {
    icon: Moon,
    title: "Sleep Optimisation",
    description: "Comprehensive sleep routines, red light protocols, and circadian rhythm management."
  }, {
    icon: Zap,
    title: "Biohacking Therapies",
    description: "Guided protocols for red light therapy, cold exposure, and HRV breathwork with built-in timers."
  }, {
    icon: TrendingUp,
    title: "Progress Reports",
    description: "30 and 90-day comprehensive reports with physician-ready summaries and trend analysis."
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden z-10">
        <div className="hero-gradient">
          <div className="container mx-auto px-4 py-16 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left z-20 relative">
                <h1 className="text-4xl lg:text-6xl font-albra font-bold mb-6 text-white">
                  Finally understand what's happening to your body after 35
                </h1>
                <p className="text-xl lg:text-2xl mb-6 text-white/90">
                  Stop guessing. Start knowing. Get science-backed answers to the changes you're experiencing.
                </p>
                <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
                  <Users className="h-5 w-5 text-white/80" />
                  <span className="text-white/80">Join 10,000+ women who found their answers</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start relative z-30">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 relative z-50 pointer-events-auto" onClick={() => {
                  console.log("Get my answers clicked");
                  navigate("/symptoms");
                }}>
                    Get My Answers Now
                  </Button>
                  <Button size="lg" variant="outline" className="bg-white text-primary border-white hover:bg-white/90 relative z-50 pointer-events-auto" onClick={() => {
                  console.log("View Dashboard clicked");
                  navigate("/dashboard");
                }}>
                    View Dashboard
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <img src={heroImage} alt="Wellness and mindfulness hero image" className="rounded-lg shadow-2xl w-full max-w-md mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Longevity Introduction Section */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Understanding <span className="gradient-text">Longevity</span>: Your Path to Living Well Longer
            </h2>
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              Our <span className="gradient-text">Biohacking Pillars</span>
            </h2>

            {/* Four Pillars Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  title: "Brain",
                  subtitle: "Get on top of brain fog and sharpen your mind",
                  image: brainPillar,
                  icon: Brain,
                  color: "from-primary to-primary-light",
                  path: "/pillars?pillar=brain"
                },
                {
                  title: "Body",
                  subtitle: "Keep your body agile and mobile by fighting the signs of ageing",
                  image: bodyPillar,
                  icon: Activity,
                  color: "from-primary-dark to-primary",
                  path: "/pillars?pillar=body"
                },
                {
                  title: "Balance",
                  subtitle: "Achieve inner calm and peace",
                  image: balancePillar,
                  icon: Zap,
                  color: "from-secondary to-secondary-light",
                  path: "/pillars?pillar=balance"
                },
                {
                  title: "Beauty",
                  subtitle: "Learn to glow from the outside in with the latest hacks to keep you looking younger than ever",
                  image: beautyPillar,
                  icon: Sparkles,
                  color: "from-secondary-dark to-secondary",
                  path: "/pillars?pillar=beauty"
                }
              ].map((pillar, index) => (
                <Card 
                  key={index} 
                  className="card-elevated hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                  onClick={() => navigate(pillar.path)}
                >
                  <div className="relative">
                    <img 
                      src={pillar.image} 
                      alt={`${pillar.title} pillar`} 
                      className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${pillar.color} opacity-70 group-hover:opacity-60 transition-opacity`} />
                    <div className="absolute top-3 left-3">
                      <pillar.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold">{pillar.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm line-clamp-2">
                      {pillar.subtitle}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="max-w-3xl mx-auto text-center mb-12">
              <p className="text-lg text-muted-foreground">
                Our comprehensive approach addresses the four foundational areas of women's longevity. 
                Each pillar represents a critical component of your health journey, from cognitive optimization 
                to physical vitality, emotional balance, and aesthetic wellness—all designed specifically for women's unique physiological needs.
              </p>
            </div>

            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { id: "healthspan", label: "Health Span V Life Span" },
                  { id: "biohacking", label: "What is Biohacking" },
                  { id: "women-focused", label: "Women Focused" },
                  { id: "research-gap", label: "The Women Research Gap" }
                ].map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? "" : topic.id)}
                    className={`p-4 rounded-lg border-4 transition-all duration-300 text-center font-medium ${
                      selectedTopic === topic.id
                        ? "bg-primary border-primary text-primary-foreground shadow-lg"
                        : "bg-background border-primary hover:border-primary hover:bg-primary/10"
                    }`}
                  >
                    {topic.label}
                  </button>
                ))}
              </div>

              {selectedTopic && (
                <div className="bg-muted/30 rounded-lg p-6 space-y-4 text-lg text-muted-foreground">
                  {selectedTopic === 'healthspan' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">Health Span vs Life Span</h3>
                      <p>
                        Longevity isn't just about adding years to your life—it's about adding <strong>life to your years</strong>. 
                        Our mission of "Live Well Longer" centers on optimizing your <em>healthspan</em>, the period of life 
                        spent in good health, free from chronic disease and age-related decline.
                      </p>
                      <p>
                        True longevity means maintaining vitality, cognitive function, and physical wellness as you age. 
                        It's about feeling energized at 50, thriving at 60, and remaining independent and vibrant well into your later years.
                      </p>
                    </div>
                  )}
                  
                  {selectedTopic === 'biohacking' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">What is Biohacking</h3>
                      <p>
                        This is where <strong>biohacking becomes essential</strong>. By understanding and optimizing your body's 
                        biological processes—from hormone balance and sleep cycles to cellular health and metabolic function—you 
                        can take control of how you age.
                      </p>
                      <p>
                        Biohacking provides the tools and knowledge to work <em>with</em> your 
                        body's natural systems, not against them. It's about using science-backed strategies to optimize 
                        your health and performance at the cellular level.
                      </p>
                    </div>
                  )}
                  
                  {selectedTopic === 'women-focused' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">Women Focused Approach</h3>
                      <p>
                        <strong>BiohackHer recognizes that women's biology isn't just "small men"</strong>—we have unique needs 
                        throughout our cycles, pregnancies, perimenopause, and beyond. Women's longevity strategies must account 
                        for estrogen fluctuations, different stress responses, and varying nutritional needs.
                      </p>
                      <p>
                        That's why we've dedicated our research and protocols specifically to women's physiology, creating a new field of 
                        women-centered longevity science that addresses your unique hormonal and metabolic needs.
                      </p>
                    </div>
                  )}
                  
                  {selectedTopic === 'research-gap' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-foreground">The Women Research Gap</h3>
                      <p>
                        There's a significant gap in longevity research. Traditionally, longevity and biohacking research has been 
                        overwhelmingly male-dominated—with studies primarily conducted on male subjects and protocols designed for 
                        male physiology.
                      </p>
                      <p>
                        In fact, until 1993, women were largely excluded from clinical trials, and even today, 
                        only about 38% of participants in medical research are women. This creates a dangerous knowledge gap when 
                        women's hormonal cycles, metabolism, and aging processes differ significantly from men's.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-6 mt-8">
              <p className="mb-4">
                <strong>Meet Azra Alagic, Founder & Longevity Expert</strong>
              </p>
              <p>
                With over a decade of experience in women's hormonal health and longevity research, Azra founded 
                BiohackHer after witnessing countless women struggle with the changes happening in their bodies 
                after 35. Her evidence-based approach combines cutting-edge biohacking protocols with personalized 
                interventions designed specifically for women's unique physiological needs throughout all life stages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Questions Section */}
      <section className="py-16 lg:py-20 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Sound Familiar? You're Not Alone.
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These are the questions thousands of women ask us. Get evidence-based answers, not generic advice.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[{
            question: "Why is my metabolism slowing down after 35?",
            answer: "Hormonal shifts affect insulin sensitivity and muscle mass. We help you understand and optimize your metabolic health.",
            icon: Flame,
            detailedAnswer: "After 35, several physiological changes impact your metabolism: declining estrogen affects insulin sensitivity, muscle mass decreases by 3-8% per decade, and your basal metabolic rate naturally slows. Additionally, lifestyle factors like stress and sleep quality become more impactful.",
            assessment: "Take our comprehensive Body Composition pillar assessment to understand your unique metabolic profile, including muscle mass, fat distribution, and hormonal influences on your metabolism.",
            planning: "Based on your results, we'll create a personalized plan that may include targeted nutrition protocols, strength training recommendations, and hormone optimization strategies tailored to your life stage.",
            action: "Start with our metabolic health tracker, implement evidence-based meal timing strategies, and access our library of metabolism-boosting protocols designed specifically for women over 35.",
            navigateTo: "/pillars"
          }, {
            question: "How do I prepare for perimenopause naturally?",
            answer: "Get personalized hormone-balancing protocols based on your unique symptoms and lifestyle.",
            icon: Heart,
            detailedAnswer: "Perimenopause can begin 8-10 years before menopause, with symptoms like irregular periods, mood changes, sleep disturbances, and weight gain. Natural preparation focuses on supporting your body's hormonal transition through targeted nutrition, lifestyle modifications, and stress management.",
            assessment: "Complete our Hormonal Balance assessment and symptom tracker to identify your current stage and primary concerns. Our comprehensive evaluation covers sleep patterns, stress levels, cycle changes, and physical symptoms.",
            planning: "Receive a personalized perimenopause preparation plan including hormone-supporting foods, targeted supplements, exercise recommendations, and stress management techniques based on your specific symptoms and lifestyle.",
            action: "Access our perimenopause toolkit with daily tracking features, evidence-based protocols for symptom management, and connection to healthcare providers who specialize in women's hormonal health.",
            navigateTo: "/symptoms"
          }, {
            question: "Why am I always tired despite sleeping 8 hours?",
            answer: "Sleep quality matters more than quantity. Discover what's disrupting your rest and how to fix it.",
            icon: Moon,
            detailedAnswer: "Quality sleep involves proper sleep architecture, including adequate deep sleep and REM phases. Factors like hormonal fluctuations, stress, room temperature, light exposure, and evening routines significantly impact sleep quality even when duration seems sufficient.",
            assessment: "Use our comprehensive sleep assessment to analyze your sleep environment, bedtime routines, stress levels, and potential disruptors. Track your sleep patterns and energy levels to identify specific issues.",
            planning: "Get a personalized sleep optimization plan that addresses your specific sleep disruptors, including room environment modifications, bedtime routine adjustments, and targeted interventions for your sleep stage.",
            action: "Implement our evidence-based sleep protocols, access guided sleep meditations, track your improvements with our sleep diary, and learn advanced biohacking techniques for optimal rest and recovery.",
            navigateTo: "/sleep"
          }, {
            question: "Is this brain fog normal or should I be worried?",
            answer: "Cognitive changes are real but treatable. Learn evidence-based strategies to clear mental fog.",
            icon: Brain,
            detailedAnswer: "Brain fog—characterized by difficulty concentrating, memory issues, and mental fatigue—is common during hormonal transitions but shouldn't be dismissed as 'normal aging.' It's often related to hormonal fluctuations, inflammation, stress, sleep quality, and nutritional deficiencies.",
            assessment: "Take our Brain & Cognitive Health assessment to evaluate your cognitive symptoms, identify potential triggers, and understand how factors like stress, sleep, and nutrition might be affecting your mental clarity.",
            planning: "Receive targeted recommendations for cognitive enhancement, including brain-supporting nutrients, stress reduction techniques, exercise protocols for neuroplasticity, and lifestyle modifications to support mental clarity.",
            action: "Access our cognitive health toolkit with brain training exercises, stress management techniques, nutritional protocols for brain health, and tracking tools to monitor your mental clarity improvements.",
            navigateTo: "/symptoms"
          }, {
            question: "What actually works to slow down aging?",
            answer: "Cut through the noise with proven biohacking protocols tailored for women's unique needs.",
            icon: Zap,
            detailedAnswer: "Effective anti-aging focuses on cellular health, hormonal optimization, inflammation reduction, and lifestyle factors that impact longevity. Evidence-based approaches include targeted nutrition, specific exercise protocols, stress management, sleep optimization, and strategic supplementation.",
            assessment: "Complete our comprehensive longevity assessment covering your current health markers, lifestyle factors, family history, and aging concerns. This helps identify your priority areas for anti-aging interventions.",
            planning: "Get a personalized anti-aging protocol that may include specific therapies like red light therapy, cold exposure, targeted supplementation, and lifestyle modifications based on the latest longevity research.",
            action: "Access our curated collection of anti-aging therapies, track your biological age markers, implement proven longevity protocols, and connect with practitioners who specialize in age optimization for women.",
            navigateTo: "/therapies"
          }].map((item, index) => <Card key={index} className="card-elevated hover:shadow-lg transition-all cursor-pointer p-6 bg-white border-l-4 border-l-primary" onClick={() => {
            setSelectedQuestion(item);
            setIsModalOpen(true);
          }}>
                <CardHeader className="pb-4">
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <CardTitle className="text-lg font-semibold leading-tight">
                    "{item.question}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">{item.answer}</p>
                  <div className="flex items-center text-primary font-medium text-sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Get Your Answer →
                  </div>
                </CardContent>
              </Card>)}
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
              return <LISInputForm key={index} onScoreCalculated={handleScoreCalculated}>
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
                  </LISInputForm>;
            }
            return <Card key={index} className="card-elevated hover:shadow-lg transition-shadow cursor-pointer h-64 flex flex-col" onClick={() => {
              console.log(`${feature.title} card clicked`);
              if (feature.title === "Symptom Management") {
                navigate("/symptoms");
              } else if (feature.title === "Sleep Optimisation") {
                navigate("/sleep");
              } else if (feature.title === "Cycle-Aware Coaching") {
                navigate("/coaching");
              } else if (feature.title === "Biohacking Therapies") {
                navigate("/therapies");
              } else if (feature.title === "Progress Reports") {
                navigate("/reports");
              }
            }}>
                  <CardHeader className="flex-shrink-0">
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>;
          })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-muted/30 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Stop Wondering. Start <span className="gradient-text">Knowing</span>.
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Get personalized, science-backed answers to what's happening in your body. No more guesswork.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
              <Button size="lg" className="primary-gradient relative z-40 pointer-events-auto" onClick={() => {
              console.log("Get My Personalized Plan clicked");
              navigate("/auth");
            }}>
                Get My Personalized Plan
              </Button>
              <Button size="lg" variant="outline" className="relative z-40 pointer-events-auto" onClick={() => {
              console.log("View Premium Plans clicked");
              navigate("/upgrade");
            }}>
                View Premium Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Answer Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedQuestion && <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <selectedQuestion.icon className="h-8 w-8 text-primary" />
                  <DialogTitle className="text-xl font-bold">
                    {selectedQuestion.question}
                  </DialogTitle>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Detailed Answer */}
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3">The Science Behind It</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedQuestion.detailedAnswer}
                  </p>
                </div>
                
                <Separator />
                
                {/* How We Help - Three Pillars */}
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">1</span>
                      </div>
                      <h4 className="font-semibold text-primary">Assess</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuestion.assessment}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">2</span>
                      </div>
                      <h4 className="font-semibold text-primary">Plan</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuestion.planning}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">3</span>
                      </div>
                      <h4 className="font-semibold text-primary">Act</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedQuestion.action}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Call to Action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button onClick={() => {
                setIsModalOpen(false);
                navigate("/symptoms");
              }} className="flex-1">
                    Start Your Assessments
                  </Button>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Close
                  </Button>
                </div>
              </div>
            </>}
        </DialogContent>
      </Dialog>
    </div>;
};
export default Index;