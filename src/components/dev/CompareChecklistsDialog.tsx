import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Equal, Sparkles } from 'lucide-react';
import { QaChecklist } from '@/hooks/useChecklistSync';
import { EnhancedChecklistState, ItemStatus } from '@/types/checklist';

interface CompareChecklistsDialogProps {
  open: boolean;
  onClose: () => void;
  checklists: QaChecklist[];
}

interface DiffItem {
  key: string;
  category: string;
  baseStatus: ItemStatus;
  compareStatus: ItemStatus;
  change: 'improved' | 'regressed' | 'unchanged' | 'new';
}

const statusOrder: ItemStatus[] = ['fail', 'review', 'untested', 'pass'];

const getStatusScore = (status: ItemStatus): number => statusOrder.indexOf(status);

const getChange = (base: ItemStatus, compare: ItemStatus): DiffItem['change'] => {
  const baseScore = getStatusScore(base);
  const compareScore = getStatusScore(compare);
  if (compareScore > baseScore) return 'improved';
  if (compareScore < baseScore) return 'regressed';
  return 'unchanged';
};

const StatusBadge = ({ status }: { status: ItemStatus }) => {
  const colors: Record<ItemStatus, string> = {
    pass: 'bg-green-100 text-green-700 border-green-300',
    fail: 'bg-red-100 text-red-700 border-red-300',
    review: 'bg-amber-100 text-amber-700 border-amber-300',
    untested: 'bg-gray-100 text-gray-700 border-gray-300',
  };

  return (
    <Badge variant="outline" className={colors[status]}>
      {status}
    </Badge>
  );
};

export const CompareChecklistsDialog = ({
  open,
  onClose,
  checklists,
}: CompareChecklistsDialogProps) => {
  const { t } = useTranslation();
  const [baseId, setBaseId] = useState<string>(checklists[0]?.id || '');
  const [compareId, setCompareId] = useState<string>(checklists[1]?.id || '');

  const baseChecklist = checklists.find(c => c.id === baseId);
  const compareChecklist = checklists.find(c => c.id === compareId);

  const diff = useMemo<DiffItem[]>(() => {
    if (!baseChecklist || !compareChecklist) return [];

    const baseData = baseChecklist.checklist_data as EnhancedChecklistState;
    const compareData = compareChecklist.checklist_data as EnhancedChecklistState;

    const items: DiffItem[] = [];
    const categories: (keyof EnhancedChecklistState)[] = ['routes', 'tables', 'functions', 'flows', 'features'];

    categories.forEach(category => {
      const allKeys = new Set([
        ...Object.keys(baseData[category] || {}),
        ...Object.keys(compareData[category] || {}),
      ]);

      allKeys.forEach(key => {
        const baseStatus = baseData[category]?.[key]?.status || 'untested';
        const compareStatus = compareData[category]?.[key]?.status || 'untested';
        
        // Only include if there's a difference or if tested in either
        if (baseStatus !== 'untested' || compareStatus !== 'untested') {
          items.push({
            key,
            category,
            baseStatus,
            compareStatus,
            change: baseStatus === 'untested' ? 'new' : getChange(baseStatus, compareStatus),
          });
        }
      });
    });

    // Sort: regressed first, then improved, then new, then unchanged
    const changeOrder = ['regressed', 'improved', 'new', 'unchanged'];
    return items.sort((a, b) => changeOrder.indexOf(a.change) - changeOrder.indexOf(b.change));
  }, [baseChecklist, compareChecklist]);

  const summary = useMemo(() => {
    const counts = { improved: 0, regressed: 0, unchanged: 0, new: 0 };
    diff.forEach(item => counts[item.change]++);
    return counts;
  }, [diff]);

  const ChangeIcon = ({ change }: { change: DiffItem['change'] }) => {
    switch (change) {
      case 'improved':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'regressed':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'new':
        return <Sparkles className="h-4 w-4 text-blue-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('devChecklist.compareChecklists')}</DialogTitle>
        </DialogHeader>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('devChecklist.baseChecklist')}</Label>
            <Select value={baseId} onValueChange={setBaseId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {checklists.map(c => (
                  <SelectItem key={c.id} value={c.id} disabled={c.id === compareId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('devChecklist.compareWith')}</Label>
            <Select value={compareId} onValueChange={setCompareId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {checklists.map(c => (
                  <SelectItem key={c.id} value={c.id} disabled={c.id === baseId}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-2">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-lg font-bold text-green-600">{summary.improved}</div>
                <div className="text-xs text-muted-foreground">{t('devChecklist.improved')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-lg font-bold text-red-600">{summary.regressed}</div>
                <div className="text-xs text-muted-foreground">{t('devChecklist.regressed')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-200 bg-gray-50 dark:bg-gray-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <Equal className="h-5 w-5 text-gray-500" />
              <div>
                <div className="text-lg font-bold text-gray-600">{summary.unchanged}</div>
                <div className="text-xs text-muted-foreground">{t('devChecklist.unchanged')}</div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-lg font-bold text-blue-600">{summary.new}</div>
                <div className="text-xs text-muted-foreground">{t('devChecklist.newItems')}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diff Table */}
        <ScrollArea className="flex-1 border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>{t('devChecklist.category')}</TableHead>
                <TableHead>{t('devChecklist.item')}</TableHead>
                <TableHead>{t('devChecklist.baseStatus')}</TableHead>
                <TableHead>{t('devChecklist.compareStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diff.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {t('devChecklist.noDifferences')}
                  </TableCell>
                </TableRow>
              ) : (
                diff.map((item, i) => (
                  <TableRow 
                    key={`${item.category}-${item.key}-${i}`}
                    className={
                      item.change === 'regressed' ? 'bg-red-50/50 dark:bg-red-950/10' :
                      item.change === 'improved' ? 'bg-green-50/50 dark:bg-green-950/10' :
                      item.change === 'new' ? 'bg-blue-50/50 dark:bg-blue-950/10' : ''
                    }
                  >
                    <TableCell>
                      <ChangeIcon change={item.change} />
                    </TableCell>
                    <TableCell className="capitalize text-sm">{item.category}</TableCell>
                    <TableCell className="font-mono text-xs">{item.key}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.baseStatus} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.compareStatus} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
