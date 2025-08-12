// src/components/layout.components.tsx - Updated with proper spacing management
import React from 'react';
import Sidebar from './sidebar.components';
import Navbar from './navbar.components';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Layout */}
      <div className="flex">
        {/* Sidebar - Fixed position */}
        <div className="fixed left-0 top-0 z-40 h-screen w-[69px]">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ml-[69px] flex flex-col min-h-screen">
          {/* Navbar - Fixed at top */}
          <div className="sticky top-0 z-30 h-[53.93px]">
            <Navbar />
          </div>

          {/* Page Content - Scrollable with consistent spacing */}
          <main className="flex-1 overflow-auto ">
            {/* Content wrapper with consistent padding */}
            <div className="w-full max-w-none bg-[#EEEEEE] px-2 pt-2 h-full"
            >
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Navbar */}
        <div className="sticky top-0 z-30">
          <Navbar />
        </div>

        {/* Mobile Content */}
        <main className="flex-1 overflow-auto pb-16">
          <div className="w-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <div className="bg-[#2C4FA0] border-t border-white/20 h-16">
            <div className="flex justify-around items-center h-full px-4">
              <button className="flex flex-col items-center justify-center text-white/70 hover:text-white">
                <div className="w-5 h-5 mb-1">
                  {/* Home icon */}
                </div>
                <span className="text-xs">Home</span>
              </button>
              {/* Add more mobile nav items */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
