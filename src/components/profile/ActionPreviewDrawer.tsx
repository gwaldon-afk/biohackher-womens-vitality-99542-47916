import { useTranslation } from "react-i18next";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Pill, 
  Dumbbell, 
  Brain, 
  Salad, 
  Heart,
  Clock,
  Calendar,
  Sparkles,
  TrendingUp,
  X,
  Loader2
} from "lucide-react";

export interface ActionItem {
  id: string;
  name: string;
  description: string;
  itemType: 'supplement' | 'therapy' | 'habit' | 'exercise' | 'diet';
  priorityTier: 'immediate' | 'foundation' | 'optimisation';
  sourceAssessment: string;
  evidenceLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  frequency?: string;
  timeOfDay?: string[];
  dosage?: string;
  expectedImpact?: string;
  pillars?: string[];
  sourceInsightId?: string;
  sourceRecommendationId?: string;
}

interface ActionPreviewDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionItem | null;
  onAddToProtocol: (action: ActionItem) => Promise<void>;
  onDismiss?: (action: ActionItem, reason?: string) => void;
  isAdding?: boolean;
}

const typeIcons: Record<string, React.ElementType> = {
  supplement: Pill,
  therapy: Brain,
  habit: Heart,
  exercise: Dumbbell,
  diet: Salad,
};

const priorityColors: Record<string, string> = {
  immediate: 'bg-destructive/10 text-destructive border-destructive/20',
  foundation: 'bg-primary/10 text-primary border-primary/20',
  optimisation: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const evidenceColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  moderate: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  high: 'bg-green-500/10 text-green-700 dark:text-green-400',
  very_high: 'bg-primary/10 text-primary',
};

export function ActionPreviewDrawer({
  open,
  onOpenChange,
  action,
  onAddToProtocol,
  onDismiss,
  isAdding = false,
}: ActionPreviewDrawerProps) {
  const { t } = useTranslation();

  if (!action) return null;

  const Icon = typeIcons[action.itemType] || Heart;

  const handleAddToProtocol = async () => {
    await onAddToProtocol(action);
    onOpenChange(false);
  };

  const handleDismiss = () => {
    onDismiss?.(action);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DrawerTitle className="text-xl">{action.name}</DrawerTitle>
              <DrawerDescription className="mt-1">
                {action.description}
              </DrawerDescription>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className={priorityColors[action.priorityTier]}>
              {t(`whatToDoNext.priority.${action.priorityTier}`)}
            </Badge>
            <Badge variant="secondary">
              {t('whatToDoNext.fromAssessment', { assessment: action.sourceAssessment })}
            </Badge>
            {action.evidenceLevel && (
              <Badge className={evidenceColors[action.evidenceLevel]}>
                {t(`whatToDoNext.evidenceLevel.${action.evidenceLevel}`)}
              </Badge>
            )}
          </div>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            {action.dosage && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Pill className="h-4 w-4" />
                  {t('whatToDoNext.dosage')}
                </div>
                <p className="font-medium">{action.dosage}</p>
              </div>
            )}
            
            {action.frequency && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  {t('whatToDoNext.frequency')}
                </div>
                <p className="font-medium">{action.frequency}</p>
              </div>
            )}
            
            {action.timeOfDay && action.timeOfDay.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  {t('whatToDoNext.timing')}
                </div>
                <p className="font-medium">{action.timeOfDay.join(', ')}</p>
              </div>
            )}
            
            {action.expectedImpact && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4" />
                  {t('whatToDoNext.expectedImpact')}
                </div>
                <p className="font-medium">{action.expectedImpact}</p>
              </div>
            )}
          </div>

          {/* Pillars */}
          {action.pillars && action.pillars.length > 0 && (
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Sparkles className="h-4 w-4" />
                {t('whatToDoNext.pillars')}
              </div>
              <div className="flex flex-wrap gap-2">
                {action.pillars.map((pillar) => (
                  <Badge key={pillar} variant="outline">
                    {pillar}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <Button 
            onClick={handleAddToProtocol} 
            disabled={isAdding}
            className="w-full"
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('common.adding')}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {t('whatToDoNext.addToPlan')}
              </>
            )}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" onClick={handleDismiss}>
              <X className="h-4 w-4 mr-2" />
              {t('whatToDoNext.dismiss')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
