import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHormoneCompass } from "@/hooks/useHormoneCompass";
import { useAuth } from "@/hooks/useAuth";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { HORMONE_COMPASS_ASSESSMENT, calculateHormoneAge, calculateHormoneHealth } from "@/data/hormoneCompassAssessment";
import { Moon, ArrowLeft, ArrowRight, CheckCircle, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import { differenceInYears, parse, isValid } from "date-fns";

export default function HormoneCompassAssessment() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { profile } = useHealthProfile();
  const { trackSymptom: _trackSymptom } = useHormoneCompass();
  const { updateProgress } = useAssessmentProgress();
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Age collection for guest users
  const [showAgeCollection, setShowAgeCollection] = useState(false);
  const [guestDateOfBirth, setGuestDateOfBirth] = useState("");
  const [guestAge, setGuestAge] = useState<number | null>(null);

  // Get user age from profile (for authenticated users)
  const userAge = profile?.date_of_birth 
    ? differenceInYears(new Date(), new Date(profile.date_of_birth))
    : null;

  const currentDomain = HORMONE_COMPASS_ASSESSMENT.domains[currentDomainIndex];
  const currentQuestion = currentDomain.questions[currentQuestionIndex];
  const totalQuestions = HORMONE_COMPASS_ASSESSMENT.domains.reduce(
    (sum, domain) => sum + domain.questions.length,
    0
  );
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast({
        title: "Please answer the question",
        description: "Select a value on the scale to continue",
        variant: "destructive"
      });
      return;
    }

    if (currentQuestionIndex < currentDomain.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentDomainIndex < HORMONE_COMPASS_ASSESSMENT.domains.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1);
      setCurrentQuestionIndex(0);
    } else {
      // Assessment complete - check if we need to collect age
      if (!user && !guestAge) {
        setShowAgeCollection(true);
      } else {
        handleComplete();
      }
    }
  };

  const handleBack = () => {
    if (showAgeCollection) {
      setShowAgeCollection(false);
      return;
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1);
      const prevDomain = HORMONE_COMPASS_ASSESSMENT.domains[currentDomainIndex - 1];
      setCurrentQuestionIndex(prevDomain.questions.length - 1);
    }
  };

  const handleDateOfBirthSubmit = () => {
    if (!guestDateOfBirth) {
      toast({
        title: "Date of birth required",
        description: "Please enter your date of birth to calculate your Hormone Age",
        variant: "destructive"
      });
      return;
    }

    const dob = parse(guestDateOfBirth, 'yyyy-MM-dd', new Date());
    if (!isValid(dob)) {
      toast({
        title: "Invalid date",
        description: "Please enter a valid date of birth",
        variant: "destructive"
      });
      return;
    }

    const age = differenceInYears(new Date(), dob);
    if (age < 18 || age > 100) {
      toast({
        title: "Invalid age",
        description: "Please enter a valid date of birth (age 18-100)",
        variant: "destructive"
      });
      return;
    }

    setGuestAge(age);
    handleComplete(age);
  };

  const handleComplete = async (overrideAge?: number) => {
    setIsCalculating(true);
    
    // Determine age to use
    const ageToUse = overrideAge ?? userAge ?? guestAge;

    try {
      // Calculate results - use Hormone Age if we have age, otherwise fall back
      let result;
      let hormoneAgeResult = null;
      
      if (ageToUse) {
        hormoneAgeResult = calculateHormoneAge(answers, ageToUse);
        result = {
          stage: hormoneAgeResult.healthLevel,
          confidence: hormoneAgeResult.confidence,
          avgScore: hormoneAgeResult.avgScore
        };
      } else {
        result = calculateHormoneHealth(answers);
      }

      if (!user) {
        // Guest flow - navigate with state
        navigate('/hormone-compass/results', {
          state: { 
            stage: result.stage, 
            confidence: result.confidence, 
            answers,
            hormoneAge: hormoneAgeResult?.hormoneAge,
            chronologicalAge: ageToUse,
            ageOffset: hormoneAgeResult?.ageOffset,
            severityScore: hormoneAgeResult?.severityScore
          }
        });
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please log in to save your assessment results.", variant: "destructive" });
        navigate('/auth');
        return;
      }

      // Save to database with Hormone Age data
      const { data: stageData, error } = await supabase
        .from('hormone_compass_stages')
        .insert({
          user_id: session.user.id,
          stage: result.stage,
          confidence_score: result.confidence,
          hormone_age: hormoneAgeResult?.hormoneAge ?? null,
          chronological_age: ageToUse ?? null,
          age_offset: hormoneAgeResult?.ageOffset ?? null,
          hormone_indicators: { 
            domainScores: answers, 
            avgScore: result.avgScore, 
            severityScore: hormoneAgeResult?.severityScore,
            completedAt: new Date().toISOString() 
          }
        })
        .select('id')
        .single();

      if (error) throw error;

      // Update assessment progress tracking
      updateProgress({
        hormone_completed: true,
        hormone_completed_at: new Date().toISOString(),
      });

      // Enable hormone compass feature flag in user profile
      await supabase
        .from('profiles')
        .update({ hormone_compass_enabled: true })
        .eq('user_id', session.user.id);

      // Trigger incremental AI analysis (non-blocking)
      try {
        await supabase.functions.invoke('analyze-cross-assessments', {
          body: { trigger_assessment: 'hormone_compass' }
        });
      } catch (e) {
        console.error('Analysis trigger failed:', e);
      }

      navigate(`/hormone-compass/results?assessmentId=${stageData.id}`);
    } catch (error: any) {
      console.error('Error completing assessment:', error);
      toast({ title: "Error", description: `Failed to save assessment: ${error.message || 'Please try again.'}`, variant: "destructive" });
    } finally {
      setIsCalculating(false);
    }
  };

  const isLastQuestion = currentDomainIndex === HORMONE_COMPASS_ASSESSMENT.domains.length - 1 && currentQuestionIndex === currentDomain.questions.length - 1;

  // Age collection screen for guests
  if (showAgeCollection) {
    return (
      <div className="container max-w-3xl py-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </Button>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="w-8 h-8 text-primary" />
                One More Step
              </h1>
              <p className="text-muted-foreground">
                To calculate your Hormone Age, we need your date of birth
              </p>
            </div>
          </div>

          <Card className="border-2">
            <CardContent className="pt-8 space-y-6">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Moon className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Discover Your Hormone Age</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your Hormone Age compares your symptom patterns to women in your age group, 
                  revealing whether your hormones are functioning younger or older than your actual age.
                </p>
              </div>

              <div className="space-y-4 max-w-sm mx-auto">
                <Label htmlFor="dob" className="text-base font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={guestDateOfBirth}
                  onChange={(e) => setGuestDateOfBirth(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="text-center text-lg h-12"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Your age is used only to compare your symptoms to population norms. 
                  We don't store this information for guest users.
                </p>
              </div>

              <Button 
                onClick={handleDateOfBirthSubmit} 
                disabled={!guestDateOfBirth || isCalculating}
                className="w-full gap-2"
                size="lg"
              >
                {isCalculating ? "Calculating..." : "Get My Hormone Age"}
                <CheckCircle className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="space-y-8">
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Moon className="w-8 h-8 text-primary" />
              HormoneCompass™ Assessment
            </h1>
            <p className="text-muted-foreground">Answer honestly to get the most accurate evaluation</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Question {answeredQuestions + 1} of {totalQuestions}</span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="border-2">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-2xl">{currentDomain.icon}</span>
                <span>{currentDomain.name}</span>
              </div>
              <h2 className="text-xl font-semibold">{currentQuestion.text}</h2>
            </div>
          </div>
          <CardContent className="pt-8 space-y-8">
            <div className="space-y-6">
              <Slider 
                value={[answers[currentQuestion.id] || 3]} 
                onValueChange={([value]) => handleAnswer(value)} 
                min={currentQuestion.scale.min} 
                max={currentQuestion.scale.max} 
                step={1} 
                className="w-full" 
              />
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{answers[currentQuestion.id] || 3}</p>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="text-left max-w-[45%]">{currentQuestion.scale.minLabel}</span>
                <span className="text-right max-w-[45%]">{currentQuestion.scale.maxLabel}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentDomainIndex === 0 && currentQuestionIndex === 0} 
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!answers[currentQuestion.id] || isCalculating} 
                className="flex-1 gap-2"
              >
                {isLastQuestion ? (
                  <>
                    {isCalculating ? "Calculating..." : "Complete"}
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 justify-center">
          {HORMONE_COMPASS_ASSESSMENT.domains.map((domain, index) => (
            <div 
              key={domain.id} 
              className={`h-2 flex-1 rounded-full transition-all ${
                index < currentDomainIndex 
                  ? 'bg-primary' 
                  : index === currentDomainIndex 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
