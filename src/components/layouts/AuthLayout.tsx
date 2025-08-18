import { AppDownloadSection } from "../ui/AppDownloadSection";
import { HexagonParticles } from "../ui/HexagonParticles";

interface AuthLayoutProps {
  children: React.ReactNode;
  showDownloadSection?: boolean;
  particlesVariant?: "network" | "trail" | "floating";
}
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  showDownloadSection = false,
  particlesVariant = "trail",
}) => {
  return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-black relative overflow-hidden">    <HexagonParticles
        variant={particlesVariant}
        className="opacity-60"
        id="auth-particles"
      />

      {/* Fallback Background Pattern (if particles fail to load) */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/images/hex-pattern-bg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Download App Section */}
        {showDownloadSection && (
          <div className="hidden lg:flex lg:w-1/2 items-end p-8">
            {/* <AppDownloadSection /> */}
          </div>
        )}

        {/* Right Side - Auth Forms */}
        <div
          className={`flex items-center justify-center p-4 ${
            showDownloadSection ? "lg:w-1/2 w-full" : "w-full"
          }`}
        >
          <div className="w-full max-w-md relative z-20">{children}</div>
        </div>
      </div>
    </div>
  );
};
