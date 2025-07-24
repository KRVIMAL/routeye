// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
// import "./styles/globals.css";
import "./styles/global.css"

// Redux Store
import { store } from "./store/store";

// Theme System
import { ThemeProvider } from "./contexts/ThemeContext";
import { useTheme } from "./hooks/useTheme";

// Auth Context (keep your existing one)
import { AuthProvider } from "./contexts/AuthContext";

// Hooks
import { useTokenExpiry } from "./hooks/useTokenExpiry";

// Auth Pages
import { LoginPage } from "./pages/Modules/Login/Login";
import { EnterOtpPage } from "./pages/Modules/Login/EnterOtp";
import { ForgotPasswordPage } from "./pages/Modules/Login/ForgotPassword";
import { ResetPasswordPage } from "./pages/Modules/Login/ResetPassword";
import { PasswordChangedPage } from "./pages/Modules/Login/PasswordChanged";
import { ContactSupportPage } from "./pages/Modules/Login/ContactSupport";

// Protected Route Component
import ProtectedRoute from "./components/protectedRoute.components";
import Layout from "./components/layout.components";

// Your existing pages
import Login from "./pages/Login"; // Keep for backward compatibility if needed
import Dashboard from "./pages/Modules/Dashboard/Dashboard";
import StyleGuide from "./pages/StyleGuide";
import SelectDemo from "./pages/SelectDemo";
import InputDemo from "./pages/InputDemo";
import DataTableDemo from "./pages/data-table-demo.pages";
import ButtonExamples from "./pages/ButtonExamples";
import InputExamples from "./pages/InputExamples";
import LogoLoader from "./pages/LogoLoader";

// Loader Components
import { LoaderOverlay } from "./components/common/LoaderOverlay";

// Theme Wrapper Component
const ThemeInitializer = ({ children }: { children: React.ReactNode }) => {
  const { theme, mode } = useTheme();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {children}
    </div>
  );
};

function App() {
  useTokenExpiry();

  return (
    <Provider store={store}>
      <ThemeProvider>
        <ThemeInitializer>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--bg-surface)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#FFFFFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFFFFF",
                },
              },
              loading: {
                iconTheme: {
                  primary: "#2463EB",
                  secondary: "#FFFFFF",
                },
              },
            }}
          />
          <LoaderOverlay />

          <AuthProvider>
            <Router>
              <Routes>
                {/* Auth Routes */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/enter-otp" element={<EnterOtpPage />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPasswordPage />}
                />
                <Route
                  path="/auth/password-changed"
                  element={<PasswordChangedPage />}
                />
                <Route
                  path="/auth/contact-support"
                  element={<ContactSupportPage />}
                />

                {/* Redirect old login route to new auth system */}
                <Route
                  path="/login"
                  element={<Navigate to="/auth/login" replace />}
                />

                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          {/* Dashboard */}
                          <Route path="/" element={<Dashboard />} />

                          {/* Demo Pages */}
                          {/* <Route path="/styleguide" element={<StyleGuide />} />
                          <Route path="/selectDemo" element={<SelectDemo />} /> */}
                          <Route
                            path="/inputDemo"
                            element={<InputExamples />}
                          />
                          <Route
                            path="/table-demo"
                            element={<DataTableDemo />}
                          />
                          <Route path="/logo-loader" element={<LogoLoader />} />
                          <Route
                            path="/button-demo"
                            element={<ButtonExamples />}
                          />

                          {/* Settings */}
                          <Route
                            path="/settings"
                            element={
                              <div className="card card-body">
                                Settings Page
                              </div>
                            }
                          />

                          {/* Catch-all route for 404 */}
                          <Route
                            path="*"
                            element={
                              <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                  <h1 className="text-4xl font-bold text-text-primary mb-4">
                                    404
                                  </h1>
                                  <p className="text-text-secondary">
                                    Page not found
                                  </p>
                                </div>
                              </div>
                            }
                          />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </AuthProvider>
        </ThemeInitializer>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
