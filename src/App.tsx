import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Symptoms from "./pages/Symptoms";
import SymptomsHistory from "./pages/SymptomsHistory";
import SymptomAssessment from "./pages/SymptomAssessment";
import AssessmentResults from "./pages/AssessmentResults";
import AssessmentHistory from "./pages/AssessmentHistory";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("=== FULL APP WITH ALL FEATURES LOADING ===");
  
  return (
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
                <Route path="/symptoms-history" element={<SymptomsHistory />} />
                <Route path="/assessment/:symptomId" element={<SymptomAssessment />} />
                <Route path="/assessment/:symptomId/results" element={<AssessmentResults />} />
                <Route path="/assessment-history" element={<AssessmentHistory />} />
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;