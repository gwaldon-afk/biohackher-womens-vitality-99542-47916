/**
 * Program Confirmation
 * 
 * Final step showing program details and week 1 preview.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  Dumbbell,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import type { ExerciseProgram } from '@/data/exercisePrograms';

interface ProgramConfirmationProps {
  program: ExerciseProgram;
  onConfirm: () => void;
  onBack: () => void;
  onChangeProgram: () => void;
}

export const ProgramConfirmation = ({ program, onConfirm, onBack, onChangeProgram }: ProgramConfirmationProps) => {
  const { t } = useTranslation();
  
  const week1 = program.weeklyStructure[0];

  return (
    <div className="space-y-6">
      {/* Program header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Dumbbell className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">{program.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
        </div>
      </div>

      {/* Program stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center p-3">
          <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-semibold">{program.durationWeeks}</p>
          <p className="text-xs text-muted-foreground">{t('exerciseWizard.confirmation.weeks')}</p>
        </Card>
        <Card className="text-center p-3">
          <Dumbbell className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-semibold">{program.sessionsPerWeek}x</p>
          <p className="text-xs text-muted-foreground">{t('exerciseWizard.confirmation.perWeek')}</p>
        </Card>
        <Card className="text-center p-3">
          <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-semibold">~{week1?.days[0]?.estimatedDuration || 30}</p>
          <p className="text-xs text-muted-foreground">{t('exerciseWizard.confirmation.minsSession')}</p>
        </Card>
      </div>

      {/* Benefits */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            {t('exerciseWizard.confirmation.whatYoullGain')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {program.benefits.slice(0, 4).map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Week 1 Preview */}
      {week1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t('exerciseWizard.confirmation.week1Preview')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {week1.days.map((day) => (
                <div 
                  key={day.dayNumber}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {day.dayNumber}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{day.name}</p>
                      <p className="text-xs text-muted-foreground">{day.focus}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{day.estimatedDuration} {t('exerciseWizard.confirmation.mins')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Equipment needed */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">{t('exerciseWizard.confirmation.equipment')}:</span>
        {program.equipmentRequired.map((eq) => (
          <Badge key={eq} variant="outline" className="text-xs">
            {t(`exerciseWizard.equipment.${eq}`, { defaultValue: eq.replace(/-/g, ' ') })}
          </Badge>
        ))}
        {program.equipmentOptional?.map((eq) => (
          <Badge key={eq} variant="secondary" className="text-xs">
            {t(`exerciseWizard.equipment.${eq}`, { defaultValue: eq.replace(/-/g, ' ') })} ({t('exerciseWizard.confirmation.optional')})
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        <Button onClick={onConfirm} className="w-full" size="lg">
          <Check className="mr-2 h-4 w-4" />
          {t('exerciseWizard.confirmation.startProgram')}
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onChangeProgram} className="flex-1">
            {t('exerciseWizard.confirmation.chooseAnother')}
          </Button>
          <Button variant="ghost" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    </div>
  );
};
