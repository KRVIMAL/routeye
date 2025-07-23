// src/components/Navbar.tsx - Updated with theme support
import React, { useState } from 'react';
import { FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from './ThemeToggle';
// import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <nav className="bg-theme-primary shadow-sm border-b border-border-light fixed w-full top-0 z-fixed">
      <div className="flex items-center justify-between h-16 px-lg">
        <div className="flex items-center">
          <h1 className="text-heading-3 text-text-primary">HPRRDA DPIU</h1>
        </div>

        <div className="flex items-center space-x-md">
          <ThemeToggle />

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 text-text-secondary hover:text-text-primary focus:outline-none transition-colors duration-fast"
            >
              <div className="flex items-center space-x-2">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                    <FiUser className="w-4 h-4 text-text-inverse" />
                  </div>
                )}
                <span className="text-body-small font-medium text-text-primary">{user?.name}</span>
                <FiChevronDown className="w-4 h-4" />
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-primary rounded-lg shadow-lg border border-border-light z-dropdown">
                <div className="py-1">
                  <div className="px-md py-sm border-b border-border-light">
                    <div className="text-body-small font-medium text-text-primary">{user?.name}</div>
                    <div className="text-caption text-text-muted">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-md py-sm text-body-small text-text-secondary hover:bg-theme-tertiary hover:text-text-primary transition-colors duration-fast"
                  >
                    <FiLogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;