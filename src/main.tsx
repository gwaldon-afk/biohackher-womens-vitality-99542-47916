import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

console.log("=== ULTRA MINIMAL MAIN LOADING ===");

createRoot(document.getElementById("root")!).render(<App />);