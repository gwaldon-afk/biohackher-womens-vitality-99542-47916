import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Navigation from "./components/Navigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Symptoms from "./pages/Symptoms";
import SymptomAssessment from "./pages/SymptomAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import AssessmentHistory from "./pages/AssessmentHistory";
import BiohackingToolkit from "./pages/BiohackingToolkit";
import Therapies from "./pages/Therapies";
import Supplements from "./pages/Supplements";
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
import MyProtocol from "./pages/MyProtocol";
import AdvisoryBoard from "./pages/AdvisoryBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/symptoms" element={<Symptoms />} />
            <Route path="/assessment/:symptomId" element={<SymptomAssessment />} />
            <Route path="/assessment/:symptomId/results" element={<AssessmentResults />} />
            <Route path="/assessment-history" element={<AssessmentHistory />} />
            <Route path="/biohacking-toolkit" element={<BiohackingToolkit />} />
            <Route path="/therapies" element={<Therapies />} />
            <Route path="/supplements" element={<Supplements />} />
            <Route path="/sleep" element={<Sleep />} />
            <Route path="/nutrition" element={<Nutrition />} />
            <Route path="/coaching" element={<Coaching />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/upgrade" element={<Upgrade />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/pillars" element={<Pillars />} />
            <Route path="/7-day-plan/:pillar" element={<SevenDayPlan />} />
            <Route path="/longevity-mindset-quiz" element={<LongevityMindsetQuiz />} />
            <Route path="/my-protocol" element={<MyProtocol />} />
            <Route path="/advisory-board" element={<AdvisoryBoard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
