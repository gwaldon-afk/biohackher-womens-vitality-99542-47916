import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Navigation from "./components/Navigation";
import "./index.css";

console.log("=== FULL APP LOADING ===");

// Simple placeholder components for now
const HomePage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16" style={{ backgroundColor: '#f0f0f0', minHeight: '500px' }}>
      <div style={{ padding: '20px', backgroundColor: 'white', border: '2px solid #000' }}>
        <h1 className="text-4xl font-bold mb-6" style={{ color: 'black' }}>
          <span className="text-foreground">Biohack</span>
          <span className="text-primary italic">her</span>
          <sup className="text-sm font-normal ml-1">®</sup>
        </h1>
        <p className="text-xl mb-8 text-muted-foreground" style={{ color: 'black' }}>
          Live well longer. Empowering women to beat ageing through biohacking.
        </p>
        <div style={{ backgroundColor: '#e0e0e0', padding: '10px', marginTop: '20px' }}>
          <h2 style={{ color: 'black' }}>HOME PAGE CONTENT IS HERE</h2>
          <p style={{ color: 'black' }}>This is the main homepage content area.</p>
        </div>
      </div>
    </div>
  </div>
);

const AuthPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Authentication</h1>
    </div>
  </div>
);

const DashboardPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">My Data Dashboard</h1>
    </div>
  </div>
);

const SymptomsPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16" style={{ backgroundColor: '#f0f0f0', minHeight: '500px' }}>
      <div style={{ padding: '20px', backgroundColor: 'white', border: '2px solid #000' }}>
        <h1 className="text-3xl font-bold" style={{ color: 'black' }}>Symptom Assessment</h1>
        <div style={{ backgroundColor: '#e0e0e0', padding: '10px', marginTop: '20px' }}>
          <h2 style={{ color: 'black' }}>SYMPTOMS PAGE CONTENT IS HERE</h2>
          <p style={{ color: 'black' }}>This is the symptoms assessment page.</p>
        </div>
      </div>
    </div>
  </div>
);

const ShopPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Shop</h1>
    </div>
  </div>
);

const TherapiesPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Therapies</h1>
    </div>
  </div>
);

const SleepPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Sleep</h1>
    </div>
  </div>
);

const NutritionPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Nutrition</h1>
    </div>
  </div>
);

const SupplementsPage = () => (
  <div className="min-h-screen bg-background">
    <Navigation />
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold">Supplements</h1>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  console.log("=== FULL APP RENDERING ===");
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/symptoms" element={<SymptomsPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/therapies" element={<TherapiesPage />} />
                <Route path="/sleep" element={<SleepPage />} />
                <Route path="/nutrition" element={<NutritionPage />} />
                <Route path="/supplements" element={<SupplementsPage />} />
                <Route path="*" element={<div className="p-8"><h1>404 - Page Not Found</h1></div>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;