// src/components/ui/Tabs.tsx - Custom Tabs Component
import React, { useState, useEffect } from 'react';
import { IconType } from 'react-icons';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: IconType;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  defaultActiveTab?: string;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: 'underlined' | 'pills' | 'cards' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  fullWidth?: boolean;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  allowKeyboardNavigation?: boolean;
  lazy?: boolean; // Only render active tab content
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'underlined',
  size = 'md',
  orientation = 'horizontal',
  fullWidth = false,
  className = '',
  tabsClassName = '',
  contentClassName = '',
  allowKeyboardNavigation = true,
  lazy = false
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id || ''
  );

  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  useEffect(() => {
    if (defaultActiveTab && defaultActiveTab !== internalActiveTab) {
      setInternalActiveTab(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  const handleTabClick = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.disabled) return;

    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (!allowKeyboardNavigation) return;

    const currentIndex = tabs.findIndex(tab => tab.id === tabId);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    const nextTab = tabs[nextIndex];
    if (nextTab && !nextTab.disabled) {
      handleTabClick(nextTab.id);
    }
  };

  const getSizeClasses = () => {
    const sizeMap = {
      sm: 'text-caption px-3 py-2',
      md: 'text-body-small px-4 py-3',
      lg: 'text-body px-5 py-4'
    };
    return sizeMap[size];
  };

  const getVariantClasses = (tab: TabItem, isActive: boolean) => {
    const baseClasses = `
      ${getSizeClasses()}
      font-medium transition-all duration-200 cursor-pointer
      flex items-center justify-center space-x-2
      ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${fullWidth ? 'flex-1' : ''}
    `;

    switch (variant) {
      case 'pills':
        return `
          ${baseClasses}
          rounded-full
          ${isActive 
            ? 'bg-primary-600 text-text-inverse shadow-md' 
            : 'text-text-secondary hover:text-text-primary hover:bg-theme-tertiary'
          }
        `;
      
      case 'cards':
        return `
          ${baseClasses}
          rounded-t-lg border-l border-r border-t
          ${isActive 
            ? 'bg-theme-primary text-text-primary border-border-medium border-b-theme-primary' 
            : 'bg-theme-tertiary text-text-secondary border-border-light hover:bg-theme-accent border-b-border-medium'
          }
        `;
      
      case 'minimal':
        return `
          ${baseClasses}
          ${isActive 
            ? 'text-primary-600 font-semibold' 
            : 'text-text-secondary hover:text-text-primary'
          }
        `;
      
      default: // underlined
        return `
          ${baseClasses}
          border-b-2 relative
          ${isActive 
            ? 'text-primary-600 border-primary-600' 
            : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-medium'
          }
        `;
    }
  };

  const getTabsContainerClasses = () => {
    const baseClasses = `
      ${orientation === 'vertical' ? 'flex-col' : 'flex-row'}
      ${variant === 'cards' ? '' : 'border-b border-border-light'}
      ${orientation === 'horizontal' ? 'flex' : 'flex flex-col'}
    `;

    return `${baseClasses} ${tabsClassName}`;
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`${orientation === 'vertical' ? 'flex' : 'block'} ${className}`}>
      {/* Tab Headers */}
      <div 
        className={getTabsContainerClasses()}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={getVariantClasses(tab, isActive)}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
            >
              {tab.icon && (
                <tab.icon className="w-4 h-4" />
              )}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div 
        className={`
          ${orientation === 'vertical' ? 'flex-1 ml-lg' : 'mt-lg'}
          ${contentClassName}
        `}
      >
        {lazy ? (
          // Lazy loading - only render active tab
          <div
            key={activeTab}
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            className="fade-in"
          >
            {activeTabContent}
          </div>
        ) : (
          // Render all tabs but hide inactive ones
          tabs.map((tab) => (
            <div
              key={tab.id}
              role="tabpanel"
              id={`tabpanel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              className={tab.id === activeTab ? 'block fade-in' : 'hidden'}
            >
              {tab.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Tabs;

// src/components/ui/TabPanel.tsx - Individual Tab Panel Component
interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-lg ${className}`}>
      {children}
    </div>
  );
};

// src/components/ui/TabGroup.tsx - Compound Component Pattern
interface TabGroupProps {
  children: React.ReactNode;
  className?: string;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> & {
  List: React.FC<TabListProps>;
  Tab: React.FC<TabProps>;
  Panels: React.FC<TabPanelsProps>;
  Panel: React.FC<TabPanelProps>;
} = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

TabGroup.List = ({ children, className = '' }) => (
  <div className={`flex border-b border-border-light ${className}`} role="tablist">
    {children}
  </div>
);

TabGroup.Tab = ({ children, className = '', disabled = false, onClick }) => (
  <button
    className={`
      px-4 py-3 text-body-small font-medium transition-all duration-200
      border-b-2 border-transparent
      ${disabled 
        ? 'opacity-50 cursor-not-allowed text-text-muted' 
        : 'text-text-secondary hover:text-text-primary hover:border-border-medium'
      }
      ${className}
    `}
    disabled={disabled}
    onClick={onClick}
    role="tab"
  >
    {children}
  </button>
);

TabGroup.Panels = ({ children, className = '' }) => (
  <div className={`mt-lg ${className}`}>
    {children}
  </div>
);

TabGroup.Panel = TabPanel;