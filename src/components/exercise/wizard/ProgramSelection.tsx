/**
 * Program Selection
 * 
 * Shows matched programs with details and allows selection.
 */

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  Calendar,
  Dumbbell,
  Star,
  Check
} from 'lucide-react';
import type { ExerciseProgram } from '@/data/exercisePrograms';
import type { ExercisePreferences } from '../ExerciseSetupWizard';

interface ProgramSelectionProps {
  programs: ExerciseProgram[];
  preferences: ExercisePreferences;
  onSelect: (program: ExerciseProgram) => void;
  onBack: () => void;
}

export const ProgramSelection = ({ programs, preferences, onSelect, onBack }: ProgramSelectionProps) => {
  const { t } = useTranslation();

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'intermediate': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'advanced': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{t('exerciseWizard.programSelection.title')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('exerciseWizard.programSelection.description', { count: programs.length })}
        </p>
      </div>

      <div className="space-y-4">
        {programs.map((program, index) => (
          <Card 
            key={program.key}
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onSelect(program)}
          >
            <CardContent className="p-0">
              <div className="flex">
                {/* Left indicator */}
                <div className={`w-1 ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-foreground">{program.name}</h4>
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            <Star className="h-3 w-3 mr-1" />
                            {t('exerciseWizard.programSelection.bestMatch')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {program.description}
                      </p>
                      
                      {/* Program stats */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{program.durationWeeks} {t('exerciseWizard.programSelection.weeks')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="h-3.5 w-3.5" />
                          <span>{program.sessionsPerWeek}x/{t('exerciseWizard.programSelection.week')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>~{program.weeklyStructure[0]?.days[0]?.estimatedDuration || 30} {t('exerciseWizard.programSelection.mins')}</span>
                        </div>
                        <Badge variant="outline" className={getDifficultyColor(program.difficultyLevel)}>
                          {t(`exerciseWizard.programSelection.difficulty.${program.difficultyLevel}`)}
                        </Badge>
                      </div>
                    </div>
                    
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                  </div>
                  
                  {/* Focus areas */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {program.focusAreas.slice(0, 3).map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {t(`exerciseWizard.focusAreas.${area}`, { defaultValue: area.replace(/-/g, ' ') })}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('exerciseWizard.programSelection.changePreferences')}
        </Button>
      </div>
    </div>
  );
};
