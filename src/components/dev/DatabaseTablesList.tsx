import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Shield, ShieldOff, Loader2 } from 'lucide-react';
import { ChecklistItemRow } from './ChecklistItemRow';
import { ChecklistItemState, ItemStatus } from '@/types/checklist';
import { FilterType } from './FilterBar';

// Database tables grouped by domain
const TABLE_GROUPS = [
  {
    id: 'core',
    title: 'Core',
    tables: ['profiles', 'protocols', 'protocol_items', 'products', 'orders', 'order_items', 'cart_items']
  },
  {
    id: 'assessments',
    title: 'Assessments',
    tables: ['assessments', 'assessment_questions', 'assessment_question_options', 'assessment_progress', 'assessment_ai_insights', 'symptom_assessments', 'guest_symptom_assessments', 'guest_lis_assessments', 'menomap_assessments', 'longevity_nutrition_assessments', 'hormone_compass_stages']
  },
  {
    id: 'goals',
    title: 'Goals',
    tables: ['user_health_goals', 'goal_templates', 'goal_check_ins', 'goal_insights', 'goal_metric_tracking']
  },
  {
    id: 'daily',
    title: 'Daily Tracking',
    tables: ['daily_scores', 'daily_nutrition_scores', 'daily_nutrition_actions', 'daily_essentials_completions', 'habit_tracking', 'streak_tracking']
  },
  {
    id: 'energy',
    title: 'Energy & Nutrition',
    tables: ['energy_loop_scores', 'energy_check_ins', 'energy_insights', 'energy_actions', 'energy_milestones', 'meal_photos', 'meal_completions', 'custom_meal_plans']
  },
  {
    id: 'expert',
    title: 'Expert Portal',
    tables: ['expert_profiles', 'expert_services', 'expert_availability', 'expert_reviews', 'expert_referrals', 'expert_credentials', 'expert_complaints', 'expert_verification_log']
  },
  {
    id: 'admin',
    title: 'Admin & System',
    tables: ['user_roles', 'admin_audit_log', 'discount_rules', 'marketing_leads', 'email_shares', 'health_questions']
  }
];

interface DatabaseTablesListProps {
  tableStates: Record<string, ChecklistItemState>;
  tableStats: Record<string, { rowCount: number; hasRls: boolean }>;
  isLoading: boolean;
  activeFilter: FilterType;
  onStatusChange: (tableId: string, status: ItemStatus) => void;
  onNotesChange: (tableId: string, notes: string) => void;
}

export const DatabaseTablesList = ({
  tableStates,
  tableStats,
  isLoading,
  activeFilter,
  onStatusChange,
  onNotesChange,
}: DatabaseTablesListProps) => {
  const { t } = useTranslation();

  const getTableState = (tableName: string): ChecklistItemState => {
    return tableStates[tableName] || { status: 'untested', notes: '', lastTested: null };
  };

  const filterTable = (tableName: string): boolean => {
    if (activeFilter === 'all') return true;
    return getTableState(tableName).status === activeFilter;
  };

  return (
    <ScrollArea className="h-[calc(100vh-450px)]">
      <div className="space-y-4">
        {TABLE_GROUPS.map(group => {
          const filteredTables = group.tables.filter(filterTable);
          if (filteredTables.length === 0) return null;

          const completedCount = group.tables.filter(t => getTableState(t).status === 'pass').length;

          return (
            <Card key={group.id}>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  {group.title}
                  <Badge variant="outline" className="ml-auto">
                    {completedCount}/{group.tables.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {filteredTables.map(tableName => {
                    const stats = tableStats[tableName];
                    const state = getTableState(tableName);

                    return (
                      <div key={tableName} className="flex items-center gap-2">
                        <div className="flex-1">
                          <ChecklistItemRow
                            id={tableName}
                            label={tableName}
                            description={`Database table: ${tableName}`}
                            state={state}
                            onStatusChange={(status) => onStatusChange(tableName, status)}
                            onNotesChange={(notes) => onNotesChange(tableName, notes)}
                          />
                        </div>
                        <div className="flex items-center gap-2 shrink-0 pr-3">
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          ) : stats ? (
                            <>
                              <Badge variant="secondary" className="text-xs">
                                {t('devChecklist.rowCount', { count: stats.rowCount })}
                              </Badge>
                              {stats.hasRls ? (
                                <Badge className="text-xs bg-green-500/20 text-green-700 gap-1">
                                  <Shield className="h-3 w-3" />
                                  RLS
                                </Badge>
                              ) : (
                                <Badge className="text-xs bg-red-500/20 text-red-700 gap-1">
                                  <ShieldOff className="h-3 w-3" />
                                  {t('devChecklist.noRls')}
                                </Badge>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
