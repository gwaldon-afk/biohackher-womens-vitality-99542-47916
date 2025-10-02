import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Target, TrendingUp, TrendingDown, Minus, CheckCircle2, Sparkles, Activity, Heart, Brain, Users, Utensils, Moon } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import LongevityProjection from "@/components/LongevityProjection";

const LISAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showProfile, setShowProfile] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [lisScore, setLisScore] = useState(0);
  const [profileData, setProfileData] = useState({
    age: "",
    healthGoals: [] as string[],
    healthConcerns: [] as string[]
  });

  const questions = [
    {
      id: 0,
      category: "Sleep Quality",
      icon: Moon,
      question: "How many hours of quality sleep did you get last night?",
      options: [
        { value: "less-than-5", label: "Less than 5 hours", score: 40, detail: "Significantly below optimal" },
        { value: "5-6", label: "5-6 hours", score: 60, detail: "Below recommended range" },
        { value: "6-7", label: "6-7 hours", score: 80, detail: "Adequate for some adults" },
        { value: "7-9", label: "7-9 hours (optimal)", score: 100, detail: "Optimal sleep duration" },
        { value: "more-than-9", label: "More than 9 hours", score: 70, detail: "May indicate oversleeping" }
      ]
    },
    {
      id: 1,
      category: "Sleep Recovery",
      icon: Moon,
      question: "How did you feel when you woke up this morning?",
      options: [
        { value: "exhausted", label: "Exhausted - Needed to drag myself out of bed", score: 40 },
        { value: "tired", label: "Tired - Could use more sleep", score: 60 },
        { value: "okay", label: "Okay - Reasonably rested", score: 80 },
        { value: "refreshed", label: "Refreshed - Ready to start the day", score: 100 }
      ]
    },
    {
      id: 2,
      category: "Stress Management",
      icon: Heart,
      question: "How would you rate your stress level today?",
      options: [
        { value: "very-high", label: "Very High - Overwhelming, hard to cope", score: 40 },
        { value: "high", label: "High - Significant stress affecting daily life", score: 60 },
        { value: "moderate", label: "Moderate - Manageable with effort", score: 80 },
        { value: "low", label: "Low - Minimal stress, feeling balanced", score: 100 }
      ]
    },
    {
      id: 3,
      category: "Stress Recovery",
      icon: Heart,
      question: "Did you take time today for stress-reducing activities?",
      options: [
        { value: "none", label: "No time for relaxation", score: 50 },
        { value: "minimal", label: "Brief moments (5-10 min)", score: 70 },
        { value: "some", label: "Moderate time (15-30 min)", score: 90 },
        { value: "dedicated", label: "Dedicated practice (30+ min)", score: 100 }
      ]
    },
    {
      id: 4,
      category: "Physical Activity",
      icon: Activity,
      question: "How much physical activity did you do today?",
      options: [
        { value: "none", label: "Sedentary - No intentional movement", score: 50 },
        { value: "light", label: "Light - Walking, stretching (10-20 min)", score: 75 },
        { value: "moderate", label: "Moderate - 30+ min exercise", score: 100 },
        { value: "vigorous", label: "Vigorous - Intense workout", score: 95 }
      ]
    },
    {
      id: 5,
      category: "Movement Variety",
      icon: Activity,
      question: "What types of movement did you include?",
      options: [
        { value: "none", label: "No variety, mostly sitting", score: 50 },
        { value: "basic", label: "One type (e.g., just walking)", score: 70 },
        { value: "mixed", label: "Multiple types (cardio + strength or flexibility)", score: 90 },
        { value: "comprehensive", label: "Comprehensive (cardio, strength, flexibility)", score: 100 }
      ]
    },
    {
      id: 6,
      category: "Nutrition Quality",
      icon: Utensils,
      question: "How would you describe your nutrition today?",
      options: [
        { value: "poor", label: "Poor - Mostly processed/fast food", score: 40 },
        { value: "fair", label: "Fair - Some healthy choices mixed in", score: 65 },
        { value: "good", label: "Good - Mostly whole, unprocessed foods", score: 85 },
        { value: "excellent", label: "Excellent - Nutrient-dense, well-balanced", score: 100 }
      ]
    },
    {
      id: 7,
      category: "Hydration & Habits",
      icon: Utensils,
      question: "How well did you hydrate and time your meals?",
      options: [
        { value: "poor", label: "Poor - Dehydrated, irregular eating", score: 50 },
        { value: "fair", label: "Fair - Some water, inconsistent meals", score: 70 },
        { value: "good", label: "Good - Adequate water, regular meals", score: 90 },
        { value: "optimal", label: "Optimal - Well-hydrated, timed nutrition", score: 100 }
      ]
    },
    {
      id: 8,
      category: "Social Connection",
      icon: Users,
      question: "How many meaningful social connections did you have today?",
      options: [
        { value: "none", label: "None - Isolated all day", score: 50 },
        { value: "minimal", label: "Minimal - Brief, surface interactions", score: 70 },
        { value: "some", label: "Some - Quality conversation or connection", score: 90 },
        { value: "multiple", label: "Multiple - Deep, meaningful connections", score: 100 }
      ]
    },
    {
      id: 9,
      category: "Cognitive Engagement",
      icon: Brain,
      question: "How mentally engaged and focused were you today?",
      options: [
        { value: "very-low", label: "Very Low - Brain fog, hard to concentrate", score: 40 },
        { value: "low", label: "Low - Struggled to stay focused", score: 60 },
        { value: "moderate", label: "Moderate - Normal focus and clarity", score: 80 },
        { value: "high", label: "High - Sharp, clear, highly productive", score: 100 }
      ]
    },
    {
      id: 10,
      category: "Learning & Growth",
      icon: Brain,
      question: "Did you engage in learning or mental stimulation today?",
      options: [
        { value: "none", label: "No new learning or challenges", score: 50 },
        { value: "minimal", label: "Brief exposure (reading, podcast)", score: 75 },
        { value: "moderate", label: "Deliberate learning (30+ min)", score: 90 },
        { value: "intensive", label: "Deep learning or problem-solving", score: 100 }
      ]
    }
  ];

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let answeredQuestions = 0;

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          totalScore += option.score;
          answeredQuestions++;
        }
      }
    });

    const finalScore = answeredQuestions > 0 ? Math.round(totalScore / answeredQuestions) : 0;
    setLisScore(finalScore);
    setShowResults(true);
  };

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: "Excellent", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" };
    if (score >= 80) return { label: "Very Good", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 70) return { label: "Good", icon: Minus, color: "text-blue-500", bg: "bg-blue-50" };
    if (score >= 60) return { label: "Fair", icon: Minus, color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Needs Attention", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50" };
  };

  const handleProfileComplete = () => {
    if (profileData.age && profileData.healthGoals.length > 0) {
      setShowProfile(false);
    } else {
      toast({
        title: "Complete Your Profile",
        description: "Please fill in all required fields to continue",
        variant: "destructive"
      });
    }
  };

  const getDetailedAnalysis = (score: number) => {
    // Calculate category scores
    const categoryScores = {
      sleep: 0,
      stress: 0,
      activity: 0,
      nutrition: 0,
      social: 0,
      cognitive: 0
    };
    
    let categoryCount = { sleep: 0, stress: 0, activity: 0, nutrition: 0, social: 0, cognitive: 0 };
    
    questions.forEach((question) => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.value === answer);
        if (option) {
          const cat = question.category.toLowerCase();
          if (cat.includes('sleep')) {
            categoryScores.sleep += option.score;
            categoryCount.sleep++;
          } else if (cat.includes('stress')) {
            categoryScores.stress += option.score;
            categoryCount.stress++;
          } else if (cat.includes('activity') || cat.includes('movement')) {
            categoryScores.activity += option.score;
            categoryCount.activity++;
          } else if (cat.includes('nutrition') || cat.includes('hydration')) {
            categoryScores.nutrition += option.score;
            categoryCount.nutrition++;
          } else if (cat.includes('social')) {
            categoryScores.social += option.score;
            categoryCount.social++;
          } else if (cat.includes('cognitive') || cat.includes('learning')) {
            categoryScores.cognitive += option.score;
            categoryCount.cognitive++;
          }
        }
      }
    });

    // Calculate averages
    const avgScores = {
      sleep: categoryCount.sleep > 0 ? Math.round(categoryScores.sleep / categoryCount.sleep) : 0,
      stress: categoryCount.stress > 0 ? Math.round(categoryScores.stress / categoryCount.stress) : 0,
      activity: categoryCount.activity > 0 ? Math.round(categoryScores.activity / categoryCount.activity) : 0,
      nutrition: categoryCount.nutrition > 0 ? Math.round(categoryScores.nutrition / categoryCount.nutrition) : 0,
      social: categoryCount.social > 0 ? Math.round(categoryScores.social / categoryCount.social) : 0,
      cognitive: categoryCount.cognitive > 0 ? Math.round(categoryScores.cognitive / categoryCount.cognitive) : 0
    };

    // Find strengths and areas for improvement
    const strengths = Object.entries(avgScores)
      .filter(([_, score]) => score >= 85)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1));
    
    const improvements = Object.entries(avgScores)
      .filter(([_, score]) => score < 70)
      .map(([key, _]) => key.charAt(0).toUpperCase() + key.slice(1));

    let analysis = "";
    const age = parseInt(profileData.age);
    const ageContext = age < 30 ? "in your 20s" : age < 40 ? "in your 30s" : age < 50 ? "in your 40s" : age < 60 ? "in your 50s" : "over 60";
    const goalsText = profileData.healthGoals.length > 1 
      ? profileData.healthGoals.slice(0, -1).join(', ') + ' and ' + profileData.healthGoals.slice(-1)
      : profileData.healthGoals[0];
    
    if (score >= 90) {
      analysis = `Outstanding! Your LIS score of ${score} places you in the top tier of longevity optimization for someone ${ageContext}. You're consistently making choices that support healthy aging across all key areas of life.`;
      if (profileData.healthGoals.length > 0) analysis += ` Your focus on ${goalsText.toLowerCase()} is clearly paying off.`;
    } else if (score >= 80) {
      analysis = `Excellent work! Your LIS score of ${score} shows you're actively working toward longevity. For someone ${ageContext} with your goals of ${goalsText.toLowerCase()}, your lifestyle choices are positively impacting your biological age.`;
    } else if (score >= 70) {
      analysis = `Good foundation! Your LIS score of ${score} indicates solid health habits for someone ${ageContext}. Given your goals of ${goalsText.toLowerCase()}, there's significant room for optimization to maximize your longevity potential.`;
    } else if (score >= 60) {
      analysis = `Fair status. Your LIS score of ${score} suggests your current habits are neutral to slightly aging. As someone ${ageContext} aiming for ${goalsText.toLowerCase()}, strategic improvements could significantly enhance your longevity.`;
    } else {
      analysis = `Your LIS score of ${score} indicates significant opportunity for improvement. For someone ${ageContext}, the good news is that lifestyle changes can have a powerful impact on biological aging, especially when working toward ${goalsText.toLowerCase()}.`;
    }
    
    if (profileData.healthConcerns.length > 0) {
      analysis += ` Given your focus on ${profileData.healthConcerns.join(', ').toLowerCase()}, the areas for improvement we've identified are particularly relevant.`;
    }

    if (strengths.length > 0) {
      analysis += `\n\nYour strengths: ${strengths.join(', ')}. These areas are serving you well.`;
    }
    
    if (improvements.length > 0) {
      analysis += `\n\nPriority areas for improvement: ${improvements.join(', ')}. Focus here for maximum longevity impact.`;
    }

    return { analysis, categoryScores: avgScores };
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const category = getScoreCategory(lisScore);
  const CategoryIcon = category.icon;
  const { analysis, categoryScores } = getDetailedAnalysis(lisScore);

  // Profile Collection Screen
  if (showProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card className="border-primary/20">
            <CardHeader>
              <div className="text-center mb-4">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Let's Get to Know You</CardTitle>
                <CardDescription className="text-base">
                  Help us personalize your Longevity Impact Score by sharing a few details about yourself
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-base font-medium">What's your age? *</Label>
                <input
                  id="age"
                  type="number"
                  min="18"
                  max="120"
                  value={profileData.age}
                  onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                  placeholder="Enter your age"
                />
              </div>

              {/* Primary Health Goals */}
              <div className="space-y-3">
                <Label className="text-base font-medium">What are your primary health goals? (Select all that apply) *</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Increase longevity and healthspan",
                    "Improve energy and vitality",
                    "Better sleep quality",
                    "Reduce stress and anxiety",
                    "Optimize physical performance",
                    "Prevent age-related decline"
                  ].map((goal) => (
                    <div
                      key={goal}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        profileData.healthGoals.includes(goal)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        const updated = profileData.healthGoals.includes(goal)
                          ? profileData.healthGoals.filter(g => g !== goal)
                          : [...profileData.healthGoals, goal];
                        setProfileData({ ...profileData, healthGoals: updated });
                      }}
                    >
                      <span className="text-sm">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Concerns (Optional) */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Any specific health areas you'd like to focus on? (Optional)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    "Sleep issues",
                    "Chronic stress",
                    "Low energy",
                    "Brain fog",
                    "Weight management",
                    "Joint pain",
                    "Digestive issues",
                    "Mood concerns"
                  ].map((concern) => (
                    <div
                      key={concern}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        profileData.healthConcerns.includes(concern)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => {
                        const updated = profileData.healthConcerns.includes(concern)
                          ? profileData.healthConcerns.filter(c => c !== concern)
                          : [...profileData.healthConcerns, concern];
                        setProfileData({ ...profileData, healthConcerns: updated });
                      }}
                    >
                      <span className="text-sm">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleProfileComplete} size="lg" className="w-full">
                Continue to Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Your Longevity Impact Score</CardTitle>
              <CardDescription>Based on your current daily habits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center py-8">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${category.bg} mb-4`}>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${category.color}`}>{lisScore}</div>
                    <div className="text-sm text-muted-foreground">/ 100</div>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CategoryIcon className={`h-5 w-5 ${category.color}`} />
                  <h3 className={`text-xl font-semibold ${category.color}`}>{category.label}</h3>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto whitespace-pre-line leading-relaxed">
                  {analysis}
                </p>
              </div>

              {/* Category Breakdown */}
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-center">Your Longevity Pillars Breakdown</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(categoryScores).map(([key, score]) => {
                    const iconMap = {
                      sleep: Moon,
                      stress: Heart,
                      activity: Activity,
                      nutrition: Utensils,
                      social: Users,
                      cognitive: Brain
                    };
                    const Icon = iconMap[key as keyof typeof iconMap];
                    const scoreColor = score >= 85 ? 'text-green-600' : score >= 70 ? 'text-blue-600' : score >= 60 ? 'text-amber-600' : 'text-red-600';
                    
                    return (
                      <div key={key} className="bg-background/80 p-4 rounded-lg border border-primary/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-4 w-4 ${scoreColor}`} />
                          <span className="text-sm font-medium capitalize">{key}</span>
                        </div>
                        <div className={`text-2xl font-bold ${scoreColor}`}>{score}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Longevity Projection for Logged-in Users */}
              {user && (
                <div className="mt-6">
                  <LongevityProjection sustainedLIS={lisScore} dataPoints={1} />
                </div>
              )}

              {/* Teaser for Registered Users */}
              {!user && (
                <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertDescription className="ml-2">
                    <div className="space-y-4">
                      <p className="font-semibold text-primary">Want to unlock your full longevity potential?</p>
                      <p className="text-sm text-muted-foreground">
                        Sign up now to receive:
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground ml-4">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Detailed Analysis:</strong> Deep dive into each category with personalized insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Custom Action Plan:</strong> Evidence-based recommendations tailored to your results</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Daily Tracking:</strong> Monitor your progress and watch your biological age improve</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Longevity Projection:</strong> See your potential lifespan impact over 5, 10, and 20 years</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span><strong>Expert Support:</strong> Access to evidence-based protocols and biohacking strategies</span>
                        </li>
                      </ul>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button 
                          onClick={() => navigate('/auth?mode=signup')}
                          className="flex-1"
                          size="lg"
                        >
                          Sign Up for Free Analysis
                        </Button>
                        <Button 
                          onClick={() => navigate('/auth?mode=login')}
                          variant="outline"
                          className="flex-1"
                          size="lg"
                        >
                          Already a Member? Log In
                        </Button>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* For Logged-in Users */}
              {user && (
                <div className="space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription className="ml-2 text-green-800">
                      <strong>Great news!</strong> As a member, you now have access to your complete analysis, 
                      personalized recommendations, and daily tracking tools.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      size="lg"
                      className="w-full"
                    >
                      View Full Dashboard
                    </Button>
                    <Button 
                      onClick={() => navigate('/dashboard?tab=overview')}
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      Track Daily Progress
                    </Button>
                  </div>
                </div>
              )}

              {/* Back to Home */}
              <div className="text-center pt-4">
                <Button 
                  onClick={() => navigate('/')}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Button
                onClick={() => currentQuestion === 0 ? navigate(-1) : handleBack()}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
            <Progress value={progress} className="mb-6" />
            <div className="flex items-center gap-3 text-primary mb-2">
              {(() => {
                const Icon = questions[currentQuestion].icon;
                return <Icon className="h-5 w-5" />;
              })()}
              <span className="text-sm font-medium">{questions[currentQuestion].category}</span>
            </div>
            <CardTitle className="text-2xl">{questions[currentQuestion].question}</CardTitle>
            <CardDescription>
              Choose the option that best reflects your typical daily habits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[currentQuestion] || ""}
              onValueChange={handleAnswerChange}
              className="space-y-3"
            >
              {questions[currentQuestion].options.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleAnswerChange(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion]}
                size="lg"
              >
                {currentQuestion === questions.length - 1 ? "See My Score" : "Next Question"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LISAssessment;
