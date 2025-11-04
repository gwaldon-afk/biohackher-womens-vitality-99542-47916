import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import { FloatingAIAssistant } from "@/components/FloatingAIAssistant";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

import SymptomAssessment from "./pages/SymptomAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import AssessmentHistory from "./pages/AssessmentHistory";
import BiohackingToolkit from "./pages/BiohackingToolkit";
import ResearchEvidence from "./pages/ResearchEvidence";
import LISResults from "./pages/LISResults";
import DailyScoreResults from "./pages/DailyScoreResults";
import Sleep from "./pages/Sleep";
import Nutrition from "./pages/Nutrition";
import Coaching from "./pages/Coaching";
import Reports from "./pages/Reports";
import Upgrade from "./pages/Upgrade";
import Settings from "./pages/Settings";
import FAQ from "./pages/FAQ";
import Shop from "./pages/Shop";
import Pillars from "./pages/Pillars";
import SevenDayPlan from "./pages/SevenDayPlan";
import LongevityMindsetQuiz from "./pages/LongevityMindsetQuiz";
import LIS2Research from "./pages/LIS2Research";
import MyProtocol from "./pages/MyProtocol";
import ProtocolLibrary from "./pages/ProtocolLibrary";
import ProgressTracking from "./pages/ProgressTracking";
import MyGoals from "./pages/MyGoals";
import GoalInsights from "./pages/GoalInsights";
import { GoalDiscoveryWizard } from "./components/goals/GoalDiscoveryWizard";
import AIGoalWizard from "./components/AIGoalWizard";
import GoalWizard from "./components/GoalWizard";
import GoalDetail from "./pages/GoalDetail";
import GuestGoalsPreview from "./pages/GuestGoalsPreview";
import AdvisoryBoard from "./pages/AdvisoryBoard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import HormoneCompassAssessment from "./pages/hormone-compass/HormoneCompassAssessment";
import HormoneCompassResults from "./pages/hormone-compass/HormoneCompassResults";
import HormoneCompassTracker from "./pages/hormone-compass/HormoneCompassTracker";
import HormoneCompassDashboard from "./pages/hormone-compass/HormoneCompassDashboard";
import EnergyCheckIn from "./pages/energy/EnergyCheckIn";
import EnergyProgress from "./pages/energy/EnergyProgress";
import EnergyActions from "./pages/energy/EnergyActions";
import EnergyOnboarding from "./pages/energy/EnergyOnboarding";
import EnergyLoopDashboard from "./pages/energy/EnergyLoopDashboard";
import EnergyQuickStart from "./pages/energy/EnergyQuickStart";
import ExpertRegistration from "./pages/expert/ExpertRegistration";
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import ExpertDirectory from "./pages/expert/ExpertDirectory";
import ExpertProfile from "./pages/expert/ExpertProfile";
import ExpertVerification from "./pages/admin/ExpertVerification";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ContentManagement from "./pages/admin/ContentManagement";
import UserManagement from "./pages/admin/UserManagement";
import Analytics from "./pages/admin/Analytics";
import ShopManagement from "./pages/admin/ShopManagement";
import SystemHealth from "./pages/admin/SystemHealth";
import { AdminRoute } from "./components/AdminRoute";
import { AdminLayout } from "./components/AdminLayout";
import { LIS2InitialAssessment } from "./components/LIS2InitialAssessment";
import GuestLISAssessment from "./pages/GuestLISAssessment";
import GuestLISResults from "./pages/GuestLISResults";
import BrainAssessment from "./pages/BrainAssessment";
import ToolkitCategory from "./pages/ToolkitCategory";
import Achievements from "./pages/Achievements";
import SymptomTrends from "./pages/SymptomTrends";
import WearableIntegrations from "./pages/WearableIntegrations";
import HealthAssistant from "./pages/HealthAssistant";
import ProtectedRoute from "./components/ProtectedRoute";
import { RedirectToAbout } from "./pages/RedirectToAbout";
import ImportResearch from "./pages/ImportResearch";
import MyDailyPlan from "./pages/MyDailyPlan";
import EvidenceDrawer from "./components/EvidenceDrawer";
import Intro3Step from "./pages/onboarding/Intro3Step";
import PermissionSetup from "./pages/onboarding/PermissionSetup";
import HormoneCompassMenopause from "./pages/onboarding/HormoneCompassMenopause";
import HormoneCompassResultsOnboarding from "./pages/onboarding/HormoneCompassResults";
import GoalSetupChat from "./pages/onboarding/GoalSetupChat";
import GoalAffirmation from "./pages/onboarding/GoalAffirmation";
import PlanHome from "./pages/PlanHome";
import NutritionScan from "./pages/NutritionScan";
import MoodCheckin from "./pages/MoodCheckin";
import QuickLog from "./pages/QuickLog";
import DashboardMain from "./pages/DashboardMain";
import InsightsDetail from "./pages/InsightsDetail";
import ExpertFinderMap from "./pages/ExpertFinderMap";
import ProfileSettings from "./pages/ProfileSettings";
import HormonalHealthTriage from "./pages/HormonalHealthTriage";
import LISDailyCheckIn from "./pages/LISDailyCheckIn";

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
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/today" element={<MyDailyPlan />} />
                <Route path="/guest-lis-assessment" element={<GuestLISAssessment />} />
                <Route path="/guest-lis-results/:sessionId" element={<GuestLISResults />} />
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
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/faq" element={<RedirectToAbout tab="faq" />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/pillars" element={<Pillars />} />
            <Route path="/7-day-plan/:pillar" element={<SevenDayPlan />} />
            <Route path="/longevity-mindset-quiz" element={<LongevityMindsetQuiz />} />
            <Route path="/brain-assessment" element={<BrainAssessment />} />
            <Route path="/lis2-setup" element={<LIS2InitialAssessment />} />
            <Route path="/lis-results" element={<LISResults />} />
            <Route path="/daily-score-results" element={<DailyScoreResults />} />
            <Route path="/lis2-research" element={<LIS2Research />} />
            <Route path="/my-protocol" element={<ProtectedRoute><MyProtocol /></ProtectedRoute>} />
            <Route path="/protocol-library" element={<ProtectedRoute><ProtocolLibrary /></ProtectedRoute>} />
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
            
            {/* HormoneCompass™ Routes */}
          <Route path="/hormone-compass" element={<ProtectedRoute><HormoneCompassDashboard /></ProtectedRoute>} />
          <Route path="/hormone-compass/assessment" element={<ProtectedRoute><HormoneCompassAssessment /></ProtectedRoute>} />
          <Route path="/hormone-compass/results" element={<ProtectedRoute><HormoneCompassResults /></ProtectedRoute>} />
          <Route path="/hormone-compass/tracker" element={<ProtectedRoute><HormoneCompassTracker /></ProtectedRoute>} />
          {/* Legacy MenoMap redirects */}
          <Route path="/menomap" element={<Navigate to="/hormone-compass" replace />} />
          <Route path="/menomap/assessment" element={<Navigate to="/hormone-compass/assessment" replace />} />
          <Route path="/menomap/results" element={<Navigate to="/hormone-compass/results" replace />} />
          <Route path="/menomap/tracker" element={<Navigate to="/hormone-compass/tracker" replace />} />
          
          {/* Energy Loop Routes */}
          <Route path="/energy-loop" element={<ProtectedRoute><EnergyLoopDashboard /></ProtectedRoute>} />
          <Route path="/energy-loop/quick-start" element={<ProtectedRoute><EnergyQuickStart /></ProtectedRoute>} />
          <Route path="/energy-loop/onboarding" element={<ProtectedRoute><EnergyOnboarding /></ProtectedRoute>} />
          <Route path="/energy-loop/check-in" element={<ProtectedRoute><EnergyCheckIn /></ProtectedRoute>} />
          <Route path="/energy-loop/progress" element={<ProtectedRoute><EnergyProgress /></ProtectedRoute>} />
          <Route path="/energy-loop/actions" element={<ProtectedRoute><EnergyActions /></ProtectedRoute>} />
          
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
          
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingAIAssistant />
        </ErrorBoundary>
      </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </AuthProvider>
  </QueryClientProvider>
);

export default App;
