// src/components/Layout.tsx - Updated with theme support
import React, { useState } from 'react';
import Navbar from './navbar.components';
import Sidebar from './sidebar.components';


interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-theme-secondary">
      <Navbar />
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <main className={`pt-16 transition-all duration-normal ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="container-fluid py-lg">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;