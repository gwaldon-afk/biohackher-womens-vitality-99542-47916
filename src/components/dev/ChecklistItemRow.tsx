import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { StatusCycleButton } from './StatusCycleButton';
import { ItemStatus, ChecklistItemState } from '@/types/checklist';
import { formatDistanceToNow } from 'date-fns';

interface ChecklistItemRowProps {
  id: string;
  label: string;
  path?: string;
  description?: string;
  state: ChecklistItemState;
  onStatusChange: (status: ItemStatus) => void;
  onNotesChange: (notes: string) => void;
}

const cycleStatus = (current: ItemStatus): ItemStatus => {
  const order: ItemStatus[] = ['untested', 'pass', 'review', 'fail'];
  const idx = order.indexOf(current);
  return order[(idx + 1) % order.length];
};

export const ChecklistItemRow = ({
  id,
  label,
  path,
  description,
  state,
  onStatusChange,
  onNotesChange,
}: ChecklistItemRowProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotes, setLocalNotes] = useState(state.notes);

  // Auto-expand when status changes to fail
  useEffect(() => {
    if (state.status === 'fail' && !isOpen) {
      setIsOpen(true);
    }
  }, [state.status]);

  // Sync local notes with state
  useEffect(() => {
    setLocalNotes(state.notes);
  }, [state.notes]);

  const handleCycle = () => {
    const newStatus = cycleStatus(state.status);
    onStatusChange(newStatus);
  };

  const handleNotesBlur = () => {
    if (localNotes !== state.notes) {
      onNotesChange(localNotes);
    }
  };

  const openRoute = () => {
    if (path) {
      window.open(path, '_blank');
    }
  };

  const lastTestedText = state.lastTested
    ? formatDistanceToNow(new Date(state.lastTested), { addSuffix: true })
    : null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <StatusCycleButton status={state.status} onCycle={handleCycle} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium truncate ${
                  state.status === 'pass' ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {label}
              </span>
              {path && (
                <span className="text-muted-foreground text-xs hidden sm:inline">
                  ({path})
                </span>
              )}
            </div>
            {lastTestedText && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {t('devChecklist.lastTested', { time: lastTestedText })}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          {path && (
            <Button
              variant="ghost"
              size="sm"
              onClick={openRoute}
              className="gap-1 text-xs h-7"
            >
              {t('devChecklist.open')}
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <CollapsibleContent>
        <div className="px-3 pb-3 pt-1">
          <Textarea
            placeholder={t('devChecklist.notesPlaceholder')}
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className="min-h-[60px] text-sm"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
