import React from 'react';
import { Tab, TabKey } from '@/features/bounty/creators/types/types';

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  className?: string;
}

/**
 * Tab Navigation Component
 * Renders a clean horizontal tab navigation with active state management
 */
const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ""
}) => {
  const getTabButtonClass = (tabKey: TabKey) => {
    return activeTab === tabKey
      ? 'py-3 px-1 border-b-2 border-cyan-400 text-sm text-cyan-400 font-space-grotesk'
      : 'py-3 px-1 border-b-2 border-transparent text-sm text-gray-400 hover:text-gray-300 font-space-grotesk';
  };

  return (
    <nav className={`flex space-x-8 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={getTabButtonClass(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
