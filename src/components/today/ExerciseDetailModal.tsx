import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Clock, Dumbbell, Lightbulb, BookOpen, ExternalLink } from "lucide-react";
import { getExerciseDetails } from "@/data/exerciseInstructions";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";

interface ExerciseDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: {
    id: string;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    pillar?: string;
  } | null;
  onViewInProtocol?: () => void;
}

export const ExerciseDetailModal = ({ 
  open, 
  onOpenChange, 
  exercise,
  onViewInProtocol 
}: ExerciseDetailModalProps) => {
  const { t } = useTranslation();
  
  if (!exercise) return null;

  const details = getExerciseDetails(exercise.title);
  
  // Parse sets/reps from title if present (e.g., "Lower Body Compound Lifts (3-4 sets x 6-10 reps)")
  const setsRepsMatch = exercise.title.match(/\((\d+-?\d*)\s*sets?\s*[x×]\s*(\d+-?\d*)\s*reps?\)/i);
  const sets = setsRepsMatch?.[1];
  const reps = setsRepsMatch?.[2];
  const cleanTitle = exercise.title.replace(/\s*\([^)]*sets?[^)]*\)/i, '').trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏋️</span>
            <DialogTitle className="text-xl">{cleanTitle}</DialogTitle>
            <ScienceBackedIcon className="w-4 h-4" showTooltip={true} />
          </div>
          <DialogDescription className="text-base flex items-center gap-2 flex-wrap">
            {sets && reps && (
              <Badge variant="secondary" className="font-medium">
                {sets} {t('today.exerciseDetail.sets')} × {reps} {t('today.exerciseDetail.reps')}
              </Badge>
            )}
            {exercise.pillar && (
              <Badge variant="outline" className="capitalize bg-primary/5 text-primary border-primary/20">
                {exercise.pillar}
              </Badge>
            )}
            {exercise.estimatedMinutes && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {t('today.exerciseDetail.estimatedTime')}: {exercise.estimatedMinutes} min
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Exercises to include */}
          {details?.exercises && details.exercises.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-primary" />
                {t('today.exerciseDetail.exercises')}
                <Badge variant="secondary">{details.exercises.length}</Badge>
              </h3>
              <div className="space-y-2">
                {details.exercises.map((ex, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="font-bold text-primary">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-foreground">{ex.name}</p>
                      <p className="text-sm text-muted-foreground">{ex.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {details?.tips && details.tips.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  {t('today.exerciseDetail.tips')}
                </h3>
                <ul className="space-y-2">
                  {details.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Beginner Tip */}
          {details?.beginnerModification && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-700 dark:text-green-300 flex items-center gap-2 mb-2">
                  🌱 {t('today.exerciseDetail.beginnerTip')}
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {details.beginnerModification}
                </p>
              </div>
            </>
          )}

          {/* Source */}
          {details?.source && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <BookOpen className="w-4 h-4" />
              <span>{t('today.exerciseDetail.source')}: {details.source}</span>
            </div>
          )}

          {/* Fallback when no instructions found */}
          {!details && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="mb-4">{exercise.description || t('today.exerciseDetail.noInstructions')}</p>
              <p className="text-sm">{t('today.exerciseDetail.checkProtocol')}</p>
            </div>
          )}

          {/* Action buttons */}
          {onViewInProtocol && (
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onViewInProtocol();
                }}
                className="w-full gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t('today.exerciseDetail.viewInProtocol')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
