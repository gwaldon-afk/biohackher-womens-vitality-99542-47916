import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  CircleDashed,
} from 'lucide-react';
import { QaFixPrompt } from '@/hooks/useChecklistSync';
import { BugItem } from '@/types/checklist';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import { ResolutionDialog } from './ResolutionDialog';

interface FixPromptHistoryProps {
  prompts: QaFixPrompt[];
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
  onLoadResolutionHistory: (promptId: string) => Promise<any[]>;
}

const statusConfig: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', label: 'Pending' },
  applied: { icon: CircleDashed, color: 'text-blue-500', label: 'Applied' },
  verified_fixed: { icon: CheckCircle, color: 'text-green-500', label: 'Verified Fixed' },
  still_broken: { icon: XCircle, color: 'text-red-500', label: 'Still Broken' },
  partial: { icon: AlertCircle, color: 'text-orange-500', label: 'Partial' },
};

export const FixPromptHistory = ({
  prompts,
  onUpdateResolution,
  onUpdateIssueResolution,
  onLoadResolutionHistory,
}: FixPromptHistoryProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [resolutionPrompt, setResolutionPrompt] = useState<QaFixPrompt | null>(null);

  if (prompts.length === 0) {
    return null;
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t('devChecklist.copiedToClipboard'));
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className={`gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {t(`devChecklist.${status}`) || config.label}
      </Badge>
    );
  };

  return (
    <>
      <Card className="border-purple-500/30 bg-purple-50/30 dark:bg-purple-950/10">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="py-3">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  {t('devChecklist.fixPromptHistory')}
                  <Badge variant="secondary">
                    {t('devChecklist.promptsGenerated', { count: prompts.length })}
                  </Badge>
                </CardTitle>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-3">
                  {prompts.map((prompt) => {
                    const issues = prompt.issues_included as BugItem[];
                    const isExpanded = expandedPromptId === prompt.id;

                    return (
                      <div 
                        key={prompt.id} 
                        className="p-3 rounded-lg border bg-background"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">
                                {format(new Date(prompt.generated_at), 'MMM d, yyyy h:mm a')}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {issues.length} {t('devChecklist.issues')}
                              </Badge>
                              <StatusBadge status={prompt.resolution_status} />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(prompt.generated_at), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(prompt.prompt_text)}
                              className="h-7 gap-1"
                            >
                              <Copy className="h-3 w-3" />
                              {t('common.copy')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setResolutionPrompt(prompt)}
                              className="h-7"
                            >
                              {t('devChecklist.markResolution')}
                            </Button>
                          </div>
                        </div>

                        {/* Expand/collapse issues */}
                        <Collapsible open={isExpanded} onOpenChange={() => setExpandedPromptId(isExpanded ? null : prompt.id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mt-2 h-6 text-xs gap-1">
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3" />
                                  Hide issues
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" />
                                  Show issues
                                </>
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="mt-2 space-y-1 pl-2 border-l-2 border-muted">
                              {issues.map((issue, i) => (
                                <div key={i} className="text-xs">
                                  <span className={`font-medium ${issue.status === 'fail' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {issue.status === 'fail' ? '❌' : '⚠️'} {issue.category}:
                                  </span>{' '}
                                  {issue.item}
                                  {issue.notes && (
                                    <span className="text-muted-foreground ml-1">— {issue.notes}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>

                        {/* Resolution notes if any */}
                        {prompt.resolution_notes && (
                          <p className="text-xs text-muted-foreground mt-2 italic">
                            {prompt.resolution_notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Resolution Dialog */}
      {resolutionPrompt && (
        <ResolutionDialog
          prompt={resolutionPrompt}
          open={!!resolutionPrompt}
          onClose={() => setResolutionPrompt(null)}
          onUpdateResolution={onUpdateResolution}
          onUpdateIssueResolution={onUpdateIssueResolution}
        />
      )}
    </>
  );
};
