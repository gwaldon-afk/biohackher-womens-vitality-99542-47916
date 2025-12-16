import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const answerSchema = z.object({
  stage: z.string().min(1, "Please select an option"),
  hormone_medication: z.array(z.string()).min(1, "Please select at least one option"),
  symptoms: z.array(z.string()).min(1, "Please select at least one symptom"),
  sleep: z.number().min(0).max(10),
  mood: z.number().min(0).max(10),
  energy: z.number().min(0).max(10),
  skin: z.number().min(0).max(10),
});

type Question = {
  id: keyof z.infer<typeof answerSchema>;
  labelKey: string;
  type: 'radio' | 'slider' | 'checkbox';
  optionKeys?: string[];
  min?: number;
  max?: number;
  lowLabelKey?: string;
  highLabelKey?: string;
};

const MenoMapMenopause = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string | string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  const questions: Question[] = [
    {
      id: 'stage',
      labelKey: 'onboarding.hormoneCompassMenopause.questions.stage.label',
      type: 'radio' as const,
      optionKeys: [
        'onboarding.hormoneCompassMenopause.questions.stage.options.regular',
        'onboarding.hormoneCompassMenopause.questions.stage.options.irregular',
        'onboarding.hormoneCompassMenopause.questions.stage.options.noCycles',
        'onboarding.hormoneCompassMenopause.questions.stage.options.notSure',
      ],
    },
    {
      id: 'hormone_medication',
      labelKey: 'onboarding.hormoneCompassMenopause.questions.medication.label',
      type: 'checkbox' as const,
      optionKeys: [
        'onboarding.hormoneCompassMenopause.questions.medication.options.birthControl',
        'onboarding.hormoneCompassMenopause.questions.medication.options.hormonalIUD',
        'onboarding.hormoneCompassMenopause.questions.medication.options.hrt',
        'onboarding.hormoneCompassMenopause.questions.medication.options.thyroid',
        'onboarding.hormoneCompassMenopause.questions.medication.options.fertility',
        'onboarding.hormoneCompassMenopause.questions.medication.options.testosterone',
        'onboarding.hormoneCompassMenopause.questions.medication.options.other',
        'onboarding.hormoneCompassMenopause.questions.medication.options.none',
      ],
    },
    { 
      id: 'symptoms', 
      labelKey: 'onboarding.hormoneCompassMenopause.questions.symptoms.label',
      type: 'checkbox' as const,
      optionKeys: [
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.hotFlashes',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.irregularPeriods',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.brainFog',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.weightChanges',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.lowLibido',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.digestive',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.jointPain',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.headaches',
        'onboarding.hormoneCompassMenopause.questions.symptoms.options.none',
      ],
    },
    { 
      id: 'sleep', 
      labelKey: 'menomap.assessment.questions.sleep',
      type: 'slider' as const, 
      min: 0, 
      max: 10,
      lowLabelKey: 'menomap.assessment.labels.veryPoor',
      highLabelKey: 'menomap.assessment.labels.excellent'
    },
    { 
      id: 'mood', 
      labelKey: 'menomap.assessment.questions.mood',
      type: 'slider' as const, 
      min: 0, 
      max: 10,
      lowLabelKey: 'menomap.assessment.labels.veryUnstable',
      highLabelKey: 'menomap.assessment.labels.veryStable'
    },
    { 
      id: 'energy', 
      labelKey: 'menomap.assessment.questions.energy',
      type: 'slider' as const, 
      min: 0, 
      max: 10,
      lowLabelKey: 'menomap.assessment.labels.veryLow',
      highLabelKey: 'menomap.assessment.labels.veryHigh'
    },
    { 
      id: 'skin', 
      labelKey: 'menomap.assessment.questions.skin',
      type: 'slider' as const, 
      min: 0, 
      max: 10,
      lowLabelKey: 'menomap.assessment.labels.veryPoor',
      highLabelKey: 'menomap.assessment.labels.excellent'
    },
  ];

  const handleSliderAnswer = (value: number) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleRadioAnswer = (value: string) => {
    const question = questions[currentQuestion];
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
  };

  const handleCheckboxAnswer = (option: string) => {
    const question = questions[currentQuestion];
    const currentValues = (answers[question.id] as string[]) || [];
    
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option];
    
    setAnswers((prev) => ({ ...prev, [question.id]: newValues }));
  };

  const calculateBioScore = (answers: Record<string, number | string | string[]>): number => {
    const numericAnswers = Object.entries(answers)
      .filter(([_, v]) => typeof v === 'number')
      .map(([_, v]) => v as number);
    const avgScore = numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length;
    return Math.round((avgScore / 10) * 100);
  };

  const saveToSupabase = async (bioScore: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('menomap_assessments')
        .insert({
          user_id: user.id,
          assessment_type: 'quick',
          answers: answers,
          bio_score: bioScore,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving assessment:', error);
      return false;
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Validate all answers
      try {
        answerSchema.parse(answers);
      } catch (error) {
        toast({
          title: t('menomap.errors.validationFailed'),
          description: t('menomap.errors.validationFailedDescription'),
          variant: "destructive",
        });
        return;
      }

      setIsSaving(true);
      const bioScore = calculateBioScore(answers);
      
      // Save to Supabase if user is logged in
      if (user) {
        const success = await saveToSupabase(bioScore);
        if (!success) {
          toast({
            title: t('menomap.errors.saveFailed'),
            description: t('menomap.errors.saveFailedDescription'),
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }
      }
      
      // Fallback to localStorage for backward compatibility
      localStorage.setItem('bio_score', bioScore.toString());
      localStorage.setItem('menomap_answers', JSON.stringify(answers));
      localStorage.setItem('menomap_assessment_type', 'quick');
      
      setIsSaving(false);
      navigate('/onboarding/menomap-results');
    }
  };

  const question = questions[currentQuestion];
  const currentValue = answers[question.id];
  const canProceed = currentValue !== undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20 bg-gradient-to-b from-background to-muted/20">
      <div className="fixed top-0 left-0 right-0 h-14 bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50 flex items-center justify-between px-4">
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => navigate('/onboarding/menomap-entry')}
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
          {!isMobile && <span className="ml-2">{t('onboarding.hormoneCompassMenopause.back')}</span>}
        </Button>
        
        <Button 
          variant="outline" 
          size="default" 
          onClick={() => navigate('/')}
          aria-label="Exit assessment"
        >
          <X className="h-6 w-6" />
          {!isMobile && <span className="ml-2">{t('onboarding.hormoneCompassMenopause.exit')}</span>}
        </Button>
      </div>

      <div className="max-w-xl w-full space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">{t('menomap.assessment.title')}</h1>
          <p className="text-muted-foreground" aria-live="polite">
            {t('menomap.assessment.progress', { current: currentQuestion + 1, total: questions.length })}
          </p>
        </header>

        <Card className="p-8 space-y-8" role="region" aria-labelledby="question-label">
          <div className="space-y-4">
            <Label id="question-label" className="text-xl font-medium">{t(question.labelKey)}</Label>

            {question.type === 'slider' && (
              <fieldset className="space-y-4">
                <legend className="sr-only">{t(question.labelKey)}</legend>
                <Slider
                  value={[typeof currentValue === 'number' ? currentValue : 5]}
                  onValueChange={([value]) => handleSliderAnswer(value)}
                  min={question.min}
                  max={question.max}
                  step={1}
                  className="w-full"
                  aria-label={t(question.labelKey)}
                  aria-valuemin={question.min}
                  aria-valuemax={question.max}
                  aria-valuenow={typeof currentValue === 'number' ? currentValue : 5}
                  aria-valuetext={`${typeof currentValue === 'number' ? currentValue : 5} out of 10`}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{t(question.lowLabelKey || 'menomap.assessment.labels.veryPoor')}</span>
                  <span className="text-lg font-semibold text-foreground" aria-live="polite">
                    {typeof currentValue === 'number' ? currentValue : 5}/10
                  </span>
                  <span>{t(question.highLabelKey || 'menomap.assessment.labels.excellent')}</span>
                </div>
              </fieldset>
            )}

            {question.type === 'radio' && question.optionKeys && (
              <RadioGroup value={currentValue as string || ""} onValueChange={handleRadioAnswer}>
                <fieldset>
                  <legend className="sr-only">{t(question.labelKey)}</legend>
                  {question.optionKeys.map((optionKey) => (
                    <div key={optionKey} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={t(optionKey)} id={optionKey} />
                      <Label htmlFor={optionKey} className="cursor-pointer flex-1">
                        {t(optionKey)}
                      </Label>
                    </div>
                  ))}
                </fieldset>
              </RadioGroup>
            )}

            {question.type === 'checkbox' && question.optionKeys && (
              <div className="space-y-2">
                {question.optionKeys.map((optionKey) => (
                  <div key={optionKey} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50">
                    <Checkbox
                      id={optionKey}
                      checked={(currentValue as string[] || []).includes(t(optionKey))}
                      onCheckedChange={() => handleCheckboxAnswer(t(optionKey))}
                    />
                    <Label htmlFor={optionKey} className="cursor-pointer flex-1">
                      {t(optionKey)}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            onClick={handleNext} 
            disabled={!canProceed || isSaving} 
            className="w-full" 
            size="lg"
            aria-busy={isSaving}
          >
            {isSaving 
              ? t('common.loading') 
              : currentQuestion < questions.length - 1 
                ? t('menomap.assessment.nextQuestion') 
                : t('menomap.assessment.completeAssessment')
            }
          </Button>
        </Card>

        <div className="flex justify-center gap-2" role="progressbar" aria-valuenow={currentQuestion + 1} aria-valuemin={1} aria-valuemax={questions.length}>
          <span className="sr-only">
            {t('menomap.assessment.progress', { current: currentQuestion + 1, total: questions.length })}
          </span>
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-8 rounded-full transition-all ${
                index === currentQuestion
                  ? 'bg-primary'
                  : index < currentQuestion
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
              aria-label={`Question ${index + 1} ${index === currentQuestion ? 'current' : index < currentQuestion ? 'completed' : 'upcoming'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenoMapMenopause;
