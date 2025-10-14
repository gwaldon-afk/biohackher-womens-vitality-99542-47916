import { cn } from "@/lib/utils";
import { Target, FileText, Calendar, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useLISData } from "@/hooks/useLISData";
import { useProtocols } from "@/hooks/useProtocols";

interface JourneyMapProps {
  currentStep?: 'goals' | 'assess' | 'plan' | 'track' | 'review';
  compact?: boolean;
  onStepClick?: (step: 'goals' | 'assess' | 'plan' | 'track' | 'review') => void;
}

export const JourneyMap = ({ currentStep = 'goals', compact = false, onStepClick }: JourneyMapProps) => {
  const { goals } = useGoals();
  const { dailyScores } = useLISData();
  const { protocols } = useProtocols();

  const activeGoals = goals.filter(g => g.status === 'active');
  const hasGoals = activeGoals.length > 0;
  const hasAssessments = (dailyScores?.length || 0) > 0;
  const hasProtocols = (protocols?.length || 0) > 0;
  const hasTracking = hasAssessments && hasProtocols;

  const steps = [
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      completed: hasGoals,
      description: 'Set health objectives'
    },
    {
      id: 'assess',
      label: 'Assess',
      icon: FileText,
      completed: hasAssessments,
      description: 'Track daily metrics'
    },
    {
      id: 'plan',
      label: 'Plan',
      icon: Calendar,
      completed: hasProtocols,
      description: 'Build your protocol'
    },
    {
      id: 'track',
      label: 'Track',
      icon: TrendingUp,
      completed: hasTracking,
      description: 'Monitor adherence'
    },
    {
      id: 'review',
      label: 'Review',
      icon: Sparkles,
      completed: false,
      description: 'Get insights'
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-2 w-full">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = step.completed;
          
          return (
            <>
              <div 
                key={step.id}
                onClick={() => onStepClick?.(step.id as any)}
                className={cn(
                  "flex items-center justify-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex-1",
                  onStepClick && "cursor-pointer hover:opacity-80",
                  isCurrent && "bg-primary text-primary-foreground shadow-sm",
                  !isCurrent && isCompleted && "bg-green-100 text-green-700",
                  !isCurrent && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <StepIcon className="h-3 w-3" />
                )}
                <span>{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-3 h-0.5 flex-shrink-0",
                  index < currentStepIndex ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Your Health Journey
      </h4>
      <div className="flex gap-2 w-full">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isCurrent = step.id === currentStep;
          const isCompleted = step.completed;
          const isPast = index < currentStepIndex;
          
          return (
            <div
              key={step.id}
              onClick={() => onStepClick?.(step.id as any)}
              className={cn(
                "relative flex flex-col items-center text-center p-3 rounded-lg border-2 transition-all flex-1",
                onStepClick && "cursor-pointer hover:opacity-80",
                isCurrent && "border-primary bg-primary/5 shadow-sm",
                !isCurrent && isCompleted && "border-green-500 bg-green-50",
                !isCurrent && !isCompleted && isPast && "border-amber-500 bg-amber-50",
                !isCurrent && !isCompleted && !isPast && "border-muted bg-muted/20"
              )}
            >
              <div className={cn(
                "mb-2 p-2 rounded-full",
                isCurrent && "bg-primary text-primary-foreground",
                !isCurrent && isCompleted && "bg-green-500 text-white",
                !isCurrent && !isCompleted && "bg-muted"
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <StepIcon className="h-4 w-4" />
                )}
              </div>
              <span className={cn(
                "text-xs font-semibold mb-1",
                isCurrent && "text-primary",
                !isCurrent && isCompleted && "text-green-700",
                !isCurrent && !isCompleted && "text-muted-foreground"
              )}>
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {step.description}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
