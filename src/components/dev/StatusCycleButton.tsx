import { Circle, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ItemStatus } from '@/types/checklist';
import { useTranslation } from 'react-i18next';

interface StatusCycleButtonProps {
  status: ItemStatus;
  onCycle: () => void;
}

const statusConfig: Record<ItemStatus, { icon: typeof Circle; color: string; next: ItemStatus }> = {
  untested: { icon: Circle, color: 'text-muted-foreground', next: 'pass' },
  pass: { icon: CheckCircle2, color: 'text-green-500', next: 'review' },
  review: { icon: AlertTriangle, color: 'text-amber-500', next: 'fail' },
  fail: { icon: XCircle, color: 'text-red-500', next: 'untested' },
};

export const StatusCycleButton = ({ status, onCycle }: StatusCycleButtonProps) => {
  const { t } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;

  const statusLabels: Record<ItemStatus, string> = {
    untested: t('devChecklist.statusUntested'),
    pass: t('devChecklist.statusPass'),
    review: t('devChecklist.statusReview'),
    fail: t('devChecklist.statusFail'),
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onCycle}
        >
          <Icon className={`h-5 w-5 ${config.color}`} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{statusLabels[status]} → {statusLabels[config.next]}</p>
      </TooltipContent>
    </Tooltip>
  );
};
