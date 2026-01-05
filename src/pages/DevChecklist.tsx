import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ExternalLink, 
  RotateCcw, 
  Home,
  Globe,
  Lock,
  Shield,
  Workflow,
  Sparkles,
  FlaskConical,
  Database,
  Zap,
  Download,
  RefreshCw,
  ExternalLinkIcon
} from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';
import { useChecklistState } from '@/hooks/useChecklistState';
import { useDatabaseStats } from '@/hooks/useDatabaseStats';
import { ChecklistItemRow } from '@/components/dev/ChecklistItemRow';
import { FilterBar, FilterType } from '@/components/dev/FilterBar';
import { BugSummaryPanel } from '@/components/dev/BugSummaryPanel';
import { DatabaseTablesList } from '@/components/dev/DatabaseTablesList';
import { EdgeFunctionsList } from '@/components/dev/EdgeFunctionsList';
import { ChecklistCategory, ItemStatus } from '@/types/checklist';
import { toast } from 'sonner';

// Route definitions
const CHECKLIST_DATA: ChecklistCategory[] = [
  {
    id: 'public',
    title: 'Public Routes',
    icon: <Globe className="h-4 w-4" />,
    items: [
      { id: 'index', label: 'Index / Landing Page', path: '/', description: 'Main landing page' },
      { id: 'auth', label: 'Authentication', path: '/auth', description: 'Login/signup page' },
      { id: 'about', label: 'About Page', path: '/about', description: 'Company information' },
      { id: 'guest-lis', label: 'Guest LIS Assessment', path: '/guest-lis-assessment', description: 'Guest assessment flow' },
      { id: 'shop', label: 'Shop', path: '/shop', description: 'Product catalogue' },
      { id: 'experts', label: 'Expert Directory', path: '/experts', description: 'Browse experts' },
      { id: 'pillars', label: 'Pillars Overview', path: '/pillars', description: 'Health pillars' },
      { id: 'pillars-display', label: 'Pillars Display', path: '/pillars-display', description: 'Pillar visualisation' },
      { id: 'goals-preview', label: 'Goals Preview', path: '/goals-preview', description: 'Guest goals preview' },
      { id: 'analytics', label: 'Analytics Dashboard', path: '/analytics', description: 'Public analytics' },
      { id: 'expert-finder', label: 'Expert Finder Map', path: '/expert-finder-map', description: 'Map-based expert search' },
      { id: 'hormonal-triage', label: 'Hormonal Health Triage', path: '/hormonal-health/triage', description: 'Entry point for hormonal health' },
      { id: 'longevity-nutrition', label: 'Longevity Nutrition Assessment', path: '/longevity-nutrition', description: 'Nutrition assessment' },
    ]
  },
  {
    id: 'protected',
    title: 'Protected Routes',
    icon: <Lock className="h-4 w-4" />,
    items: [
      { id: 'today', label: 'My Daily Plan', path: '/today', description: 'Main user dashboard' },
      { id: 'my-protocol', label: 'My Protocol', path: '/my-protocol', description: 'Personalised protocol' },
      { id: 'nutrition', label: 'Nutrition Dashboard', path: '/nutrition', description: 'Nutrition tracking' },
      { id: 'meal-plan', label: 'Weekly Meal Plan', path: '/nutrition/meal-plan', description: 'Weekly meal planning' },
      { id: 'my-goals', label: 'Goals Dashboard', path: '/my-goals', description: 'Goal management' },
      { id: 'goal-wizard', label: 'AI Goal Wizard', path: '/my-goals/wizard', description: 'AI-powered goal creation' },
      { id: 'goal-insights', label: 'Goal Insights', path: '/goals/insights', description: 'Goal analytics' },
      { id: 'profile', label: 'User Profile', path: '/profile', description: 'Profile overview' },
      { id: 'profile-settings', label: 'Profile Settings', path: '/profile-settings', description: 'Edit profile' },
      { id: 'settings', label: 'Settings', path: '/settings', description: 'App settings' },
      { id: 'complete-profile', label: 'Complete Health Profile', path: '/complete-profile', description: 'Health profile wizard' },
      { id: '90-day-plan', label: '90 Day Plan', path: '/plans/90-day', description: 'Long-term planning' },
      { id: 'master-dashboard', label: 'Master Dashboard', path: '/master-dashboard', description: 'Comprehensive dashboard' },
      { id: 'progress', label: 'Progress Tracking', path: '/progress', description: 'Track progress' },
      { id: 'achievements', label: 'Achievements', path: '/achievements', description: 'Badges and milestones' },
      { id: 'reports', label: 'Reports', path: '/reports', description: 'Health reports' },
      { id: 'wearables', label: 'Wearable Integrations', path: '/wearables', description: 'Connect devices' },
      { id: 'coaching', label: 'Coaching', path: '/coaching', description: 'Coaching services' },
      { id: 'health-assistant', label: 'Health Assistant', path: '/health-assistant', description: 'AI health assistant' },
      { id: 'daily-check-in', label: 'Daily Check-In', path: '/daily-check-in', description: 'LIS daily check-in' },
      { id: 'mood-checkin', label: 'Mood Check-in', path: '/mood-checkin', description: 'Mood tracking' },
      { id: 'quick-log', label: 'Quick Log', path: '/quick-log', description: 'Quick data entry' },
      { id: 'nutrition-scan', label: 'Nutrition Scan', path: '/nutrition-scan', description: 'MealSnap feature' },
      { id: 'plan-home', label: 'Plan Home', path: '/plan-home', description: 'Plan overview' },
      { id: 'dashboard-main', label: 'Dashboard Main', path: '/dashboard-main', description: 'Main dashboard view' },
      { id: 'insights-detail', label: 'Insights Detail', path: '/insights-detail', description: 'Detailed insights' },
    ]
  },
  {
    id: 'hormone',
    title: 'Hormone Compass',
    icon: <Sparkles className="h-4 w-4" />,
    items: [
      { id: 'hc-assessment', label: 'Hormone Assessment', path: '/hormone-compass/assessment', description: 'Hormone health assessment' },
      { id: 'hc-results', label: 'Hormone Results', path: '/hormone-compass/results', description: 'Assessment results' },
    ]
  },
  {
    id: 'energy',
    title: 'Energy Loop',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      { id: 'el-dashboard', label: 'Energy Dashboard', path: '/energy-loop', description: 'Energy loop main' },
      { id: 'el-quickstart', label: 'Quick Start', path: '/energy-loop/quick-start', description: 'Getting started' },
      { id: 'el-onboarding', label: 'Onboarding', path: '/energy-loop/onboarding', description: 'Setup flow' },
      { id: 'el-checkin', label: 'Check In', path: '/energy-loop/check-in', description: 'Daily energy check-in' },
      { id: 'el-progress', label: 'Progress', path: '/energy-loop/progress', description: 'Energy progress' },
      { id: 'el-actions', label: 'Actions', path: '/energy-loop/actions', description: 'Energy actions' },
    ]
  },
  {
    id: 'expert',
    title: 'Expert Portal',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { id: 'expert-register', label: 'Expert Registration', path: '/expert/register', description: 'Register as expert' },
      { id: 'expert-dashboard', label: 'Expert Dashboard', path: '/expert/dashboard', description: 'Expert management' },
    ]
  },
  {
    id: 'onboarding',
    title: 'Onboarding Flow',
    icon: <Workflow className="h-4 w-4" />,
    items: [
      { id: 'intro-3step', label: 'Intro 3-Step', path: '/onboarding/intro-3step', description: 'Initial intro' },
      { id: 'permission-setup', label: 'Permission Setup', path: '/onboarding/permission-setup', description: 'Device permissions' },
      { id: 'hc-menopause', label: 'Hormone Compass Menopause', path: '/onboarding/hormone-compass-menopause', description: 'Menopause flow' },
      { id: 'hc-results-onboard', label: 'Hormone Results', path: '/onboarding/hormone-compass-results', description: 'Onboarding results' },
      { id: 'goal-setup-chat', label: 'Goal Setup Chat', path: '/onboarding/goal-setup-chat', description: 'AI goal setup' },
      { id: 'goal-affirmation', label: 'Goal Affirmation', path: '/onboarding/goal-affirmation', description: 'Confirm goals' },
    ]
  },
  {
    id: 'admin',
    title: 'Admin Routes',
    icon: <Shield className="h-4 w-4" />,
    items: [
      { id: 'admin-dashboard', label: 'Admin Dashboard', path: '/admin', description: 'Admin home' },
      { id: 'admin-content', label: 'Content Management', path: '/admin/content', description: 'Manage content' },
      { id: 'admin-users', label: 'User Management', path: '/admin/users', description: 'Manage users' },
      { id: 'admin-experts', label: 'Expert Verification', path: '/admin/experts', description: 'Verify experts' },
      { id: 'admin-analytics', label: 'Analytics', path: '/admin/analytics', description: 'Admin analytics' },
      { id: 'admin-shop', label: 'Shop Management', path: '/admin/shop', description: 'Manage products' },
      { id: 'admin-linking', label: 'Product Linking', path: '/admin/product-linking', description: 'Link products' },
      { id: 'admin-system', label: 'System Health', path: '/admin/system', description: 'System status' },
    ]
  },
];

