/**
 * Smart Match Flow
 * 
 * Uses assessment data and life stage to recommend the best program.
 * Asks minimal questions to refine recommendations.
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Activity,
  Heart,
  Bone,
  Brain,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { exercisePrograms, calculateProgramMatchScore, type ExerciseProgram } from '@/data/exercisePrograms';
import type { ExercisePreferences } from '../ExerciseSetupWizard';

interface SmartMatchFlowProps {
  onComplete: (data: Partial<ExercisePreferences>, programs: ExerciseProgram[]) => void;
  onBack: () => void;
}

type SmartMatchStep = 'fitness-level' | 'considerations' | 'analyzing';

const FITNESS_LEVELS = [
  { id: 'beginner', icon: Activity, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'intermediate', icon: Zap, color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'advanced', icon: Heart, color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
];

const HEALTH_CONSIDERATIONS = [
  { id: 'joint-concerns', icon: '🦴' },
  { id: 'pelvic-floor', icon: '💪' },
  { id: 'bone-health', icon: '🦷' },
  { id: 'menopause', icon: '🌸' },
  { id: 'postnatal', icon: '👶' },
  { id: 'back-pain', icon: '🔙' },
  { id: 'none', icon: '✓' }
];

export const SmartMatchFlow = ({ onComplete, onBack }: SmartMatchFlowProps) => {
  const { t } = useTranslation();
  const { profile } = useHealthProfile();
  const [step, setStep] = useState<SmartMatchStep>('fitness-level');
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [considerations, setConsiderations] = useState<string[]>([]);

  const toggleConsideration = (id: string) => {
    if (id === 'none') {
      setConsiderations(['none']);
    } else {
      setConsiderations(prev => {
        const filtered = prev.filter(c => c !== 'none');
        return filtered.includes(id) 
          ? filtered.filter(c => c !== id)
          : [...filtered, id];
      });
    }
  };

  const handleFitnessNext = () => {
    if (fitnessLevel) {
      setStep('considerations');
    }
  };

  const handleConsiderationsNext = () => {
    setStep('analyzing');
    
    // Simulate analysis delay for better UX
    setTimeout(() => {
      // Calculate program matches
      const intensityValue: 'low' | 'moderate' | 'high' = 
        fitnessLevel === 'advanced' ? 'high' : fitnessLevel === 'intermediate' ? 'moderate' : 'low';
      
      const userPreferences = {
        equipment: ['dumbbells', 'bodyweight'], // Default assumption
        daysPerWeek: 3,
        sessionDuration: 35,
        intensity: intensityValue,
        goals: ['build-strength', 'improve-fitness'],
        considerations: considerations.filter(c => c !== 'none')
      };

      const scoredPrograms = exercisePrograms
        .map(program => ({
          program,
          score: calculateProgramMatchScore(program, userPreferences)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(sp => sp.program);

      onComplete(
        { 
          fitnessLevel: fitnessLevel!, 
          healthConsiderations: considerations.filter(c => c !== 'none')
        }, 
        scoredPrograms
      );
    }, 1500);
  };

  const handleStepBack = () => {
    if (step === 'considerations') {
      setStep('fitness-level');
    } else {
      onBack();
    }
  };

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">{t('exerciseWizard.smartMatch.analyzing.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('exerciseWizard.smartMatch.analyzing.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 'fitness-level' && (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{t('exerciseWizard.smartMatch.fitnessLevel.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('exerciseWizard.smartMatch.fitnessLevel.description')}</p>
          </div>

          <div className="space-y-3">
            {FITNESS_LEVELS.map((level) => {
              const Icon = level.icon;
              const isSelected = fitnessLevel === level.id;
              return (
                <Card
                  key={level.id}
                  onClick={() => setFitnessLevel(level.id as typeof fitnessLevel)}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${level.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{t(`exerciseWizard.smartMatch.fitnessLevel.levels.${level.id}.title`)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t(`exerciseWizard.smartMatch.fitnessLevel.levels.${level.id}.description`)}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                    }`}>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button 
              onClick={handleFitnessNext} 
              disabled={!fitnessLevel}
              className="flex-1"
            >
              {t('common.continue')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {step === 'considerations' && (
        <>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{t('exerciseWizard.smartMatch.considerations.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('exerciseWizard.smartMatch.considerations.description')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {HEALTH_CONSIDERATIONS.map((consideration) => {
              const isSelected = considerations.includes(consideration.id);
              return (
                <Card
                  key={consideration.id}
                  onClick={() => toggleConsideration(consideration.id)}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{consideration.icon}</span>
                    <span className="text-sm font-medium flex-1">
                      {t(`exerciseWizard.smartMatch.considerations.options.${consideration.id}`)}
                    </span>
                    <Checkbox checked={isSelected} />
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleStepBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('common.back')}
            </Button>
            <Button 
              onClick={handleConsiderationsNext}
              className="flex-1"
            >
              {t('exerciseWizard.smartMatch.findPrograms')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
