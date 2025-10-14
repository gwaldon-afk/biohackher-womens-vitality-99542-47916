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
import GoalWizard from "./components/GoalWizard";
import GuestGoalsPreview from "./pages/GuestGoalsPreview";
import AdvisoryBoard from "./pages/AdvisoryBoard";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
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
            <Route path="/my-goals" element={<ProtectedRoute><MyGoals /></ProtectedRoute>} />
            <Route path="/my-goals/wizard" element={<ProtectedRoute><GoalWizard /></ProtectedRoute>} />
            {/* Dynamic toolkit category route - MUST be before catch-all */}
            <Route path="/:categorySlug" element={<ToolkitCategory />} />
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
