// src/pages/Login.tsx - Updated with toast error handling
import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { ThemeToggle } from "../components/ThemeToggle";
// import ThemeToggle from "../components/ThemeToggle";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, isLoading } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      // toast.error('Please enter both username and password'); // You can uncomment this if you want client-side validation
      return;
    }

    // The login function will handle showing toast messages for success/error
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-secondary py-xl px-md sm:px-lg lg:px-xl">
      <div className="max-w-md w-full space-y-xl">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-md">
            <ThemeToggle />
          </div>
          <h2 className="text-heading-1 text-text-primary">
            Sign in to IMZ RRDA
          </h2>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-md">
                <Input
                  id="username"
                  label="Username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />

                <div className="relative">
                  <Input
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-text-muted hover:text-text-secondary transition-colors duration-fast"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              // isLoading={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-body-small text-text-muted">
            Secure access to IMZ RRDA project management system
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
