import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./styles/global.css";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { AuthProvider } from "./contexts/AuthContext.tsx";

// // Import particles initialization
// import { initParticlesEngine } from "@tsparticles/react";
// import { loadSlim } from "@tsparticles/slim";

// // Initialize particles engine
// initParticlesEngine(async (engine) => {
//   await loadSlim(engine);
// });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </React.StrictMode>
);