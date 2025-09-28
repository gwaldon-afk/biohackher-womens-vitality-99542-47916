import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

console.log("=== MAIN.TSX LOADING ===");

const TestApp = () => {
  console.log("=== TEST APP RENDERING ===");
  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "#ffffff", 
      color: "#000000",
      minHeight: "100vh",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>BIOHACKHER TEST</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
        If you can see this text, the React app is working properly.
      </p>
      <button 
        style={{ 
          padding: "10px 20px", 
          backgroundColor: "#007bff", 
          color: "white", 
          border: "none", 
          borderRadius: "4px",
          cursor: "pointer"
        }}
        onClick={() => alert("Button clicked!")}
      >
        Test Button
      </button>
    </div>
  );
};

const rootElement = document.getElementById("root");
console.log("=== ROOT ELEMENT ===", rootElement);

if (rootElement) {
  createRoot(rootElement).render(<TestApp />);
} else {
  console.error("ROOT ELEMENT NOT FOUND!");
}