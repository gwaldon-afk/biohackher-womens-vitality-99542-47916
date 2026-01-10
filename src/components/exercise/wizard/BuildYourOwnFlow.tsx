/**
 * Build Your Own Flow
 * 
 * Custom preferences for equipment, duration, goals, and intensity.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Loader2,
  Dumbbell,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { exercisePrograms, calculateProgramMatchScore, type ExerciseProgram } from '@/data/exercisePrograms';
import type { ExercisePreferences } from '../ExerciseSetupWizard';

interface BuildYourOwnFlowProps {
  onComplete: (data: Partial<ExercisePreferences>, programs: ExerciseProgram[]) => void;
  onBack: () => void;
}

type BuildStep = 'equipment' | 'schedule' | 'goals' | 'analyzing';

const EQUIPMENT_OPTIONS = [
  { id: 'dumbbells', icon: '🏋️' },
  { id: 'resistance-band', icon: '🎗️' },
  { id: 'kettlebell', icon: '🔔' },
  { id: 'barbell', icon: '🏋️‍♀️' },
  { id: 'bench', icon: '🪑' },
  { id: 'pull-up-bar', icon: '📊' },
  { id: 'bodyweight-only', icon: '🧘' }
];

const GOAL_OPTIONS = [
  { id: 'build-strength', icon: '💪' },
  { id: 'lose-weight', icon: '⚖️' },
  { id: 'improve-mobility', icon: '🧘‍♀️' },
  { id: 'bone-health', icon: '🦴' },
  { id: 'energy-boost', icon: '⚡' },
  { id: 'maintain-independence', icon: '🏃‍♀️' }
];

const INTENSITY_OPTIONS = [
  { id: 'low', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
  { id: 'moderate', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  { id: 'high', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20' }
];

export const BuildYourOwnFlow = ({ onComplete, onBack }: BuildYourOwnFlowProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<BuildStep>('equipment');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [sessionDuration, setSessionDuration] = useState(30);
  const [goals, setGoals] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  const toggleEquipment = (id: string) => {
    if (id === 'bodyweight-only') {
      setEquipment(['bodyweight-only']);
    } else {
      setEquipment(prev => {
        const filtered = prev.filter(e => e !== 'bodyweight-only');
        return filtered.includes(id) 
          ? filtered.filter(e => e !== id)
          : [...filtered, id];
      });
    }
  };

  const toggleGoal = (id: string) => {
    setGoals(prev => 
      prev.includes(id) 
        ? prev.filter(g => g !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleNext = () => {
    if (step === 'equipment') {
      setStep('schedule');
    } else if (step === 'schedule') {
      setStep('goals');
    } else if (step === 'goals') {
      setStep('analyzing');
      
      setTimeout(() => {
        const userPreferences = {
          equipment: equipment.includes('bodyweight-only') ? ['bodyweight'] : equipment,
          daysPerWeek,
          sessionDuration,
          intensity,
          goals,
          considerations: [] as string[]
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
          { equipment, daysPerWeek, sessionDuration, primaryGoals: goals, intensity },
          scoredPrograms
        );
      }, 1500);
    }
  };

  const handleStepBack = () => {
    if (step === 'schedule') {
      setStep('equipment');
    } else if (step === 'goals') {
      setStep('schedule');
    } else {
      onBack();
    }
  };

  const canContinue = () => {
    if (step === 'equipment') return equipment.length > 0;
    if (step === 'schedule') return true;
    if (step === 'goals') return goals.length > 0;
    return false;
  };

  if (step === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">{t('exerciseWizard.buildYourOwn.analyzing.title')}</h3>
          <p className="text-sm text-muted-foreground">{t('exerciseWizard.buildYourOwn.analyzing.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 'equipment' && (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('exerciseWizard.buildYourOwn.equipment.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('exerciseWizard.buildYourOwn.equipment.description')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {EQUIPMENT_OPTIONS.map((item) => {
              const isSelected = equipment.includes(item.id);
              return (
                <Card
                  key={item.id}
                  onClick={() => toggleEquipment(item.id)}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium flex-1">
                      {t(`exerciseWizard.buildYourOwn.equipment.options.${item.id}`)}
                    </span>
                    <Checkbox checked={isSelected} />
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {step === 'schedule' && (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('exerciseWizard.buildYourOwn.schedule.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('exerciseWizard.buildYourOwn.schedule.description')}</p>
          </div>

          <div className="space-y-8">
            {/* Days per week */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">{t('exerciseWizard.buildYourOwn.schedule.daysPerWeek')}</Label>
                <span className="text-lg font-semibold text-primary">{daysPerWeek} {t('exerciseWizard.buildYourOwn.schedule.days')}</span>
              </div>
              <Slider
                value={[daysPerWeek]}
                onValueChange={(v) => setDaysPerWeek(v[0])}
                min={2}
                max={6}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>2 {t('exerciseWizard.buildYourOwn.schedule.days')}</span>
                <span>6 {t('exerciseWizard.buildYourOwn.schedule.days')}</span>
              </div>
            </div>

            {/* Session duration */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">{t('exerciseWizard.buildYourOwn.schedule.sessionDuration')}</Label>
                <span className="text-lg font-semibold text-primary">{sessionDuration} {t('exerciseWizard.buildYourOwn.schedule.mins')}</span>
              </div>
              <Slider
                value={[sessionDuration]}
                onValueChange={(v) => setSessionDuration(v[0])}
                min={15}
                max={60}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>15 {t('exerciseWizard.buildYourOwn.schedule.mins')}</span>
                <span>60 {t('exerciseWizard.buildYourOwn.schedule.mins')}</span>
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('exerciseWizard.buildYourOwn.schedule.intensity')}</Label>
              <div className="grid grid-cols-3 gap-2">
                {INTENSITY_OPTIONS.map((option) => (
                  <Card
                    key={option.id}
                    onClick={() => setIntensity(option.id as typeof intensity)}
                    className={`p-3 text-center cursor-pointer transition-all ${
                      intensity === option.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'hover:border-primary/50'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {t(`exerciseWizard.buildYourOwn.schedule.intensityLevels.${option.id}`)}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {step === 'goals' && (
        <>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t('exerciseWizard.buildYourOwn.goals.title')}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{t('exerciseWizard.buildYourOwn.goals.description')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = goals.includes(goal.id);
              const isDisabled = goals.length >= 3 && !isSelected;
              return (
                <Card
                  key={goal.id}
                  onClick={() => !isDisabled && toggleGoal(goal.id)}
                  className={`p-3 cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                      : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{goal.icon}</span>
                    <span className="text-sm font-medium flex-1">
                      {t(`exerciseWizard.buildYourOwn.goals.options.${goal.id}`)}
                    </span>
                    <Checkbox checked={isSelected} disabled={isDisabled} />
                  </div>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {t('exerciseWizard.buildYourOwn.goals.selectUpTo', { count: 3 })}
          </p>
        </>
      )}

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={handleStepBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canContinue()}
          className="flex-1"
        >
          {step === 'goals' ? t('exerciseWizard.buildYourOwn.findPrograms') : t('common.continue')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