const USER_FLOWS = [
  { id: 'new-user', label: 'New User Signup', steps: 'Landing → Auth → Onboarding → Today' },
  { id: 'guest-assessment', label: 'Guest Assessment', steps: 'Landing → Guest LIS → Results → Auth' },
  { id: 'goal-creation', label: 'Goal Creation', steps: 'Today → My Goals → Wizard → Goal Detail' },
  { id: 'supplement-purchase', label: 'Supplement Purchase', steps: 'Today → Supplements → Shop → Cart' },
  { id: 'expert-registration', label: 'Expert Registration', steps: 'Experts → Register → Dashboard' },
  { id: 'daily-checkin', label: 'Daily Check-in', steps: 'Today → Daily Check-in → Results' },
  { id: 'meal-logging', label: 'Meal Logging', steps: 'Today → MealSnap → Nutrition Scan' },
  { id: 'profile-completion', label: 'Profile Completion', steps: 'Auth → Complete Profile → Today' },
];

const FEATURE_CHECKLIST = [
  { id: 'auth-email', label: 'Authentication (Email)' },
  { id: 'auth-google', label: 'Authentication (Google)' },
  { id: 'mealsnap', label: 'MealSnap Photo Upload' },
  { id: 'ai-assistant', label: 'AI Health Assistant' },
  { id: 'evidence-drawer', label: 'Evidence Drawer' },
  { id: 'cart', label: 'Cart Functionality' },
  { id: 'i18n', label: 'i18n Locale Switching' },
  { id: 'navigation', label: 'Back/Home Navigation' },
  { id: 'exercise-modal', label: 'Exercise Detail Modal' },
  { id: 'supplement-grouping', label: 'Supplement Grouping' },
  { id: 'protocol-generation', label: 'Protocol Generation' },
  { id: 'goal-tracking', label: 'Goal Progress Tracking' },
];

