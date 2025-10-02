import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, ArrowRight, Target, TrendingUp, TrendingDown, Minus, CheckCircle2, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const LISAssessment = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [lisScore, setLisScore] = useState(0);

  const questions = [
    {
      id: 0,
      question: "How many hours of quality sleep did you get last night?",
      options: [
        { value: "less-than-5", label: "Less than 5 hours", score: 40 },
        { value: "5-6", label: "5-6 hours", score: 60 },
        { value: "6-7", label: "6-7 hours", score: 80 },
        { value: "7-9", label: "7-9 hours", score: 100 },
        { value: "more-than-9", label: "More than 9 hours", score: 70 }
      ]
    },
    {
      id: 1,
      question: "How would you rate your stress level today?",
      options: [
        { value: "very-high", label: "Very High - Overwhelming", score: 40 },
        { value: "high", label: "High - Significant stress", score: 60 },
        { value: "moderate", label: "Moderate - Manageable", score: 80 },
        { value: "low", label: "Low - Minimal stress", score: 100 },
        { value: "very-low", label: "Very Low - Completely relaxed", score: 100 }
      ]
    },
    {
      id: 2,
      question: "How much physical activity did you do today?",
      options: [
        { value: "none", label: "None", score: 50 },
        { value: "light", label: "Light activity (walking, stretching)", score: 75 },
        { value: "moderate", label: "Moderate (30+ min exercise)", score: 100 },
        { value: "vigorous", label: "Vigorous (intense workout)", score: 95 },
        { value: "excessive", label: "Excessive (may be overtraining)", score: 70 }
      ]
    },
    {
      id: 3,
      question: "How would you describe your nutrition today?",
      options: [
        { value: "poor", label: "Poor - Mostly processed foods", score: 40 },
        { value: "fair", label: "Fair - Some healthy choices", score: 65 },
        { value: "good", label: "Good - Mostly whole foods", score: 85 },
        { value: "excellent", label: "Excellent - Nutrient-dense, balanced", score: 100 }
      ]
    },
    {
      id: 4,
      question: "How many meaningful social connections did you have today?",
      options: [
        { value: "none", label: "None - Isolated", score: 50 },
        { value: "minimal", label: "Minimal - Brief interactions", score: 70 },
        { value: "some", label: "Some - Quality conversation", score: 90 },
        { value: "multiple", label: "Multiple - Deep connections", score: 100 }
      ]
    },
    {
      id: 5,
      question: "How mentally engaged and focused were you today?",
      options: [
        { value: "very-low", label: "Very Low - Brain fog", score: 40 },
        { value: "low", label: "Low - Struggled to focus", score: 60 },
        { value: "moderate", label: "Moderate - Normal focus", score: 80 },
        { value: "high", label: "High - Sharp and clear", score: 100 }
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

  const getShortAnalysis = (score: number) => {
    if (score >= 90) {
      return "Outstanding! Your daily habits are strongly supporting healthy aging and longevity. You're in the top tier of biological age optimization.";
    }
    if (score >= 80) {
      return "Great work! Your lifestyle choices are positively impacting your biological age. You're on the right track with minor areas for optimization.";
    }
    if (score >= 70) {
      return "Good foundation! Your habits are generally supportive of healthy aging, but there's significant room for improvement to reverse biological aging.";
    }
    if (score >= 60) {
      return "Fair status. Your current habits are neutral to slightly aging. Targeted improvements could significantly impact your longevity trajectory.";
    }
    return "Attention needed. Your daily habits may be accelerating biological aging. Significant lifestyle changes could help reverse this trajectory.";
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const category = getScoreCategory(lisScore);
  const CategoryIcon = category.icon;

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
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {getShortAnalysis(lisScore)}
                </p>
              </div>

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
            <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Longevity Impact Assessment</span>
            </div>
            <CardTitle className="text-2xl">{questions[currentQuestion].question}</CardTitle>
            <CardDescription>
              Select the option that best describes your current habits
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
