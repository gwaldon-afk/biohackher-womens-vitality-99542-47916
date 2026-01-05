import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Zap, Lock, Unlock } from 'lucide-react';
import { ChecklistItemRow } from './ChecklistItemRow';
import { ChecklistItemState, ItemStatus, FunctionInfo } from '@/types/checklist';
import { FilterType } from './FilterBar';

// Edge functions from config.toml
const EDGE_FUNCTIONS: FunctionInfo[] = [
  { name: 'analyze-food-photo', verifyJwt: true },
  { name: 'extract-protocol-keywords', verifyJwt: false },
  { name: 'send-assessment-reminder', verifyJwt: false },
  { name: 'send-lis-report', verifyJwt: false },
  { name: 'analyze-assessment-results', verifyJwt: true },
  { name: 'analyze-cross-assessments', verifyJwt: true },
  { name: 'analyze-energy-loop', verifyJwt: true },
  { name: 'analyze-health-patterns', verifyJwt: true },
  { name: 'compile-research', verifyJwt: true },
  { name: 'create-payment', verifyJwt: true },
  { name: 'data-sync-wearable', verifyJwt: true },
  { name: 'generate-energy-insights', verifyJwt: true },
  { name: 'generate-goal-insights', verifyJwt: true },
  { name: 'generate-goal-optimization', verifyJwt: true },
  { name: 'generate-goal-suggestions', verifyJwt: true },
  { name: 'generate-insights', verifyJwt: true },
  { name: 'generate-meal-plan', verifyJwt: true },
  { name: 'generate-monthly-report', verifyJwt: true },
  { name: 'generate-protocol-from-assessments', verifyJwt: true },
  { name: 'health-assistant', verifyJwt: true },
  { name: 'score-calculate', verifyJwt: true },
  { name: 'score-history', verifyJwt: true },
  { name: 'populate-research', verifyJwt: false },
  { name: 'sync-research-delta', verifyJwt: false },
  { name: 'personalize-research', verifyJwt: true },
  { name: 'calculate-daily-adherence', verifyJwt: true },
  { name: 'generate-qa-fix-prompt', verifyJwt: false },
];

interface EdgeFunctionsListProps {
  functionStates: Record<string, ChecklistItemState>;
  activeFilter: FilterType;
  onStatusChange: (funcId: string, status: ItemStatus) => void;
  onNotesChange: (funcId: string, notes: string) => void;
}

export const EdgeFunctionsList = ({
  functionStates,
  activeFilter,
  onStatusChange,
  onNotesChange,
}: EdgeFunctionsListProps) => {
  const { t } = useTranslation();

  const getFunctionState = (funcName: string): ChecklistItemState => {
    return functionStates[funcName] || { status: 'untested', notes: '', lastTested: null };
  };

  const filterFunction = (funcName: string): boolean => {
    if (activeFilter === 'all') return true;
    return getFunctionState(funcName).status === activeFilter;
  };

  const publicFunctions = EDGE_FUNCTIONS.filter(f => !f.verifyJwt);
  const protectedFunctions = EDGE_FUNCTIONS.filter(f => f.verifyJwt);

  const completedPublic = publicFunctions.filter(f => getFunctionState(f.name).status === 'pass').length;
  const completedProtected = protectedFunctions.filter(f => getFunctionState(f.name).status === 'pass').length;

  return (
    <ScrollArea className="h-[calc(100vh-450px)]">
      <div className="space-y-4">
        {/* Public Functions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Unlock className="h-4 w-4 text-amber-500" />
              {t('devChecklist.publicFunctions')}
              <Badge variant="outline" className="ml-auto">
                {completedPublic}/{publicFunctions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {publicFunctions
                .filter(f => filterFunction(f.name))
                .map(func => (
                  <div key={func.name} className="flex items-center gap-2">
                    <div className="flex-1">
                      <ChecklistItemRow
                        id={func.name}
                        label={func.name}
                        description={`Edge function: ${func.name}`}
                        state={getFunctionState(func.name)}
                        onStatusChange={(status) => onStatusChange(func.name, status)}
                        onNotesChange={(notes) => onNotesChange(func.name, notes)}
                      />
                    </div>
                    <Badge className="shrink-0 mr-3 text-xs bg-amber-500/20 text-amber-700 gap-1">
                      <Unlock className="h-3 w-3" />
                      {t('devChecklist.jwtPublic')}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Protected Functions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              {t('devChecklist.protectedFunctions')}
              <Badge variant="outline" className="ml-auto">
                {completedProtected}/{protectedFunctions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {protectedFunctions
                .filter(f => filterFunction(f.name))
                .map(func => (
                  <div key={func.name} className="flex items-center gap-2">
                    <div className="flex-1">
                      <ChecklistItemRow
                        id={func.name}
                        label={func.name}
                        description={`Edge function: ${func.name}`}
                        state={getFunctionState(func.name)}
                        onStatusChange={(status) => onStatusChange(func.name, status)}
                        onNotesChange={(notes) => onNotesChange(func.name, notes)}
                      />
                    </div>
                    <Badge className="shrink-0 mr-3 text-xs bg-green-500/20 text-green-700 gap-1">
                      <Lock className="h-3 w-3" />
                      {t('devChecklist.jwtRequired')}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};