// Database tables list
const DATABASE_TABLES = [
  'profiles', 'protocols', 'protocol_items', 'products', 'orders', 'order_items', 'cart_items',
  'assessments', 'assessment_questions', 'assessment_question_options', 'assessment_progress', 
  'assessment_ai_insights', 'symptom_assessments', 'guest_symptom_assessments', 'guest_lis_assessments',
  'menomap_assessments', 'longevity_nutrition_assessments', 'hormone_compass_stages',
  'user_health_goals', 'goal_templates', 'goal_check_ins', 'goal_insights', 'goal_metric_tracking',
  'daily_scores', 'daily_nutrition_scores', 'daily_nutrition_actions', 'daily_essentials_completions',
  'habit_tracking', 'streak_tracking', 'energy_loop_scores', 'energy_check_ins', 'energy_insights',
  'energy_actions', 'energy_milestones', 'meal_photos', 'meal_completions', 'custom_meal_plans',
  'expert_profiles', 'expert_services', 'expert_availability', 'expert_reviews', 'expert_referrals',
  'expert_credentials', 'expert_complaints', 'expert_verification_log',
  'user_roles', 'admin_audit_log', 'discount_rules', 'marketing_leads', 'email_shares', 'health_questions'
];

const EDGE_FUNCTIONS = [
  'analyze-food-photo', 'extract-protocol-keywords', 'send-assessment-reminder', 'send-lis-report',
  'analyze-assessment-results', 'analyze-cross-assessments', 'analyze-energy-loop', 'analyze-health-patterns',
  'compile-research', 'create-payment', 'data-sync-wearable', 'generate-energy-insights',
  'generate-goal-insights', 'generate-goal-optimization', 'generate-goal-suggestions', 'generate-insights',
  'generate-meal-plan', 'generate-monthly-report', 'generate-protocol-from-assessments', 'health-assistant',
  'score-calculate', 'score-history', 'populate-research', 'sync-research-delta', 'personalize-research',
  'calculate-daily-adherence', 'generate-qa-fix-prompt'
];

