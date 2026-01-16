import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { FloatingAIAssistant } from "@/components/FloatingAIAssistant";
import { FloatingMealSnapButton } from "@/components/today/FloatingMealSnapButton";
import { Shell } from "@/components/layout/Shell";

import { DevTestingPanel } from "@/components/dev/DevTestingPanel";
import { TEST_MODE_ENABLED } from "@/config/testMode";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ProtocolRecommendationsNotifier } from "@/components/ProtocolRecommendationsNotifier";
import { GoalDiscoveryWizard } from "./components/goals/GoalDiscoveryWizard";
import AIGoalWizard from "./components/AIGoalWizard";
import GoalWizard from "./components/GoalWizard";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { LIS2InitialAssessment } from "./components/LIS2InitialAssessment";
import ProtectedRoute from "./components/ProtectedRoute";
import { RequireHealthProfile } from "./components/RequireHealthProfile";
import { RedirectToAbout } from "./pages/RedirectToAbout";
import EvidenceDrawer from "./components/EvidenceDrawer";

// Route-level code splitting
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const SymptomAssessment = lazy(() => import("./pages/SymptomAssessment"));
const AssessmentResults = lazy(() => import("./pages/AssessmentResults"));
const AssessmentHistory = lazy(() => import("./pages/AssessmentHistory"));
const BiohackingToolkit = lazy(() => import("./pages/BiohackingToolkit"));
const ResearchEvidence = lazy(() => import("./pages/ResearchEvidence"));
const LISResults = lazy(() => import("./pages/LISResults"));
const DailyScoreResults = lazy(() => import("./pages/DailyScoreResults"));
const Sleep = lazy(() => import("./pages/Sleep"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const LongevityNutritionAssessment = lazy(() => import("./pages/longevity-nutrition/LongevityNutritionAssessment"));
const LongevityNutritionResults = lazy(() => import("./pages/longevity-nutrition/LongevityNutritionResults"));
const MasterDashboard = lazy(() => import("./pages/MasterDashboard"));
const Coaching = lazy(() => import("./pages/Coaching"));
const Reports = lazy(() => import("./pages/Reports"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Settings = lazy(() => import("./pages/Settings"));
const Shop = lazy(() => import("./pages/Shop"));
const Pillars = lazy(() => import("./pages/Pillars"));
const PillarsDisplay = lazy(() => import("./pages/PillarsDisplay"));
const SevenDayPlan = lazy(() => import("./pages/SevenDayPlan"));
const LongevityMindsetQuiz = lazy(() => import("./pages/LongevityMindsetQuiz"));
const BrainAssessment = lazy(() => import("./pages/BrainAssessment"));
const GuestLISAssessment = lazy(() => import("./pages/GuestLISAssessment"));
const LIS2Research = lazy(() => import("./pages/LIS2Research"));
const MyProtocol = lazy(() => import("./pages/MyProtocol"));
const ProtocolLibrary = lazy(() => import("./pages/ProtocolLibrary"));
const ProgressTracking = lazy(() => import("./pages/ProgressTracking"));
const GuestGoalsPreview = lazy(() => import("./pages/GuestGoalsPreview"));
const About = lazy(() => import("./pages/About"));
const HealthAssistant = lazy(() => import("./pages/HealthAssistant"));
const ImportResearch = lazy(() => import("./pages/ImportResearch"));
const CompleteHealthProfile = lazy(() => import("./pages/CompleteHealthProfile"));
const MyDailyPlan = lazy(() => import("./pages/MyDailyPlan"));
const ToolkitCategory = lazy(() => import("./pages/ToolkitCategory"));
const Achievements = lazy(() => import("./pages/Achievements"));
const SymptomTrends = lazy(() => import("./pages/SymptomTrends"));
const WearableIntegrations = lazy(() => import("./pages/WearableIntegrations"));
const MyGoals = lazy(() => import("./pages/MyGoals"));
const GoalInsights = lazy(() => import("./pages/GoalInsights"));
const GoalDetail = lazy(() => import("./pages/GoalDetail"));
const HormoneCompassAssessment = lazy(() => import("./pages/hormone-compass/HormoneCompassAssessment"));
const HormoneCompassResults = lazy(() => import("./pages/hormone-compass/HormoneCompassResults"));
const EnergyLoopDashboard = lazy(() => import("./pages/energy/EnergyLoopDashboard"));
const EnergyQuickStart = lazy(() => import("./pages/energy/EnergyQuickStart"));
const EnergyOnboarding = lazy(() => import("./pages/energy/EnergyOnboarding"));
const EnergyCheckIn = lazy(() => import("./pages/energy/EnergyCheckIn"));
const EnergyProgress = lazy(() => import("./pages/energy/EnergyProgress"));
const EnergyActions = lazy(() => import("./pages/energy/EnergyActions"));
const ExerciseSetup = lazy(() => import("./pages/ExerciseSetup"));
const ExpertDirectory = lazy(() => import("./pages/expert/ExpertDirectory"));
const ExpertProfile = lazy(() => import("./pages/expert/ExpertProfile"));
const ExpertRegistration = lazy(() => import("./pages/expert/ExpertRegistration"));
const ExpertDashboard = lazy(() => import("./pages/expert/ExpertDashboard"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ContentManagement = lazy(() => import("./pages/admin/ContentManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ExpertVerification = lazy(() => import("./pages/admin/ExpertVerification"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const ShopManagement = lazy(() => import("./pages/admin/ShopManagement"));
const ProductLinking = lazy(() => import("./pages/admin/ProductLinking"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const Intro3Step = lazy(() => import("./pages/onboarding/Intro3Step"));
const PermissionSetup = lazy(() => import("./pages/onboarding/PermissionSetup"));
const HormoneCompassMenopause = lazy(() => import("./pages/onboarding/HormoneCompassMenopause"));
const HormoneCompassResultsOnboarding = lazy(() => import("./pages/onboarding/HormoneCompassResults"));
const GoalSetupChat = lazy(() => import("./pages/onboarding/GoalSetupChat"));
const GoalAffirmation = lazy(() => import("./pages/onboarding/GoalAffirmation"));
const HormonalHealthTriage = lazy(() => import("./pages/HormonalHealthTriage"));
const LISDailyCheckIn = lazy(() => import("./pages/LISDailyCheckIn"));
const PlanHome = lazy(() => import("./pages/PlanHome"));
const NutritionScan = lazy(() => import("./pages/NutritionScan"));
const MoodCheckin = lazy(() => import("./pages/MoodCheckin"));
const QuickLog = lazy(() => import("./pages/QuickLog"));
const DashboardMain = lazy(() => import("./pages/DashboardMain"));
const InsightsDetail = lazy(() => import("./pages/InsightsDetail"));
const ExpertFinderMap = lazy(() => import("./pages/ExpertFinderMap"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const Profile = lazy(() => import("./pages/Profile"));
const NinetyDayPlan = lazy(() => import("./pages/plans/NinetyDayPlan"));
const WeeklyPlan = lazy(() => import("./pages/plans/WeeklyPlan"));
const TwentyEightDayPlan = lazy(() => import("./pages/plans/TwentyEightDayPlan"));
const MealPlanWeek = lazy(() => import("./pages/nutrition/MealPlanWeek"));
const DevChecklist = lazy(() => import("./pages/DevChecklist"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <EvidenceDrawer />
          <BrowserRouter>
            <ErrorBoundary>
              <ProtocolRecommendationsNotifier />
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center p-6 text-muted-foreground">
                    Loading…
                  </div>
                }
              >
                <Routes>
                  <Route element={<Shell />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/complete-profile" element={<ProtectedRoute><CompleteHealthProfile /></ProtectedRoute>} />
                    <Route path="/today" element={<ProtectedRoute><RequireHealthProfile><MyDailyPlan /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/plans/28-day" element={<ProtectedRoute><RequireHealthProfile><TwentyEightDayPlan /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/plans/90-day" element={<ProtectedRoute><RequireHealthProfile><NinetyDayPlan /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/plans/weekly" element={<ProtectedRoute><RequireHealthProfile><WeeklyPlan /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/nutrition/meal-plan" element={<ProtectedRoute><RequireHealthProfile><MealPlanWeek /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/guest-lis-assessment" element={<GuestLISAssessment />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/onboarding" element={<OnboardingFlow />} />
                    <Route path="/dashboard" element={<Navigate to="/today" replace />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/symptom-trends" element={<SymptomTrends />} />
                    <Route path="/wearables" element={<ProtectedRoute><WearableIntegrations /></ProtectedRoute>} />
                    <Route path="/symptoms" element={<Navigate to="/pillars" replace />} />
                    <Route path="/assessment/:symptomId" element={<SymptomAssessment />} />
                    <Route path="/assessment/:symptomId/results" element={<AssessmentResults />} />
                    <Route path="/assessment-history" element={<AssessmentHistory />} />
                    <Route path="/biohacking-toolkit" element={<BiohackingToolkit />} />
                    <Route path="/research-evidence" element={<ResearchEvidence />} />
                    <Route path="/sleep" element={<Sleep />} />
                    <Route path="/nutrition" element={<ProtectedRoute><RequireHealthProfile><Nutrition /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/longevity-nutrition" element={<LongevityNutritionAssessment />} />
                    <Route path="/longevity-nutrition/results" element={<LongevityNutritionResults />} />
                    <Route path="/coaching" element={<Coaching />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/upgrade" element={<Upgrade />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/faq" element={<RedirectToAbout tab="faq" />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/pillars" element={<Pillars />} />
                    <Route path="/pillars-display" element={<PillarsDisplay />} />
                    <Route
                      path="/7-day-plan/:pillar"
                      element={
                        <ProtectedRoute>
                          <RequireHealthProfile>
                            <SevenDayPlan />
                          </RequireHealthProfile>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/longevity-mindset-quiz" element={<LongevityMindsetQuiz />} />
                    <Route path="/brain-assessment" element={<BrainAssessment />} />
                    <Route path="/lis2-setup" element={<LIS2InitialAssessment />} />
                    <Route path="/lis-results" element={<LISResults />} />
                    <Route path="/daily-score-results" element={<DailyScoreResults />} />
                    <Route path="/lis2-research" element={<LIS2Research />} />
                    <Route path="/my-protocol" element={<ProtectedRoute><RequireHealthProfile><MyProtocol /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/protocol-library" element={<ProtectedRoute><ProtocolLibrary /></ProtectedRoute>} />
                    <Route path="/master-dashboard" element={<ProtectedRoute><RequireHealthProfile><MasterDashboard /></RequireHealthProfile></ProtectedRoute>} />
                    <Route path="/progress" element={<ProgressTracking />} />
                    <Route path="/advisory-board" element={<RedirectToAbout tab="advisory" />} />
                    <Route path="/research-evidence" element={<RedirectToAbout tab="research" />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/health-assistant" element={<HealthAssistant />} />
                    <Route path="/symptom-tracking" element={<Navigate to="/pillars" replace />} />
                    <Route path="/import-research" element={<ImportResearch />} />
                    <Route path="/goals-preview" element={<GuestGoalsPreview />} />
                    {/* Goals Dashboard - Redirect to main dashboard */}
                    <Route path="/goals-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/goals/discovery" element={<ProtectedRoute><GoalDiscoveryWizard /></ProtectedRoute>} />
                    <Route path="/goals/insights" element={<ProtectedRoute><GoalInsights /></ProtectedRoute>} />
                    <Route path="/my-goals" element={<ProtectedRoute><MyGoals /></ProtectedRoute>} />
                    <Route path="/my-goals/wizard" element={<ProtectedRoute><AIGoalWizard /></ProtectedRoute>} />
                    <Route path="/my-goals/wizard-manual" element={<ProtectedRoute><GoalWizard /></ProtectedRoute>} />
                    <Route path="/my-goals/:goalId" element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} />
                    {/* Dynamic toolkit category route - MUST be before catch-all */}
                    <Route path="/:categorySlug" element={<ToolkitCategory />} />

                    {/* HormoneCompass™ Routes - Assessment only (dashboard deprecated) */}
                    <Route path="/hormone-compass/assessment" element={<ProtectedRoute><HormoneCompassAssessment /></ProtectedRoute>} />
                    <Route path="/hormone-compass/results" element={<ProtectedRoute><HormoneCompassResults /></ProtectedRoute>} />
                    {/* Legacy redirects - redirect dashboard to profile */}
                    <Route path="/hormone-compass" element={<Navigate to="/profile" replace />} />
                    <Route path="/hormone-compass/tracker" element={<Navigate to="/profile" replace />} />
                    <Route path="/menomap" element={<Navigate to="/profile" replace />} />
                    <Route path="/menomap/assessment" element={<Navigate to="/hormone-compass/assessment" replace />} />
                    <Route path="/menomap/results" element={<Navigate to="/hormone-compass/results" replace />} />
                    <Route path="/menomap/tracker" element={<Navigate to="/profile" replace />} />

                    {/* Energy Loop Routes */}
                    <Route path="/energy-loop" element={<ProtectedRoute><EnergyLoopDashboard /></ProtectedRoute>} />
                    <Route path="/energy-loop/quick-start" element={<ProtectedRoute><EnergyQuickStart /></ProtectedRoute>} />
                    <Route path="/energy-loop/onboarding" element={<ProtectedRoute><EnergyOnboarding /></ProtectedRoute>} />
                    <Route path="/energy-loop/check-in" element={<ProtectedRoute><EnergyCheckIn /></ProtectedRoute>} />
                    <Route path="/energy-loop/progress" element={<ProtectedRoute><EnergyProgress /></ProtectedRoute>} />
                    <Route path="/energy-loop/actions" element={<ProtectedRoute><EnergyActions /></ProtectedRoute>} />

                    {/* Exercise Module Routes */}
                    <Route path="/exercise/setup" element={<ProtectedRoute><RequireHealthProfile><ExerciseSetup /></RequireHealthProfile></ProtectedRoute>} />

                    {/* Expert Partner Routes */}
                    <Route path="/experts" element={<ExpertDirectory />} />
                    <Route path="/expert/:id" element={<ExpertProfile />} />
                    <Route path="/expert/register" element={<ProtectedRoute><ExpertRegistration /></ProtectedRoute>} />
                    <Route path="/expert/dashboard" element={<ProtectedRoute><ExpertDashboard /></ProtectedRoute>} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="content" element={<ContentManagement />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="experts" element={<ExpertVerification />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="shop" element={<ShopManagement />} />
                      <Route path="product-linking" element={<ProductLinking />} />
                      <Route path="system" element={<SystemHealth />} />
                    </Route>

                    {/* New Onboarding Flow Routes */}
                    <Route path="/onboarding/intro-3step" element={<Intro3Step />} />
                    <Route path="/onboarding/permission-setup" element={<PermissionSetup />} />
                    <Route path="/onboarding/hormone-compass-menopause" element={<HormoneCompassMenopause />} />
                    {/* Legacy MenoMap onboarding redirects - redirect to unified assessment */}
                    <Route path="/onboarding/menomap-entry" element={<Navigate to="/guest-lis-assessment" replace />} />
                    <Route path="/onboarding/hormone-compass-entry" element={<Navigate to="/guest-lis-assessment" replace />} />
                    <Route path="/onboarding/menomap-performance" element={<Navigate to="/guest-lis-assessment" replace />} />
                    <Route path="/onboarding/hormone-compass-performance" element={<Navigate to="/guest-lis-assessment" replace />} />
                    <Route path="/onboarding/menomap-menopause" element={<Navigate to="/onboarding/hormone-compass-menopause" replace />} />
                    <Route path="/hormonal-health/triage" element={<HormonalHealthTriage />} />
                    <Route path="/daily-check-in" element={<ProtectedRoute><LISDailyCheckIn /></ProtectedRoute>} />
                    <Route path="/onboarding/hormone-compass-results" element={<HormoneCompassResultsOnboarding />} />
                    <Route path="/onboarding/menomap-results" element={<Navigate to="/onboarding/hormone-compass-results" replace />} />
                    <Route path="/onboarding/goal-setup-chat" element={<GoalSetupChat />} />
                    <Route path="/onboarding/goal-affirmation" element={<GoalAffirmation />} />

                    {/* New User Journey Routes */}
                    <Route path="/plan-home" element={<ProtectedRoute><PlanHome /></ProtectedRoute>} />
                    <Route path="/nutrition-scan" element={<ProtectedRoute><NutritionScan /></ProtectedRoute>} />
                    <Route path="/mood-checkin" element={<ProtectedRoute><MoodCheckin /></ProtectedRoute>} />
                    <Route path="/quick-log" element={<ProtectedRoute><QuickLog /></ProtectedRoute>} />
                    <Route path="/dashboard-main" element={<ProtectedRoute><DashboardMain /></ProtectedRoute>} />
                    <Route path="/insights-detail" element={<ProtectedRoute><InsightsDetail /></ProtectedRoute>} />
                    <Route path="/expert-finder-map" element={<ExpertFinderMap />} />
                    <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/dev-checklist" element={<DevChecklist />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
          <FloatingMealSnapButton />
          <FloatingAIAssistant />
          {TEST_MODE_ENABLED && <DevTestingPanel />}
        </ErrorBoundary>
      </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
