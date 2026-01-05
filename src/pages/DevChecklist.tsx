import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  RotateCcw, 
  Home,
  Globe,
  Lock,
  Shield,
  Workflow,
  Sparkles,
  CheckCircle2,
  Circle,
  FlaskConical
} from 'lucide-react';
import { TEST_MODE_ENABLED } from '@/config/testMode';

interface ChecklistItem {
  id: string;
  label: string;
  path: string;
  description?: string;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ChecklistItem[];
}

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

const STORAGE_KEY = 'biohackher-dev-checklist';

interface ChecklistState {
  routes: Record<string, boolean>;
  flows: Record<string, boolean>;
  features: Record<string, boolean>;
}

const DevChecklist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [state, setState] = useState<ChecklistState>({
    routes: {},
    flows: {},
    features: {}
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse checklist state:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const toggleRoute = (id: string) => {
    setState(prev => ({
      ...prev,
      routes: { ...prev.routes, [id]: !prev.routes[id] }
    }));
  };

  const toggleFlow = (id: string) => {
    setState(prev => ({
      ...prev,
      flows: { ...prev.flows, [id]: !prev.flows[id] }
    }));
  };

  const toggleFeature = (id: string) => {
    setState(prev => ({
      ...prev,
      features: { ...prev.features, [id]: !prev.features[id] }
    }));
  };

  const resetAll = () => {
    setState({ routes: {}, flows: {}, features: {} });
    localStorage.removeItem(STORAGE_KEY);
  };

  const totalRoutes = CHECKLIST_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
  const completedRoutes = Object.values(state.routes).filter(Boolean).length;
  const completedFlows = Object.values(state.flows).filter(Boolean).length;
  const completedFeatures = Object.values(state.features).filter(Boolean).length;
  const totalItems = totalRoutes + USER_FLOWS.length + FEATURE_CHECKLIST.length;
  const completedItems = completedRoutes + completedFlows + completedFeatures;
  const progressPercent = Math.round((completedItems / totalItems) * 100);

  const openRoute = (path: string) => {
    window.open(path, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{t('devChecklist.title')}</h1>
              <p className="text-muted-foreground text-sm">{t('devChecklist.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {TEST_MODE_ENABLED && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t('devChecklist.testModeActive')}
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-1" />
              {t('common.home')}
            </Button>
            <Button variant="destructive" size="sm" onClick={resetAll}>
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('devChecklist.reset')}
            </Button>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {t('devChecklist.progress', { completed: completedItems, total: totalItems })}
              </span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
              <span>{t('devChecklist.routes')}: {completedRoutes}/{totalRoutes}</span>
              <span>{t('devChecklist.flows')}: {completedFlows}/{USER_FLOWS.length}</span>
              <span>{t('devChecklist.features')}: {completedFeatures}/{FEATURE_CHECKLIST.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="routes" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="routes" className="gap-2">
              <Globe className="h-4 w-4" />
              {t('devChecklist.allRoutes')}
            </TabsTrigger>
            <TabsTrigger value="flows" className="gap-2">
              <Workflow className="h-4 w-4" />
              {t('devChecklist.userFlows')}
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('devChecklist.featureChecklist')}
            </TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes">
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-4">
                {CHECKLIST_DATA.map(category => (
                  <Card key={category.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {category.icon}
                        {category.title}
                        <Badge variant="outline" className="ml-auto">
                          {category.items.filter(item => state.routes[item.id]).length}/{category.items.length}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {category.items.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={item.id}
                                checked={state.routes[item.id] || false}
                                onCheckedChange={() => toggleRoute(item.id)}
                              />
                              <label
                                htmlFor={item.id}
                                className={`text-sm cursor-pointer ${state.routes[item.id] ? 'line-through text-muted-foreground' : ''}`}
                              >
                                <span className="font-medium">{item.label}</span>
                                <span className="text-muted-foreground ml-2 text-xs">({item.path})</span>
                              </label>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openRoute(item.path)}
                              className="gap-1 text-xs"
                            >
                              {t('devChecklist.open')}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* User Flows Tab */}
          <TabsContent value="flows">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('devChecklist.criticalFlows')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {USER_FLOWS.map(flow => (
                    <div
                      key={flow.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={flow.id}
                          checked={state.flows[flow.id] || false}
                          onCheckedChange={() => toggleFlow(flow.id)}
                        />
                        <div>
                          <label
                            htmlFor={flow.id}
                            className={`text-sm font-medium cursor-pointer ${state.flows[flow.id] ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {flow.label}
                          </label>
                          <p className="text-xs text-muted-foreground mt-0.5">{flow.steps}</p>
                        </div>
                      </div>
                      {state.flows[flow.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {FEATURE_CHECKLIST.map(feature => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between py-3 px-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={feature.id}
                          checked={state.features[feature.id] || false}
                          onCheckedChange={() => toggleFeature(feature.id)}
                        />
                        <label
                          htmlFor={feature.id}
                          className={`text-sm font-medium cursor-pointer ${state.features[feature.id] ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {feature.label}
                        </label>
                      </div>
                      {state.features[feature.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
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
