import { AppDownloadSection } from "../ui/AppDownloadSection";

export const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  showDownloadSection = true  // Change default to true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Background Pattern/Image */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url('/images/hex-pattern-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Download App Section */}
        {showDownloadSection && (
          <div className="hidden lg:flex lg:w-1/2 items-end p-8">
            <AppDownloadSection />
          </div>
        )}
        
        {/* Right Side - Auth Forms */}
        <div className={`flex items-center justify-center p-4 ${showDownloadSection ? 'lg:w-1/2 w-full' : 'w-full'}`}>
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};