const DevChecklist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  const {
    state,
    getItemState,
    setItemStatus,
    setItemNotes,
    resetAll,
    getAllCounts,
    getBugs,
    exportAsJson,
  } = useChecklistState();

  const { stats: tableStats, isLoading: isLoadingStats, fetchStats } = useDatabaseStats();

  // Fetch database stats on mount
  useEffect(() => {
    fetchStats(DATABASE_TABLES);
  }, []);

  // Get all route IDs
  const allRouteIds = useMemo(() => 
    CHECKLIST_DATA.flatMap(cat => cat.items.map(item => item.id)),
    []
  );

  // Get all items for bug collection
  const allItems = useMemo(() => ({
    routes: CHECKLIST_DATA.flatMap(cat => cat.items.map(item => ({
      id: item.id,
      label: item.label,
      path: item.path,
    }))),
    tables: DATABASE_TABLES.map(t => ({ id: t, label: t })),
    functions: EDGE_FUNCTIONS.map(f => ({ id: f, label: f })),
    flows: USER_FLOWS.map(f => ({ id: f.id, label: f.label })),
    features: FEATURE_CHECKLIST.map(f => ({ id: f.id, label: f.label })),
  }), []);

  // Calculate counts
  const allCounts = useMemo(() => getAllCounts({
    routes: allRouteIds,
    tables: DATABASE_TABLES,
    functions: EDGE_FUNCTIONS,
    flows: USER_FLOWS.map(f => f.id),
    features: FEATURE_CHECKLIST.map(f => f.id),
  }), [state, allRouteIds]);

  // Get bugs for summary panel
  const bugs = useMemo(() => getBugs(allItems), [state, allItems]);

  const totalItems = allRouteIds.length + DATABASE_TABLES.length + EDGE_FUNCTIONS.length + 
                     USER_FLOWS.length + FEATURE_CHECKLIST.length;
  const passedItems = allCounts.pass;
  const progressPercent = Math.round((passedItems / totalItems) * 100);

  const handleOpenAllPublic = () => {
    const publicRoutes = CHECKLIST_DATA.find(c => c.id === 'public')?.items || [];
    publicRoutes.forEach((route, i) => {
      setTimeout(() => window.open(route.path, '_blank'), i * 200);
    });
    toast.success(t('devChecklist.openingRoutes', { count: publicRoutes.length }));
  };

  const handleRefreshDbCounts = () => {
    fetchStats(DATABASE_TABLES);
    toast.success(t('devChecklist.refreshingDb'));
  };

  const handleReset = () => {
    if (window.confirm(t('devChecklist.confirmReset'))) {
      resetAll();
      toast.success(t('devChecklist.resetComplete'));
    }
  };

  const filterItem = (id: string, category: 'routes' | 'flows' | 'features'): boolean => {
    if (activeFilter === 'all') return true;
    return getItemState(category, id).status === activeFilter;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{t('devChecklist.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('devChecklist.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {TEST_MODE_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <FlaskConical className="h-3 w-3" />
                {t('devChecklist.testModeActive')}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-1" />
              {t('common.home')}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" onClick={handleOpenAllPublic}>
            <ExternalLinkIcon className="h-4 w-4 mr-1" />
            {t('devChecklist.openAllPublic')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshDbCounts}>
            <RefreshCw className="h-4 w-4 mr-1" />
            {t('devChecklist.refreshDbCounts')}
          </Button>
          <Button variant="outline" size="sm" onClick={exportAsJson}>
            <Download className="h-4 w-4 mr-1" />
            {t('devChecklist.exportJson')}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('devChecklist.reset')}
          </Button>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t('devChecklist.progress', { completed: passedItems, total: totalItems })}
              </span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>{t('devChecklist.filterPassed')}: {allCounts.pass}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                <span>{t('devChecklist.filterUntested')}: {allCounts.untested}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>{t('devChecklist.filterReview')}: {allCounts.review}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>{t('devChecklist.filterFailed')}: {allCounts.fail}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bug Summary Panel */}
        {bugs.length > 0 && (
          <div className="mb-6">
            <BugSummaryPanel bugs={bugs} />
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-4">
          <FilterBar 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            counts={allCounts}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="routes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="routes" className="gap-1 text-xs sm:text-sm">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">{t('devChecklist.routes')}</span>
            </TabsTrigger>
            <TabsTrigger value="tables" className="gap-1 text-xs sm:text-sm">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{t('devChecklist.databaseTables')}</span>
            </TabsTrigger>
            <TabsTrigger value="functions" className="gap-1 text-xs sm:text-sm">
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">{t('devChecklist.edgeFunctions')}</span>
            </TabsTrigger>
            <TabsTrigger value="flows" className="gap-1 text-xs sm:text-sm">
              <Workflow className="h-4 w-4" />
              <span className="hidden sm:inline">{t('devChecklist.flows')}</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">{t('devChecklist.features')}</span>
            </TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <ScrollArea className="h-[calc(100vh-550px)]">
              <div className="space-y-4">
                {CHECKLIST_DATA.map(category => {
                  const filteredItems = category.items.filter(item => filterItem(item.id, 'routes'));
                  if (filteredItems.length === 0) return null;

                  const completedCount = category.items.filter(
                    item => getItemState('routes', item.id).status === 'pass'
                  ).length;

                  return (
                    <Card key={category.id}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          {category.icon}
                          {category.title}
                          <Badge variant="outline" className="ml-auto">
                            {completedCount}/{category.items.length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-1">
                          {filteredItems.map(item => (
                            <ChecklistItemRow
                              key={item.id}
                              id={item.id}
                              label={item.label}
                              path={item.path}
                              description={item.description}
                              state={getItemState('routes', item.id)}
                              onStatusChange={(status) => setItemStatus('routes', item.id, status)}
                              onNotesChange={(notes) => setItemNotes('routes', item.id, notes)}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Database Tables Tab */}
          <TabsContent value="tables">
            <DatabaseTablesList
              tableStates={state.tables}
              tableStats={tableStats}
              isLoading={isLoadingStats}
              activeFilter={activeFilter}
              onStatusChange={(id, status) => setItemStatus('tables', id, status)}
              onNotesChange={(id, notes) => setItemNotes('tables', id, notes)}
            />
          </TabsContent>

          {/* Edge Functions Tab */}
          <TabsContent value="functions">
            <EdgeFunctionsList
              functionStates={state.functions}
              activeFilter={activeFilter}
              onStatusChange={(id, status) => setItemStatus('functions', id, status)}
              onNotesChange={(id, notes) => setItemNotes('functions', id, notes)}
            />
          </TabsContent>

          {/* User Flows Tab */}
          <TabsContent value="flows">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('devChecklist.criticalFlows')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {USER_FLOWS.filter(flow => filterItem(flow.id, 'flows')).map(flow => (
                    <div key={flow.id}>
                      <ChecklistItemRow
                        id={flow.id}
                        label={flow.label}
                        description={flow.steps}
                        state={getItemState('flows', flow.id)}
                        onStatusChange={(status) => setItemStatus('flows', flow.id, status)}
                        onNotesChange={(notes) => setItemNotes('flows', flow.id, notes)}
                      />
                      <p className="text-xs text-muted-foreground pl-11 pb-2">{flow.steps}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('devChecklist.keyFeatures')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {FEATURE_CHECKLIST.filter(f => filterItem(f.id, 'features')).map(feature => (
                    <ChecklistItemRow
                      key={feature.id}
                      id={feature.id}
                      label={feature.label}
                      state={getItemState('features', feature.id)}
                      onStatusChange={(status) => setItemStatus('features', feature.id, status)}
                      onNotesChange={(notes) => setItemNotes('features', feature.id, notes)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DevChecklist;
