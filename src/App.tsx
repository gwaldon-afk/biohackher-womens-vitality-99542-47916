import React from "react";

const App = () => {
  console.log("MINIMAL APP RENDERING");
  return (
    <div style={{ padding: "20px", backgroundColor: "white", color: "black" }}>
      <h1>Test App</h1>
      <p>If you can see this, React is working</p>
    </div>
  );
};

export default App;