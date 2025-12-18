import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Zap, Timer, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { generateDailyExerciseSnackSchedule, EXERCISE_SNACKS_PROTOCOL } from '@/data/exerciseSnacksProtocol';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExerciseSnacksCardProps {
  userId?: string;
}

export const ExerciseSnacksCard = ({ userId }: ExerciseSnacksCardProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [completedSnacks, setCompletedSnacks] = useState<Set<string>>(new Set());
  const [dailySnacks, setDailySnacks] = useState(() => generateDailyExerciseSnackSchedule());

  // Load completed snacks from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `exercise_snacks_${userId || 'guest'}_${today}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCompletedSnacks(new Set(JSON.parse(saved)));
    }
  }, [userId]);

  const toggleSnack = (snackId: string) => {
    setCompletedSnacks(prev => {
      const next = new Set(prev);
      if (next.has(snackId)) {
        next.delete(snackId);
      } else {
        next.add(snackId);
      }
      
      // Save to localStorage
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `exercise_snacks_${userId || 'guest'}_${today}`;
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      
      return next;
    });
  };

  const completedCount = completedSnacks.size;
  const progressPercent = (completedCount / 3) * 100;

  const snacksList = [
    { key: 'morning', snack: dailySnacks.morning, emoji: '☀️' },
    { key: 'afternoon', snack: dailySnacks.afternoon, emoji: '🌤️' },
    { key: 'evening', snack: dailySnacks.evening, emoji: '🌙' }
  ];

  return (
    <Card className="overflow-hidden border-2 border-orange-500/20 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-orange-100/50 dark:hover:bg-orange-900/20 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{t('today.exerciseSnacks.title')}</h3>
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300">
                      <Timer className="h-3 w-3 mr-1" />
                      3 min total
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('today.exerciseSnacks.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge 
                  variant={completedCount === 3 ? "default" : "outline"}
                  className={completedCount === 3 ? "bg-green-500" : ""}
                >
                  {t('today.exerciseSnacks.completed', { count: completedCount })}
                </Badge>
                {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <Progress value={progressPercent} className="h-2 bg-orange-100 dark:bg-orange-900/30" />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {snacksList.map(({ key, snack, emoji }) => {
              const isCompleted = completedSnacks.has(snack.id);
              return (
                <div
                  key={key}
                  className={`p-3 rounded-lg border transition-all ${
                    isCompleted 
                      ? 'bg-green-50/50 border-green-500/30 dark:bg-green-950/20' 
                      : 'bg-background border-border hover:border-orange-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isCompleted}
                      onCheckedChange={() => toggleSnack(snack.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{emoji}</span>
                        <span className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                          {t(snack.nameKey)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          60s
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{t(snack.descriptionKey)}</p>
                    </div>
                    {!isCompleted && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toggleSnack(snack.id)}
                        className="shrink-0"
                      >
                        {t('today.exerciseSnacks.markComplete')}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Research Citation */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                📚 {t('today.exerciseSnacks.research')}
                <a 
                  href="https://www.nature.com/articles/s41591-022-02100-x" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {t('today.exerciseSnacks.viewResearch')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
