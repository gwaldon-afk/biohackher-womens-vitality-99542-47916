import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Sample assessment questions - would normally come from a database
const assessmentQuestions = {
  "hot-flashes": [
    {
      id: 1,
      question: "How often do you experience hot flashes?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily (1-3 times per day)" },
        { value: "frequent", label: "Frequently (4+ times per day)" }
      ]
    },
    {
      id: 2,
      question: "How severe are your hot flashes typically?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild - barely noticeable" },
        { value: "moderate", label: "Moderate - uncomfortable but manageable" },
        { value: "severe", label: "Severe - significantly disruptive" },
        { value: "extreme", label: "Extreme - debilitating" }
      ]
    },
    {
      id: 3,
      question: "When do your hot flashes typically occur?",
      type: "radio",
      options: [
        { value: "anytime", label: "Any time of day" },
        { value: "night", label: "Primarily at night" },
        { value: "day", label: "Primarily during the day" },
        { value: "triggers", label: "When triggered by specific situations" }
      ]
    },
    {
      id: 4,
      question: "What triggers seem to make your hot flashes worse?",
      type: "textarea",
      placeholder: "Describe any triggers you've noticed (stress, certain foods, activities, etc.)"
    }
  ],
  "sleep": [
    {
      id: 1,
      question: "How would you describe your sleep quality?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - I sleep well most nights" },
        { value: "good", label: "Good - occasional sleep issues" },
        { value: "fair", label: "Fair - frequent sleep disruptions" },
        { value: "poor", label: "Poor - chronic sleep problems" }
      ]
    },
    {
      id: 2,
      question: "How long does it typically take you to fall asleep?",
      type: "radio",
      options: [
        { value: "quick", label: "Less than 15 minutes" },
        { value: "normal", label: "15-30 minutes" },
        { value: "slow", label: "30-60 minutes" },
        { value: "very-slow", label: "More than 60 minutes" }
      ]
    },
    {
      id: 3,
      question: "How often do you wake up during the night?",
      type: "radio",
      options: [
        { value: "rarely", label: "Rarely - sleep through the night" },
        { value: "sometimes", label: "Sometimes - 1-2 times per night" },
        { value: "often", label: "Often - 3-4 times per night" },
        { value: "frequently", label: "Frequently - 5+ times per night" }
      ]
    }
  ],
  "joint-pain": [
    {
      id: 1,
      question: "Where do you primarily experience joint pain?",
      type: "radio",
      options: [
        { value: "hands", label: "Hands and fingers" },
        { value: "knees", label: "Knees" },
        { value: "hips", label: "Hips" },
        { value: "multiple", label: "Multiple joints" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your pain on average?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild (1-3/10)" },
        { value: "moderate", label: "Moderate (4-6/10)" },
        { value: "severe", label: "Severe (7-8/10)" },
        { value: "extreme", label: "Extreme (9-10/10)" }
      ]
    }
  ],
  
  // Gut Health Assessment
  "gut": [
    {
      id: 1,
      question: "How often do you experience digestive discomfort?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    },
    {
      id: 2,
      question: "What type of digestive symptoms do you experience most? (Select primary symptom)",
      type: "radio",
      options: [
        { value: "bloating", label: "Bloating and gas" },
        { value: "constipation", label: "Constipation" },
        { value: "diarrhea", label: "Diarrhea or loose stools" },
        { value: "pain", label: "Abdominal pain or cramping" },
        { value: "reflux", label: "Heartburn or acid reflux" }
      ]
    },
    {
      id: 3,
      question: "How would you rate your energy levels after meals?",
      type: "radio",
      options: [
        { value: "energised", label: "Energised and comfortable" },
        { value: "neutral", label: "No significant change" },
        { value: "tired", label: "Somewhat tired or sluggish" },
        { value: "exhausted", label: "Very tired or need to rest" }
      ]
    },
    {
      id: 4,
      question: "Have you noticed any food triggers that worsen your symptoms?",
      type: "textarea",
      placeholder: "Please describe any foods that seem to trigger your digestive symptoms..."
    },
    {
      id: 5,
      question: "Rate your overall digestive comfort on a scale of 1-10",
      type: "radio",
      options: [
        { value: "good", label: "Good (7-10/10)" },
        { value: "moderate", label: "Moderate (4-6/10)" },
        { value: "poor", label: "Poor (1-3/10)" }
      ]
    }
  ],
  
  // Brain Pillar Assessments
  "brain-brain-fog-assessment": [
    {
      id: 1,
      question: "How often do you experience mental fog or difficulty concentrating?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your memory performance?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - sharp and reliable" },
        { value: "good", label: "Good - occasional lapses" },
        { value: "fair", label: "Fair - frequent memory issues" },
        { value: "poor", label: "Poor - significant memory problems" }
      ]
    },
    {
      id: 3,
      question: "How is your ability to focus on complex tasks?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - can focus for hours" },
        { value: "good", label: "Good - can focus for 30-60 minutes" },
        { value: "fair", label: "Fair - can focus for 15-30 minutes" },
        { value: "poor", label: "Poor - difficulty focusing for more than 15 minutes" }
      ]
    },
    {
      id: 4,
      question: "How often do you experience mental fatigue?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes - after demanding tasks" },
        { value: "often", label: "Often - daily mental fatigue" },
        { value: "constant", label: "Constantly - chronic mental exhaustion" }
  ],
  
  // Body Pillar Assessments
  "body-energy-&-fatigue-assessment": [
    {
      id: 1,
      question: "How would you rate your overall energy levels?",
      type: "radio",
      options: [
        { value: "high", label: "High - feel energetic most of the day" },
        { value: "moderate", label: "Moderate - have decent energy" },
        { value: "low", label: "Low - often feel tired" },
        { value: "depleted", label: "Depleted - constantly exhausted" }
      ]
    },
    {
      id: 2,
      question: "When do you typically experience energy crashes?",
      type: "radio",
      options: [
        { value: "none", label: "No significant crashes" },
        { value: "afternoon", label: "Afternoon (2-4 PM)" },
        { value: "evening", label: "Early evening (5-7 PM)" },
        { value: "multiple", label: "Multiple times throughout the day" }
      ]
    },
    {
      id: 3,
      question: "How is your energy after physical exercise?",
      type: "radio",
      options: [
        { value: "energized", label: "Energized and refreshed" },
        { value: "normal", label: "Normal recovery" },
        { value: "tired", label: "More tired than expected" },
        { value: "exhausted", label: "Completely exhausted" }
      ]
    }
  ],
  
  "body-mobility-&-strength-analysis": [
    {
      id: 1,
      question: "How would you rate your overall physical strength?",
      type: "radio",
      options: [
        { value: "strong", label: "Strong - feel physically capable" },
        { value: "moderate", label: "Moderate - adequate strength" },
        { value: "weak", label: "Weak - struggle with physical tasks" },
        { value: "very-weak", label: "Very weak - difficulty with daily activities" }
      ]
    },
    {
      id: 2,
      question: "How is your flexibility and range of motion?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - very flexible" },
        { value: "good", label: "Good - reasonably flexible" },
        { value: "stiff", label: "Stiff - limited flexibility" },
        { value: "very-stiff", label: "Very stiff - restricted movement" }
      ]
    },
    {
      id: 3,
      question: "How often do you experience muscle or joint stiffness?",
      type: "radio",
      options: [
        { value: "never", label: "Never or rarely" },
        { value: "sometimes", label: "Sometimes after activity" },
        { value: "often", label: "Often, especially in the morning" },
        { value: "constant", label: "Constantly stiff" }
      ]
    }
  ],
  
  // Balance Pillar Assessments
  "balance-stress-&-anxiety-assessment": [
    {
      id: 1,
      question: "How often do you feel overwhelmed by stress?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely - manage stress well" },
        { value: "sometimes", label: "Sometimes - during busy periods" },
        { value: "often", label: "Often - stress is a regular issue" },
        { value: "constant", label: "Constantly - feel chronically stressed" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your anxiety levels?",
      type: "radio",
      options: [
        { value: "low", label: "Low - rarely feel anxious" },
        { value: "mild", label: "Mild - occasional anxiety" },
        { value: "moderate", label: "Moderate - regular anxiety episodes" },
        { value: "severe", label: "Severe - anxiety significantly impacts daily life" }
      ]
    },
    {
      id: 3,
      question: "How well do you sleep when stressed?",
      type: "radio",
      options: [
        { value: "normal", label: "Sleep normally despite stress" },
        { value: "slightly-affected", label: "Slightly affected sleep" },
        { value: "poor", label: "Poor sleep when stressed" },
        { value: "insomnia", label: "Stress causes insomnia" }
      ]
    }
  ],
  
  "balance-hormonal-balance-evaluation": [
    {
      id: 1,
      question: "How regular are your menstrual cycles? (if applicable)",
      type: "radio",
      options: [
        { value: "regular", label: "Regular and predictable" },
        { value: "somewhat-irregular", label: "Somewhat irregular" },
        { value: "very-irregular", label: "Very irregular or unpredictable" },
        { value: "not-applicable", label: "Not applicable / post-menopause" }
      ]
    },
    {
      id: 2,
      question: "How stable is your mood throughout the day?",
      type: "radio",
      options: [
        { value: "stable", label: "Very stable mood" },
        { value: "minor-fluctuations", label: "Minor mood fluctuations" },
        { value: "moderate-swings", label: "Moderate mood swings" },
        { value: "severe-swings", label: "Severe mood swings" }
      ]
    },
    {
      id: 3,
      question: "How is your libido/sexual desire?",
      type: "radio",
      options: [
        { value: "normal", label: "Normal and healthy" },
        { value: "somewhat-low", label: "Somewhat lower than desired" },
        { value: "low", label: "Low libido" },
        { value: "very-low", label: "Very low or absent libido" }
      ]
    }
  ],
  
  // Beauty Pillar Assessments
  "beauty-skin-health-assessment": [
    {
      id: 1,
      question: "How would you describe your current skin condition?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - clear, smooth, and radiant" },
        { value: "good", label: "Good - generally healthy with minor issues" },
        { value: "fair", label: "Fair - some concerns like dryness or breakouts" },
        { value: "poor", label: "Poor - multiple skin issues" }
      ]
    },
    {
      id: 2,
      question: "What is your primary skin concern?",
      type: "radio",
      options: [
        { value: "aging", label: "Signs of aging (wrinkles, fine lines)" },
        { value: "acne", label: "Acne or breakouts" },
        { value: "dryness", label: "Dryness or dehydration" },
        { value: "pigmentation", label: "Dark spots or uneven pigmentation" },
        { value: "sensitivity", label: "Sensitivity or irritation" }
      ]
    },
    {
      id: 3,
      question: "How consistent is your skincare routine?",
      type: "radio",
      options: [
        { value: "very-consistent", label: "Very consistent - daily routine" },
        { value: "mostly-consistent", label: "Mostly consistent with occasional lapses" },
        { value: "inconsistent", label: "Inconsistent - sporadic routine" },
        { value: "minimal", label: "Minimal or no routine" }
      ]
    }
  ],
  
  "beauty-beauty-&-aging-analysis": [
    {
      id: 1,
      question: "How satisfied are you with your current appearance?",
      type: "radio",
      options: [
        { value: "very-satisfied", label: "Very satisfied" },
        { value: "mostly-satisfied", label: "Mostly satisfied with minor concerns" },
        { value: "somewhat-dissatisfied", label: "Somewhat dissatisfied" },
        { value: "very-dissatisfied", label: "Very dissatisfied" }
      ]
    },
    {
      id: 2,
      question: "What aging concerns you most?",
      type: "radio",
      options: [
        { value: "facial-aging", label: "Facial aging (wrinkles, sagging)" },
        { value: "hair-changes", label: "Hair thinning or graying" },
        { value: "body-changes", label: "Body shape or skin texture changes" },
        { value: "energy-appearance", label: "Looking tired or lacking vitality" }
      ]
    },
    {
      id: 3,
      question: "How important is anti-aging prevention to you?",
      type: "radio",
      options: [
        { value: "very-important", label: "Very important - actively prevent aging" },
        { value: "important", label: "Important - some preventive measures" },
        { value: "somewhat-important", label: "Somewhat important" },
        { value: "not-important", label: "Not a current priority" }
      ]
    }
  ]
    }
  ],
  
  "brain-memory-&-focus-analysis": [
    {
      id: 1,
      question: "How would you rate your working memory (ability to hold information temporarily)?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - can easily juggle multiple pieces of information" },
        { value: "good", label: "Good - generally manage well" },
        { value: "fair", label: "Fair - sometimes struggle with multiple tasks" },
        { value: "poor", label: "Poor - difficulty holding information in mind" }
      ]
    },
    {
      id: 2,
      question: "How is your ability to learn new information?",
      type: "radio",
      options: [
        { value: "fast", label: "Fast learner - pick up new concepts quickly" },
        { value: "normal", label: "Normal pace - learn at average speed" },
        { value: "slow", label: "Slow learner - need extra time and repetition" },
        { value: "difficulty", label: "Significant difficulty learning new things" }
      ]
    },
    {
      id: 3,
      question: "How often do you experience 'tip of the tongue' moments?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely" },
        { value: "weekly", label: "Weekly" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    }
  ]
};

