import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Symptoms from "./pages/Symptoms";
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
import LISAssessment from "./pages/LISAssessment";
import LIS2Research from "./pages/LIS2Research";
import MyProtocol from "./pages/MyProtocol";
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
import MenoMapAssessment from "./pages/menomap/MenoMapAssessment";
import MenoMapResults from "./pages/menomap/MenoMapResults";
import MenoMapTracker from "./pages/menomap/MenoMapTracker";
import MenoMapDashboard from "./pages/menomap/MenoMapDashboard";
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
import WelcomeStreamSelect from "./pages/onboarding/WelcomeStreamSelect";
import Intro3Step from "./pages/onboarding/Intro3Step";
import PermissionSetup from "./pages/onboarding/PermissionSetup";
import MenoMapEntry from "./pages/onboarding/MenoMapEntry";
import MenoMapPerformance from "./pages/onboarding/MenoMapPerformance";
import MenoMapMenopause from "./pages/onboarding/MenoMapMenopause";
import MenoMapResultsOnboarding from "./pages/onboarding/MenoMapResults";
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
                <Route path="/today" element={<ProtectedRoute><MyDailyPlan /></ProtectedRoute>} />
                <Route path="/guest-lis-assessment" element={<GuestLISAssessment />} />
                <Route path="/guest-lis-results/:sessionId" element={<GuestLISResults />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<OnboardingFlow />} />
                <Route path="/dashboard" element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/symptom-trends" element={<SymptomTrends />} />
                <Route path="/wearables" element={<ProtectedRoute><WearableIntegrations /></ProtectedRoute>} />
                <Route path="/symptoms" element={<Symptoms />} />
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
            <Route path="/lis-assessment" element={<LISAssessment />} />
            <Route path="/brain-assessment" element={<BrainAssessment />} />
            <Route path="/lis2-setup" element={<LIS2InitialAssessment />} />
            <Route path="/lis-results" element={<LISResults />} />
            <Route path="/daily-score-results" element={<DailyScoreResults />} />
            <Route path="/lis2-research" element={<LIS2Research />} />
            <Route path="/my-protocol" element={<ProtectedRoute><MyProtocol /></ProtectedRoute>} />
            <Route path="/progress" element={<ProgressTracking />} />
            <Route path="/advisory-board" element={<RedirectToAbout tab="advisory" />} />
            <Route path="/research-evidence" element={<RedirectToAbout tab="research" />} />
            <Route path="/about" element={<About />} />
            <Route path="/health-assistant" element={<HealthAssistant />} />
            <Route path="/symptom-tracking" element={<Symptoms />} />
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
            
            {/* MenoMap Routes */}
          <Route path="/menomap" element={<ProtectedRoute><MenoMapDashboard /></ProtectedRoute>} />
          <Route path="/menomap/assessment" element={<ProtectedRoute><MenoMapAssessment /></ProtectedRoute>} />
          <Route path="/menomap/results" element={<ProtectedRoute><MenoMapResults /></ProtectedRoute>} />
          <Route path="/menomap/tracker" element={<ProtectedRoute><MenoMapTracker /></ProtectedRoute>} />
          
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
          <Route path="/admin/experts" element={<ProtectedRoute><ExpertVerification /></ProtectedRoute>} />
          
          {/* New Onboarding Flow Routes */}
          <Route path="/onboarding/welcome-stream-select" element={<WelcomeStreamSelect />} />
          <Route path="/onboarding/intro-3step" element={<Intro3Step />} />
          <Route path="/onboarding/permission-setup" element={<PermissionSetup />} />
          <Route path="/onboarding/menomap-entry" element={<MenoMapEntry />} />
          <Route path="/onboarding/menomap-performance" element={<MenoMapPerformance />} />
          <Route path="/onboarding/menomap-menopause" element={<MenoMapMenopause />} />
          <Route path="/onboarding/menomap-results" element={<MenoMapResultsOnboarding />} />
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
