import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

console.log("=== APP WITH ROUTING LOADING ===");

const HomePage = () => (
  <div className="min-h-screen bg-background p-8">
    <h1 className="text-4xl font-bold mb-6">
      <span className="text-foreground">Biohack</span>
      <span className="text-primary italic">her</span>
      <sup className="text-sm font-normal ml-1">®</sup>
    </h1>
    <p className="text-xl mb-8 text-muted-foreground">
      Live well longer. Empowering women to beat ageing through biohacking.
    </p>
    <div className="flex gap-4">
      <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
        Map my journey
      </button>
      <button className="px-4 py-2 border border-border rounded">
        View Dashboard
      </button>
    </div>
  </div>
);

const App = () => {
  console.log("=== APP WITH ROUTING RENDERING ===");
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<div className="p-8"><h1>404 - Page Not Found</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;