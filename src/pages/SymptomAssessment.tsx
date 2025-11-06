import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAssessments } from "@/hooks/useAssessments";
import { ArrowLeft, X } from "lucide-react";
import { useAssessmentFlowStore } from "@/stores/assessmentFlowStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SymptomAssessment = () => {
  const { symptomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { assessments, loading: assessmentsLoading } = useAssessments();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const flowState = useAssessmentFlowStore();
  const isMultiAssessmentFlow = flowState.isActive && flowState.flowType === 'suggested';

  // Reset state when symptomId changes to prevent answer carryover
  useEffect(() => {
    setAnswers({});
    setCurrentQuestion(0);
  }, [symptomId]);

  const handleCancelAssessment = () => {
    // Go back to previous page if history exists, otherwise fallback to appropriate page
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/');
    }
  };

  // Get assessment config from database
  const assessmentConfig = symptomId && assessments[symptomId] ? assessments[symptomId] : null;
  
  if (assessmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!assessmentConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Assessment Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This assessment is not available. Please check the assessment ID and try again.
            </p>
            <Button onClick={() => navigate('/pillars')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pillars
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const questions = assessmentConfig.questions;

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: score
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateScore();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = async () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const averageScore = totalScore / Object.keys(answers).length;
    
    // Determine category based on scoring guidance
    const { scoringGuidance } = assessmentConfig;
    let scoreCategory = 'poor';
    let categoryDescription = scoringGuidance.poor.description;
    
    if (averageScore >= scoringGuidance.excellent.min) {
      scoreCategory = 'excellent';
      categoryDescription = scoringGuidance.excellent.description;
    } else if (averageScore >= scoringGuidance.good.min) {
      scoreCategory = 'good';
      categoryDescription = scoringGuidance.good.description;
    } else if (averageScore >= scoringGuidance.fair.min) {
      scoreCategory = 'fair';
      categoryDescription = scoringGuidance.fair.description;
    }

    // For authenticated users, save to symptom_assessments
    if (user) {
      try {
        const { error } = await supabase
          .from('symptom_assessments')
          .insert({
            user_id: user.id,
            symptom_type: symptomId || 'unknown',
            overall_score: averageScore,
            answers: answers,
            score_category: scoreCategory,
            recommendations: {
              description: categoryDescription,
              scoringGuidance: scoringGuidance
            }
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving assessment:', error);
        toast.error('Failed to save assessment results');
      }
    } 
    // For guest users in multi-assessment flow, save to guest table
    else if (isMultiAssessmentFlow && flowState.sessionId) {
      try {
        const { error } = await supabase
          .from('guest_symptom_assessments')
          .insert({
            session_id: flowState.sessionId,
            symptom_id: symptomId || 'unknown',
            assessment_data: {
              name: assessmentConfig.name,
              description: assessmentConfig.description,
              pillar: assessmentConfig.pillar
            },
            score: averageScore,
            score_category: scoreCategory,
            answers: answers
          });

        if (error) throw error;
      } catch (error) {
        console.error('Error saving guest assessment:', error);
        // Don't block flow on error
      }
    }

    // Mark this assessment as complete in the flow
    if (isMultiAssessmentFlow) {
      flowState.completeCurrentAssessment();
    }

    // Navigate to results with flow context
    navigate(`/assessment/${symptomId}/results`, {
      state: { 
        score: averageScore, 
        answers,
        assessmentName: assessmentConfig.name,
        assessmentDescription: assessmentConfig.description,
        scoringGuidance: scoringGuidance,
        scoreCategory: scoreCategory,
        categoryDescription: categoryDescription,
        pillar: assessmentConfig.pillar,
        // Pass flow context
        isMultiAssessmentFlow,
        hasMoreAssessments: flowState.hasMoreAssessments(),
        nextAssessmentId: flowState.getNextAssessment(),
        sessionId: flowState.sessionId
      }
    });
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isAnswered = answers[currentQ.id] !== undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      
      {/* Minimal Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Exit
            </Button>
            
            <span className="text-sm text-muted-foreground font-medium">
              {currentQuestion + 1} of {questions.length}
            </span>
          </div>

          {/* Smooth Progress Bar */}
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Category Badge */}
          <div className="flex items-center gap-2 mt-3">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {currentQ.category}
            </div>
          </div>
        </div>
      </div>

      {/* Main Question Display - Centered */}
      <div className="container max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
          <div className="w-full space-y-8 animate-fade-in">
            {/* Question Text - Large & Prominent */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Answer Cards - Large Interactive Tiles */}
            <div className="grid grid-cols-1 gap-4 animate-scale-in">
              {currentQ.options.map((option, index) => {
                const isSelected = answers[currentQ.id] === option.score;
                const scorePercent = (option.score / 5) * 100; // Assuming max score is 5
                const barColor = scorePercent >= 66 ? 'bg-green-500' : scorePercent >= 33 ? 'bg-yellow-500' : 'bg-red-500';
                
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all duration-300 hover:scale-102 hover:shadow-lg ${
                      isSelected
                        ? 'border-primary border-2 bg-primary/10 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => {
                      handleAnswerChange(currentQ.id, option.score);
                      // Auto-advance after 400ms
                      setTimeout(() => handleNext(), 400);
                    }}
                  >
                    <CardContent className="p-6 space-y-3">
                      {/* Option Text */}
                      <h4 className="font-semibold text-lg leading-relaxed">
                        {option.text}
                      </h4>
                      
                      {/* Color-coded Score Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${barColor} transition-all duration-300`}
                            style={{ width: `${scorePercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium min-w-[3ch]">
                          {option.score}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Navigation - Minimal */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentQuestion === 0}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>

              {/* Show Continue button if needed */}
              {isAnswered && (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2"
                >
                  {currentQuestion === questions.length - 1 ? 'View Results' : 'Continue'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Assessment?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will not be saved. You'll need to start over if you want to complete this assessment later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Assessment</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelAssessment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SymptomAssessment;