const SymptomAssessment = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log('🚀 SymptomAssessment loaded - FRESH VERSION', { symptomId, user: !!user });
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = symptomId ? (assessmentQuestions[symptomId as keyof typeof assessmentQuestions] || []) : [];

  const handleAnswer = (questionId: number, answer: string) => {
    console.log('📝 Answer updated:', { questionId, answer });
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submitted!', { questions: questions.length, answers });
    
    // Check if all questions are answered
    const allAnswered = questions.every(q => {
      const hasAnswer = answers[q.id] && answers[q.id].trim() !== "";
      console.log(`❓ Question ${q.id}: ${hasAnswer ? '✅ ANSWERED' : '❌ MISSING'}`, answers[q.id]);
      return hasAnswer;
    });
    
    console.log('✅ All questions answered:', allAnswered);
    
    if (!allAnswered) {
      console.log('❌ Validation failed - showing toast');
      toast({
        variant: "destructive",
        title: "Please answer all questions",
        description: "All questions must be completed before submitting."
      });
      return;
    }
    
    console.log('🎉 Validation passed - calling completeAssessment');
    completeAssessment();
  };

  const completeAssessment = async () => {
    console.log('💾 Starting completeAssessment', { user: !!user, symptomId });
    
    if (isSubmitting) {
      console.log('🛑 Already submitting, ignoring duplicate call');
      return;
    }
    
    setIsSubmitting(true);
    
    if (!user) {
      console.log('❌ User not authenticated');
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to save your assessment results."
      });
      navigate('/auth');
      setIsSubmitting(false);
      return;
    }

    if (!symptomId) {
      console.log('❌ Missing symptomId');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Symptom ID is missing. Please try again."
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📤 Saving to database...', answers);
      
      // Save assessment results to database with proper conflict resolution
      const { error } = await supabase
        .from('user_symptoms')
        .upsert({
          user_id: user.id,
          symptom_id: symptomId,
          is_active: true,
          severity: 'Moderate', // This would be calculated based on answers
          frequency: 'Weekly', // This would be calculated based on answers
          notes: JSON.stringify(answers),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,symptom_id'
        });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Assessment saved successfully');
      toast({
        title: "Assessment Complete",
        description: "Your responses have been saved. View your symptom summary."
      });
      
      setIsComplete(true);
      
      // Navigate to results page with answers as URL parameters
      const urlParams = new URLSearchParams();
      Object.entries(answers).forEach(([questionId, answer]) => {
        urlParams.set(`q${questionId}`, answer);
      });
      
      setTimeout(() => {
        navigate(`/assessment/${symptomId}/results?${urlParams.toString()}`);
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving assessment:', error);
      toast({
        variant: "destructive",
        title: "Error saving assessment",
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSymptomName = (id: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flashes",
      "sleep": "Sleep Issues",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "energy-levels": "Low Energy",
      "bloating": "Bloating",
      "weight-changes": "Weight Changes",
      "hair-thinning": "Hair Thinning",
      "anxiety": "Anxiety",
      "irregular-periods": "Irregular Periods",
      "headaches": "Headaches",
      "night-sweats": "Night Sweats",
      "memory-issues": "Memory Issues",
      "gut": "Gut Health",
      // Brain Pillar Assessments
      "brain-brain-fog-assessment": "Brain Fog Assessment",
      "brain-memory-&-focus-analysis": "Memory & Focus Analysis",
      // Body Pillar Assessments
      "body-energy-&-fatigue-assessment": "Energy & Fatigue Assessment",
      "body-mobility-&-strength-analysis": "Mobility & Strength Analysis",
      // Balance Pillar Assessments
      "balance-stress-&-anxiety-assessment": "Stress & Anxiety Assessment",
      "balance-hormonal-balance-evaluation": "Hormonal Balance Evaluation",
      // Beauty Pillar Assessments
      "beauty-skin-health-assessment": "Skin Health Assessment",
      "beauty-beauty-&-aging-analysis": "Beauty & Aging Analysis"
    };
    return nameMap[id] || id;
  };

  const isPillarAssessment = symptomId?.includes('-');
  const pillarName = isPillarAssessment ? symptomId?.split('-')[0] : null;
  
  const getBackRoute = () => {
    if (isPillarAssessment && pillarName) {
      return `/pillars?pillar=${pillarName}`;
    }
    return '/symptoms';
  };

  const getBackText = () => {
    if (isPillarAssessment && pillarName) {
      return `Back to ${pillarName.charAt(0).toUpperCase() + pillarName.slice(1)} Pillar`;
    }
    return 'Back to Symptoms';
  };

  if (!symptomId || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Assessment Not Available</h1>
            <p className="text-muted-foreground mb-6">
              This symptom assessment is not yet available.
            </p>
            <Button onClick={() => navigate(getBackRoute())}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {getBackText()}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <CardDescription>
                Thank you for completing the {getSymptomName(symptomId)} assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your responses have been analyzed and personalized recommendations are being prepared.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/symptoms')}>
                  View More Symptoms
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(getBackRoute())}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackText()}
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{getSymptomName(symptomId)} Assessment</h1>
            <p className="text-muted-foreground">
              Please answer all questions to get your personalized recommendations
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {question.type === "radio" && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "textarea" && (
                  <Textarea
                    placeholder={('placeholder' in question) ? question.placeholder : "Enter your response..."}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={4}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={isSubmitting}
              onClick={() => console.log('🔥 Button clicked directly!')}
            >
              {isSubmitting ? "Saving..." : "🚀 Complete Assessment"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SymptomAssessment;