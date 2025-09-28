import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";

console.log("=== APP.TSX LOADING ===");

// Simple test components instead of complex imports
const TestIndex = () => (
  <div className="p-8">
    <h1 className="text-4xl font-bold mb-4">Biohackher Homepage</h1>
    <p className="text-lg">Homepage is working!</p>
  </div>
);

const TestAuth = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Auth Page</h1>
  </div>
);

const TestDashboard = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Dashboard</h1>
  </div>
);

const TestNotFound = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  console.log("=== APP COMPONENT RENDERING ===");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<TestIndex />} />
                <Route path="/auth" element={<TestAuth />} />
                <Route path="/dashboard" element={<TestDashboard />} />
                <Route path="*" element={<TestNotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;