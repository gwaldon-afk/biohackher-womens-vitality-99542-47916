import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bug, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Download, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import { BugItem } from '@/types/checklist';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BugSummaryPanelProps {
  bugs: BugItem[];
}

export const BugSummaryPanel = ({ bugs }: BugSummaryPanelProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const failedBugs = bugs.filter(b => b.status === 'fail');
  const reviewBugs = bugs.filter(b => b.status === 'review');
  const totalIssues = failedBugs.length + reviewBugs.length;

  if (totalIssues === 0) {
    return null;
  }

  const generateMarkdown = () => {
    const now = new Date().toISOString();
    let md = `# Biohackher QA Bug Report\n\n`;
    md += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    if (failedBugs.length > 0) {
      md += `## ❌ Failed (${failedBugs.length})\n\n`;
      failedBugs.forEach(bug => {
        md += `### ${bug.category}: ${bug.item}\n`;
        if (bug.path) md += `- **Path:** \`${bug.path}\`\n`;
        if (bug.notes) md += `- **Notes:** ${bug.notes}\n`;
        if (bug.lastTested) md += `- **Last Tested:** ${new Date(bug.lastTested).toLocaleString()}\n`;
        md += '\n';
      });
    }

    if (reviewBugs.length > 0) {
      md += `## ⚠️ Needs Review (${reviewBugs.length})\n\n`;
      reviewBugs.forEach(bug => {
        md += `### ${bug.category}: ${bug.item}\n`;
        if (bug.path) md += `- **Path:** \`${bug.path}\`\n`;
        if (bug.notes) md += `- **Notes:** ${bug.notes}\n`;
        if (bug.lastTested) md += `- **Last Tested:** ${new Date(bug.lastTested).toLocaleString()}\n`;
        md += '\n';
      });
    }

    return md;
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown();
    await navigator.clipboard.writeText(md);
    toast.success(t('devChecklist.copiedToClipboard'));
  };

  const handleDownloadMd = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biohackher-qa-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('devChecklist.downloadStarted'));
  };

  const handleGenerateFixPrompt = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qa-fix-prompt', {
        body: { bugs }
      });

      if (error) throw error;

      await navigator.clipboard.writeText(data.prompt);
      toast.success(t('devChecklist.fixPromptCopied'));
    } catch (err) {
      console.error('Failed to generate fix prompt:', err);
      toast.error(t('devChecklist.fixPromptFailed'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="py-3">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <CardTitle className="text-base flex items-center gap-2">
                <Bug className="h-5 w-5 text-amber-600" />
                {t('devChecklist.bugSummary')} ({totalIssues} {t('devChecklist.issues')})
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
          <CardContent className="pt-0 space-y-4">
            <ScrollArea className="max-h-[300px]">
              {failedBugs.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    ❌ {t('devChecklist.filterFailed')} ({failedBugs.length})
                  </h4>
                  <div className="space-y-2">
                    {failedBugs.map((bug, i) => (
                      <div key={i} className="text-sm pl-4 border-l-2 border-red-500">
                        <span className="font-medium">{bug.category}:</span> {bug.item}
                        {bug.notes && (
                          <p className="text-muted-foreground text-xs mt-0.5">"{bug.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviewBugs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-amber-600 mb-2">
                    ⚠️ {t('devChecklist.filterReview')} ({reviewBugs.length})
                  </h4>
                  <div className="space-y-2">
                    {reviewBugs.map((bug, i) => (
                      <div key={i} className="text-sm pl-4 border-l-2 border-amber-500">
                        <span className="font-medium">{bug.category}:</span> {bug.item}
                        {bug.notes && (
                          <p className="text-muted-foreground text-xs mt-0.5">"{bug.notes}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={handleCopyMarkdown}>
                <Copy className="h-4 w-4 mr-1" />
                {t('devChecklist.copyMarkdown')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadMd}>
                <Download className="h-4 w-4 mr-1" />
                {t('devChecklist.downloadMd')}
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleGenerateFixPrompt}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1" />
                )}
                {t('devChecklist.generateFixPrompt')}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
