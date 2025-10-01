import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Brain, Heart, Sparkles, Target, TrendingUp, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";

interface Question {
  id: string;
  question: string;
  dimension: string;
  icon: any;
  options: { value: number; label: string }[];
}

const questions: Question[] = [
  {
    id: "q1",
    question: "How do you view aging?",
    dimension: "Belief About Aging",
    icon: TrendingUp,
    options: [
      { value: 1, label: "It's inevitable decline - nothing I can do about it" },
      { value: 2, label: "I'm curious, but skeptical about influencing it" },
      { value: 3, label: "I believe I can influence how I age with the right approach" },
      { value: 4, label: "I'm actively working to optimize my aging process" },
    ],
  },
  {
    id: "q2",
    question: "When you think about yourself at 70, what do you envision?",
    dimension: "Future Self Vision",
    icon: Sparkles,
    options: [
      { value: 1, label: "I try not to think about it - it worries me" },
      { value: 2, label: "Slowing down, maybe dealing with health issues" },
      { value: 3, label: "Still active and independent" },
      { value: 4, label: "Thriving, traveling, and pursuing new adventures" },
    ],
  },
  {
    id: "q3",
    question: "How familiar are you with longevity science?",
    dimension: "Awareness",
    icon: Brain,
    options: [
      { value: 1, label: "Not familiar at all - this is all new to me" },
      { value: 2, label: "I've heard some things but don't really understand it" },
      { value: 3, label: "I understand the basics and am curious to learn more" },
      { value: 4, label: "I actively follow longevity research and apply it" },
    ],
  },
  {
    id: "q4",
    question: "Do you believe you have control over your health outcomes?",
    dimension: "Personal Agency",
    icon: Target,
    options: [
      { value: 1, label: "Not really - genetics and luck determine most things" },
      { value: 2, label: "Some control, but many things are out of my hands" },
      { value: 3, label: "Yes, I believe my choices significantly impact my health" },
      { value: 4, label: "Absolutely - I'm empowered to shape my health trajectory" },
    ],
  },
  {
    id: "q5",
    question: "When you encounter new health information, what's your first reaction?",
    dimension: "Openness to Learning",
    icon: Heart,
    options: [
      { value: 1, label: "Skeptical - there's too much conflicting information" },
      { value: 2, label: "Overwhelmed - I don't know what to trust" },
      { value: 3, label: "Curious - I like to research and understand it" },
      { value: 4, label: "Excited - I love discovering new approaches" },
    ],
  },
  {
    id: "q6",
    question: "How willing are you to experiment with new health practices?",
    dimension: "Exploration Readiness",
    icon: Zap,
    options: [
      { value: 1, label: "Not willing - I prefer sticking to what I know" },
      { value: 2, label: "Maybe, if it's proven and safe" },
      { value: 3, label: "Open to trying evidence-based approaches" },
      { value: 4, label: "Eager to explore and test what works for me" },
    ],
  },
  {
    id: "q7",
    question: "If you started a new health routine, what would most likely happen?",
    dimension: "Commitment Pattern",
    icon: Target,
    options: [
      { value: 1, label: "I'd probably give up within a few days" },
      { value: 2, label: "I'd try for a week or two, then lose momentum" },
      { value: 3, label: "I'd stick with it for a month or more" },
      { value: 4, label: "I'd commit fully and make it part of my lifestyle" },
    ],
  },
  {
    id: "q8",
    question: "What best describes your current mindset about making health changes?",
    dimension: "Readiness to Act",
    icon: TrendingUp,
    options: [
      { value: 1, label: "I'm not ready - too much else going on right now" },
      { value: 2, label: "I'm thinking about it, but haven't started" },
      { value: 3, label: "I'm ready to start with some guidance" },
      { value: 4, label: "I'm all in - just need the right roadmap" },
    ],
  },
  {
    id: "q9",
    question: "Do you believe you deserve to invest in your health and longevity?",
    dimension: "Self-Worth",
    icon: Heart,
    options: [
      { value: 1, label: "Not really - others' needs come first" },
      { value: 2, label: "Sometimes, but I feel guilty prioritizing myself" },
      { value: 3, label: "Yes, I'm learning to prioritize my wellbeing" },
      { value: 4, label: "Absolutely - my health is a top priority" },
    ],
  },
  {
    id: "q10",
    question: "When you see others thriving in their 50s, 60s, 70s, what do you think?",
    dimension: "Possibility Mindset",
    icon: Sparkles,
    options: [
      { value: 1, label: "That's not realistic for most people" },
      { value: 2, label: "Good for them, but probably won't happen for me" },
      { value: 3, label: "That could be me with the right approach" },
      { value: 4, label: "That WILL be me - I'm making it happen" },
    ],
  },
  {
    id: "q11",
    question: "How important is it for you to understand the 'why' behind health recommendations?",
    dimension: "Scientific Curiosity",
    icon: Brain,
    options: [
      { value: 1, label: "Not important - just tell me what to do" },
      { value: 2, label: "Somewhat - a simple explanation is enough" },
      { value: 3, label: "Very - I want to understand the science" },
      { value: 4, label: "Essential - I need to understand before I commit" },
    ],
  },
  {
    id: "q12",
    question: "How do you feel about sharing your health journey with others?",
    dimension: "Community Orientation",
    icon: Users,
    options: [
      { value: 1, label: "Uncomfortable - I prefer to keep it private" },
      { value: 2, label: "Neutral - I might share occasionally" },
      { value: 3, label: "Open - I find it helpful to connect with others" },
      { value: 4, label: "Enthusiastic - I love learning from and inspiring others" },
    ],
  },
];

const LongevityMindsetQuiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (!answers[questions[currentQuestion].id]) {
      toast.error("Please select an answer before continuing");
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const calculateMindsetType = () => {
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const avgScore = totalScore / questions.length;

    if (avgScore >= 3.5) {
      return {
        type: "Empowered Biohacker",
        description: "You have a growth mindset about aging and are ready to take action. You believe in your ability to influence your health trajectory and are eager to explore evidence-based longevity practices.",
        actionPlan: "You're primed for our comprehensive biohacking protocols. Start with our 4 Pillars assessment to create your personalized longevity roadmap.",
        color: "from-green-500 to-emerald-600",
      };
    } else if (avgScore >= 2.5) {
      return {
        type: "Awakening Explorer",
        description: "You're curious about longevity and open to learning, but may need more guidance to fully commit. You recognize the possibility of influencing your aging process.",
        actionPlan: "Begin with education and small experiments. Our symptom assessments will help you understand your body and build confidence in your ability to create change.",
        color: "from-blue-500 to-cyan-600",
      };
    } else if (avgScore >= 1.5) {
      return {
        type: "Curious Skeptic",
        description: "You're intrigued by longevity concepts but have doubts about what's possible. You may feel overwhelmed by conflicting information or uncertain about where to start.",
        actionPlan: "Start with our evidence-based resources and success stories. See what's possible when science meets personalized action. Join our community to connect with others on similar journeys.",
        color: "from-amber-500 to-orange-600",
      };
    } else {
      return {
        type: "Overwhelmed Starter",
        description: "You're at the beginning of your longevity awareness journey. You may feel that aging is inevitable or that you have limited control over your health outcomes.",
        actionPlan: "Begin with our foundational education on what aging really means and how much is within your control. Small mindset shifts can create big changes over time.",
        color: "from-purple-500 to-pink-600",
      };
    }
  };

  const mindsetResult = showResults ? calculateMindsetType() : null;

  const calculateDimensionScores = () => {
    const dimensionScores: Record<string, { total: number; count: number; avg: number }> = {};
    
    questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        if (!dimensionScores[q.dimension]) {
          dimensionScores[q.dimension] = { total: 0, count: 0, avg: 0 };
        }
        dimensionScores[q.dimension].total += answer;
        dimensionScores[q.dimension].count += 1;
      }
    });

    Object.keys(dimensionScores).forEach((dim) => {
      dimensionScores[dim].avg = dimensionScores[dim].total / dimensionScores[dim].count;
    });

    return dimensionScores;
  };

  const allMindsetTypes = [
    {
      type: "Overwhelmed Starter",
      range: "1.0 - 1.5",
      color: "from-purple-500 to-pink-600",
    },
    {
      type: "Curious Skeptic",
      range: "1.5 - 2.5",
      color: "from-amber-500 to-orange-600",
    },
    {
      type: "Awakening Explorer",
      range: "2.5 - 3.5",
      color: "from-blue-500 to-cyan-600",
    },
    {
      type: "Empowered Biohacker",
      range: "3.5 - 4.0",
      color: "from-green-500 to-emerald-600",
    },
  ];

  const handleEmailSubmit = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      const avgScore = totalScore / questions.length;

      const { error } = await supabase.from("mindset_quiz_leads").insert({
        user_id: user?.id || null,
        email,
        answers,
        mindset_type: mindsetResult?.type || "",
        mindset_score: avgScore,
      });

      if (error) throw error;

      toast.success("Success! Check your email for your personalized Longevity Roadmap.");
      
      // Navigate to dashboard or auth based on user status
      setTimeout(() => {
        if (user) {
          navigate("/dashboard");
        } else {
          navigate("/auth");
        }
      }, 2000);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Failed to save your results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showResults && mindsetResult) {
    const dimensionScores = calculateDimensionScores();
    const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
    const avgScore = totalScore / questions.length;

    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="card-elevated">
              <CardHeader className="text-center">
                <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${mindsetResult.color} flex items-center justify-center mb-4`}>
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl mb-2">Your Longevity Mindset Type</CardTitle>
                <CardDescription className="text-2xl font-bold text-primary">
                  {mindsetResult.type}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-lg">What This Means</h3>
                  <p className="text-muted-foreground">{mindsetResult.description}</p>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                  <h3 className="font-semibold mb-2 text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Next Steps
                  </h3>
                  <p className="text-muted-foreground">{mindsetResult.actionPlan}</p>
                </div>

                {!showEmailCapture ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Want your complete Longevity Roadmap with personalized action steps?
                    </p>
                    <Button size="lg" onClick={() => setShowEmailCapture(true)}>
                      Get My Personalized Roadmap
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEmailSubmit();
                          }
                        }}
                      />
                    </div>
                    <Button 
                      size="lg" 
                      className="w-full" 
                      onClick={handleEmailSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send My Roadmap"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      We'll send you a detailed analysis plus 3 days of personalized guidance to help you start your longevity journey.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mindset Type Scale */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-xl">Longevity Mindset Type Scale</CardTitle>
                <CardDescription>See where you fall on the mindset spectrum</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allMindsetTypes.map((type) => {
                    const isUserType = type.type === mindsetResult.type;
                    return (
                      <div
                        key={type.type}
                        className={`rounded-lg border-2 p-4 transition-all ${
                          isUserType
                            ? "border-primary bg-primary/5 scale-105"
                            : "border-border bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center flex-shrink-0`}>
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${isUserType ? "text-xl text-primary" : "text-base"}`}>
                              {type.type}
                              {isUserType && " (You)"}
                            </p>
                            <p className="text-sm text-muted-foreground">Score Range: {type.range}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Your score: <span className="font-semibold text-primary">{avgScore.toFixed(2)}</span> / 4.0
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dimension Breakdown */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="text-xl">Your Mindset Dimension Breakdown</CardTitle>
                <CardDescription>Detailed analysis of the components that shape your longevity mindset</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(dimensionScores)
                    .sort(([, a], [, b]) => b.avg - a.avg)
                    .map(([dimension, data]) => {
                      const percentage = (data.avg / 4) * 100;
                      const Icon = questions.find(q => q.dimension === dimension)?.icon || Brain;
                      return (
                        <div key={dimension} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              <span className="font-medium">{dimension}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {data.avg.toFixed(1)} / 4.0
                            </span>
                          </div>
                          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const CurrentIcon = currentQ.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="card-elevated">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CurrentIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardDescription className="text-xs uppercase tracking-wide">
                    {currentQ.dimension}
                  </CardDescription>
                </div>
              </div>
              <CardTitle className="text-2xl leading-relaxed">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                value={answers[currentQ.id] !== undefined ? answers[currentQ.id].toString() : ""}
                onValueChange={(value) => handleAnswer(currentQ.id, parseInt(value))}
              >
                {currentQ.options.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      answers[currentQ.id] === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                  >
                    <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                    <Label
                      htmlFor={`option-${option.value}`}
                      className="flex-1 cursor-pointer text-base leading-relaxed"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex gap-4 pt-4">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                )}
                <Button onClick={handleNext} className="flex-1">
                  {currentQuestion === questions.length - 1 ? "See My Results" : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentQuestion === 4 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground italic">
                Take a moment to reflect: How do these questions make you feel about your relationship with aging?
              </p>
            </div>
          )}

          {currentQuestion === 8 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground italic">
                Notice any patterns in your answers? What's holding you back, and what's pulling you forward?
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LongevityMindsetQuiz;
