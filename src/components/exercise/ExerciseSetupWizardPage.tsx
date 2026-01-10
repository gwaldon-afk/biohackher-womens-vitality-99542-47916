/**
 * Exercise Setup Wizard Page Component
 * 
 * A full-page version of the wizard (not in a modal) for use on dedicated pages.
 * Two-path setup flow:
 * - Smart Match: Based on assessment + life stage, recommends programs
 * - Build Your Own: Custom preferences for equipment, duration, goals
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Wrench, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Dumbbell,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmartMatchFlow } from './wizard/SmartMatchFlow';
import { BuildYourOwnFlow } from './wizard/BuildYourOwnFlow';
import { ProgramSelection } from './wizard/ProgramSelection';
import { ProgramConfirmation } from './wizard/ProgramConfirmation';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import type { ExerciseProgram } from '@/data/exercisePrograms';
import type { ExercisePreferences } from './ExerciseSetupWizard';

interface ExerciseSetupWizardPageProps {
  onComplete: () => void;
  onBack: () => void;
}

type WizardStep = 'path-selection' | 'smart-match' | 'build-your-own' | 'program-selection' | 'confirmation';

export const ExerciseSetupWizardPage = ({ onComplete, onBack }: ExerciseSetupWizardPageProps) => {
  const { t } = useTranslation();
  const { saveProgram, saving } = useExerciseProgram();
  const [currentStep, setCurrentStep] = useState<WizardStep>('path-selection');
  const [preferences, setPreferences] = useState<ExercisePreferences>({ path: 'smart-match' });
  const [selectedProgram, setSelectedProgram] = useState<ExerciseProgram | null>(null);
  const [matchedPrograms, setMatchedPrograms] = useState<ExerciseProgram[]>([]);

  const getStepNumber = (): number => {
    switch (currentStep) {
      case 'path-selection': return 1;
      case 'smart-match':
      case 'build-your-own': return 2;
      case 'program-selection': return 3;
      case 'confirmation': return 4;
      default: return 1;
    }
  };

  const totalSteps = 4;
  const progress = (getStepNumber() / totalSteps) * 100;

  const handlePathSelect = (path: 'smart-match' | 'build-your-own') => {
    setPreferences({ ...preferences, path });
    setCurrentStep(path);
  };

  const handleSmartMatchComplete = (data: Partial<ExercisePreferences>, programs: ExerciseProgram[]) => {
    setPreferences({ ...preferences, ...data });
    setMatchedPrograms(programs);
    setCurrentStep('program-selection');
  };

  const handleBuildYourOwnComplete = (data: Partial<ExercisePreferences>, programs: ExerciseProgram[]) => {
    setPreferences({ ...preferences, ...data });
    setMatchedPrograms(programs);
    setCurrentStep('program-selection');
  };

  const handleProgramSelect = (program: ExerciseProgram) => {
    setSelectedProgram(program);
    setCurrentStep('confirmation');
  };

  const handleConfirm = async () => {
    if (selectedProgram) {
      const success = await saveProgram({
        programKey: selectedProgram.key,
        setupMethod: preferences.path === 'smart-match' ? 'smart_match' : 'build_your_own',
        fitnessLevel: preferences.fitnessLevel,
        healthConsiderations: preferences.healthConsiderations,
        availableEquipment: preferences.equipment,
        preferredDaysPerWeek: preferences.daysPerWeek,
        primaryGoals: preferences.primaryGoals,
      });

      if (success) {
        onComplete();
      }
    }
  };

  const handleBackStep = () => {
    switch (currentStep) {
      case 'path-selection':
        onBack();
        break;
      case 'smart-match':
      case 'build-your-own':
        setCurrentStep('path-selection');
        break;
      case 'program-selection':
        setCurrentStep(preferences.path);
        break;
      case 'confirmation':
        setCurrentStep('program-selection');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="bg-card border rounded-lg px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {t('exerciseWizard.title')}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t('exerciseWizard.subtitle')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('exerciseWizard.step', { current: getStepNumber(), total: totalSteps })}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border rounded-lg px-6 py-6 shadow-sm">
        <AnimatePresence mode="wait">
          {currentStep === 'path-selection' && (
            <motion.div
              key="path-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PathSelection onSelect={handlePathSelect} />
            </motion.div>
          )}

          {currentStep === 'smart-match' && (
            <motion.div
              key="smart-match"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SmartMatchFlow 
                onComplete={handleSmartMatchComplete}
                onBack={handleBackStep}
              />
            </motion.div>
          )}

          {currentStep === 'build-your-own' && (
            <motion.div
              key="build-your-own"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BuildYourOwnFlow 
                onComplete={handleBuildYourOwnComplete}
                onBack={handleBackStep}
              />
            </motion.div>
          )}

          {currentStep === 'program-selection' && (
            <motion.div
              key="program-selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProgramSelection 
                programs={matchedPrograms}
                preferences={preferences}
                onSelect={handleProgramSelect}
                onBack={handleBackStep}
              />
            </motion.div>
          )}

          {currentStep === 'confirmation' && selectedProgram && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProgramConfirmation 
                program={selectedProgram}
                onConfirm={handleConfirm}
                onBack={handleBackStep}
                onChangeProgram={() => setCurrentStep('program-selection')}
                saving={saving}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Path Selection Component
interface PathSelectionProps {
  onSelect: (path: 'smart-match' | 'build-your-own') => void;
}

const PathSelection = ({ onSelect }: PathSelectionProps) => {
  const { t } = useTranslation();

  const paths = [
    {
      id: 'smart-match' as const,
      icon: Sparkles,
      titleKey: 'exerciseWizard.paths.smartMatch.title',
      descriptionKey: 'exerciseWizard.paths.smartMatch.description',
      features: [
        'exerciseWizard.paths.smartMatch.feature1',
        'exerciseWizard.paths.smartMatch.feature2',
        'exerciseWizard.paths.smartMatch.feature3'
      ],
      badge: 'exerciseWizard.paths.smartMatch.badge',
      color: 'bg-primary/10 text-primary border-primary/20'
    },
    {
      id: 'build-your-own' as const,
      icon: Wrench,
      titleKey: 'exerciseWizard.paths.buildYourOwn.title',
      descriptionKey: 'exerciseWizard.paths.buildYourOwn.description',
      features: [
        'exerciseWizard.paths.buildYourOwn.feature1',
        'exerciseWizard.paths.buildYourOwn.feature2',
        'exerciseWizard.paths.buildYourOwn.feature3'
      ],
      badge: null,
      color: 'bg-secondary text-secondary-foreground border-secondary'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{t('exerciseWizard.pathSelection.title')}</h3>
        <p className="text-muted-foreground">{t('exerciseWizard.pathSelection.description')}</p>
      </div>

      <div className="space-y-4">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <Card
              key={path.id}
              onClick={() => onSelect(path.id)}
              className="p-5 cursor-pointer transition-all duration-200 hover:border-primary hover:shadow-md group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${path.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{t(path.titleKey)}</h4>
                    {path.badge && (
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                        {t(path.badge)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{t(path.descriptionKey)}</p>
                  <ul className="space-y-1">
                    {path.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{t(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExerciseSetupWizardPage;
