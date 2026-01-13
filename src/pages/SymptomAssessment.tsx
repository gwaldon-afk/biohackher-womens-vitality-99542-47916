import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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

        // Trigger incremental cross-assessment AI analysis
        try {
          await supabase.functions.invoke('analyze-cross-assessments', {
            body: { trigger_assessment: 'symptom' }
          });
        } catch (analysisError) {
          console.error('Cross-assessment analysis trigger failed:', analysisError);
          // Non-blocking - don't fail the assessment completion
        }
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
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(true)}
                className="text-muted-foreground"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Assessment
              </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">{assessmentConfig.name}</h1>
            <p className="text-muted-foreground">{assessmentConfig.description}</p>
          </div>

          <Card className="p-6">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {questions.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                {currentQ.category}
              </div>
              <h2 className="text-xl font-semibold mb-6">{currentQ.question}</h2>

              <RadioGroup
                key={currentQ.id}
                value={answers[currentQ.id]?.toString()}
                onValueChange={(value) => handleAnswerChange(currentQ.id, parseInt(value))}
              >
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        answers[currentQ.id] === option.score
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleAnswerChange(currentQ.id, option.score)}
                    >
                      <RadioGroupItem value={option.score.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isAnswered}
              >
                {currentQuestion === questions.length - 1 ? 'View Results' : 'Next'}
              </Button>
            </div>
          </Card>
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
