import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Cloud, 
  CloudOff,
  Loader2, 
  ChevronDown, 
  Trash2, 
  Plus,
  GitCompare,
  Check
} from 'lucide-react';
import { QaChecklist } from '@/hooks/useChecklistSync';
import { formatDistanceToNow } from 'date-fns';

interface ChecklistHeaderProps {
  checklistName: string;
  onNameChange: (name: string) => void;
  hasUnsavedChanges: boolean;
  syncing: boolean;
  lastSyncedAt: Date | null;
  userId: string | null;
  savedChecklists: QaChecklist[];
  onSave: () => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
  onCompare: () => void;
  activeChecklistId: string | null;
}

export const ChecklistHeader = ({
  checklistName,
  onNameChange,
  hasUnsavedChanges,
  syncing,
  lastSyncedAt,
  userId,
  savedChecklists,
  onSave,
  onLoad,
  onDelete,
  onNew,
  onCompare,
  activeChecklistId,
}: ChecklistHeaderProps) => {
  const { t } = useTranslation();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  const lastSyncedText = lastSyncedAt
    ? formatDistanceToNow(lastSyncedAt, { addSuffix: true })
    : null;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted/30 rounded-lg border mb-4">
        {/* Checklist Name */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={checklistName}
              onChange={(e) => onNameChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              autoFocus
              className="text-lg font-semibold h-9"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-lg font-semibold hover:bg-muted px-2 py-1 rounded transition-colors text-left truncate max-w-full"
            >
              {checklistName}
            </button>
          )}
          
          {/* Status indicators */}
          <div className="flex items-center gap-2 mt-1">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-400">
                {t('devChecklist.unsaved')}
              </Badge>
            )}
            {syncing && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                {t('devChecklist.syncing')}
              </span>
            )}
            {!syncing && lastSyncedText && (
              <span className="text-xs text-muted-foreground">
                {t('devChecklist.lastSaved', { time: lastSyncedText })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {userId ? (
            <>
              {/* Save Button */}
              <Button
                variant={hasUnsavedChanges ? 'default' : 'outline'}
                size="sm"
                onClick={onSave}
                disabled={syncing}
                className="gap-1"
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cloud className="h-4 w-4" />
                )}
                {t('devChecklist.saveToCloud')}
              </Button>

              {/* Load Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    {t('devChecklist.loadChecklist')}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>{t('devChecklist.savedChecklists')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedChecklists.length === 0 ? (
                    <DropdownMenuItem disabled>
                      {t('devChecklist.noSavedChecklists')}
                    </DropdownMenuItem>
                  ) : (
                    savedChecklists.map((checklist) => (
                      <DropdownMenuItem
                        key={checklist.id}
                        className="flex items-center justify-between group"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoad(checklist.id);
                          }}
                          className="flex-1 text-left flex items-center gap-2"
                        >
                          {activeChecklistId === checklist.id && (
                            <Check className="h-3 w-3 text-green-500" />
                          )}
                          <span className="truncate">{checklist.name}</span>
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(checklist.id);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* New Checklist */}
              <Button
                variant="outline"
                size="sm"
                onClick={onNew}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                {t('devChecklist.newChecklist')}
              </Button>

              {/* Compare Button */}
              {savedChecklists.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCompare}
                  className="gap-1"
                >
                  <GitCompare className="h-4 w-4" />
                  {t('devChecklist.compare')}
                </Button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CloudOff className="h-4 w-4" />
              {t('devChecklist.cloudSyncRequiresAuth')}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('devChecklist.deleteChecklistConfirm')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('devChecklist.deleteChecklistDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
