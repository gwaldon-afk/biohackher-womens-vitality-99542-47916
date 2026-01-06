import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { QaFixPrompt } from '@/hooks/useChecklistSync';
import { BugItem } from '@/types/checklist';
import { toast } from 'sonner';

interface IssueResolution {
  newStatus: 'pass' | 'fail' | 'review';
  notes: string;
}

interface ResolutionDialogProps {
  prompt: QaFixPrompt;
  open: boolean;
  onClose: () => void;
  onUpdateResolution: (promptId: string, status: string, notes: string) => Promise<void>;
  onUpdateIssueResolution: (
    promptId: string,
    issueKey: string,
    category: string,
    originalStatus: string,
    originalNotes: string,
    newStatus: string,
    notes: string
  ) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: 'pass', label: 'Fixed', color: 'text-green-600' },
  { value: 'fail', label: 'Still Broken', color: 'text-red-600' },
  { value: 'review', label: 'Partially Fixed', color: 'text-amber-600' },
];

export const ResolutionDialog = ({
  prompt,
  open,
  onClose,
  onUpdateResolution,
  onUpdateIssueResolution,
}: ResolutionDialogProps) => {
  const { t } = useTranslation();
  const issues = prompt.issues_included as BugItem[];
  
  const [saving, setSaving] = useState(false);
  const [overallNotes, setOverallNotes] = useState('');
  const [issueResolutions, setIssueResolutions] = useState<Record<string, IssueResolution>>(
    () => Object.fromEntries(
      issues.map((issue, i) => [
        `${issue.category}-${i}`,
        { newStatus: issue.status as 'fail' | 'review', notes: '' }
      ])
    )
  );

  const updateIssueResolution = (key: string, field: keyof IssueResolution, value: string) => {
    setIssueResolutions(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Determine overall status based on issue resolutions
      const resolutions = Object.values(issueResolutions);
      const allFixed = resolutions.every(r => r.newStatus === 'pass');
      const allBroken = resolutions.every(r => r.newStatus === 'fail');
      
      let overallStatus = 'partial';
      if (allFixed) overallStatus = 'verified_fixed';
      else if (allBroken) overallStatus = 'still_broken';

      // Update each issue resolution
      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const key = `${issue.category}-${i}`;
        const resolution = issueResolutions[key];
        
        await onUpdateIssueResolution(
          prompt.id,
          `${issue.category}-${issue.item}`,
          issue.category,
          issue.status,
          issue.notes,
          resolution.newStatus,
          resolution.notes
        );
      }

      // Update prompt status
      await onUpdateResolution(prompt.id, overallStatus, overallNotes);

      toast.success(t('devChecklist.resolutionSaved'));
      onClose();
    } catch (err) {
      console.error('Failed to save resolutions:', err);
      toast.error(t('devChecklist.resolutionFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('devChecklist.markResolution')}</DialogTitle>
          <DialogDescription>
            {t('devChecklist.resolutionDesc')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {issues.map((issue, i) => {
              const key = `${issue.category}-${i}`;
              const resolution = issueResolutions[key];

              return (
                <div key={key} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={issue.status === 'fail' ? 'border-red-500 text-red-600' : 'border-amber-500 text-amber-600'}
                        >
                          {issue.status === 'fail' ? 'Failed' : 'Review'}
                        </Badge>
                        <span className="text-sm font-medium">{issue.category}</span>
                      </div>
                      <p className="text-sm mt-1">{issue.item}</p>
                      {issue.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Original note: {issue.notes}
                        </p>
                      )}
                    </div>
                    <Select
                      value={resolution.newStatus}
                      onValueChange={(value) => updateIssueResolution(key, 'newStatus', value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className={opt.color}>{opt.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder={t('devChecklist.resolutionNotesPlaceholder')}
                    value={resolution.notes}
                    onChange={(e) => updateIssueResolution(key, 'notes', e.target.value)}
                    className="text-sm min-h-[50px]"
                  />
                </div>
              );
            })}

            {/* Overall notes */}
            <div className="space-y-2 pt-4 border-t">
              <Label>{t('devChecklist.overallNotes')}</Label>
              <Textarea
                placeholder={t('devChecklist.overallNotesPlaceholder')}
                value={overallNotes}
                onChange={(e) => setOverallNotes(e.target.value)}
                className="min-h-[60px]"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {t('devChecklist.saveResolutions')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
