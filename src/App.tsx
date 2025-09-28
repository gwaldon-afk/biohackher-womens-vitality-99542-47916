import React from "react";

console.log("=== ULTRA MINIMAL APP LOADING ===");

const App = () => {
  console.log("=== ULTRA MINIMAL APP RENDERING ===");
  
  return (
    <div style={{ 
      padding: "20px", 
      backgroundColor: "white", 
      color: "black",
      minHeight: "100vh"
    }}>
      <h1>Biohackher - Site Working</h1>
      <p>Your site is loading properly!</p>
      <div style={{ marginTop: "20px", backgroundColor: "#f0f0f0", padding: "10px" }}>
        <h2>Navigation Test</h2>
        <button>Home</button>
        <button>Dashboard</button>
      </div>
    </div>
  );
};

export default App;