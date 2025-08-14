import React from 'react';

export type FilterStatus = 'pending' | 'claimed' | 'rejected';

interface TabStripProps {
  currentTab: FilterStatus;
  onTabChange: (tab: FilterStatus) => void;
  className?: string;
}

const TabStrip: React.FC<TabStripProps> = ({
  currentTab,
  onTabChange,
  className = ''
}) => {
  const getTabButtonClass = (tab: FilterStatus) => {
    return currentTab === tab
      ? 'py-3 px-1 border-b-2 border-cyan-400 text-sm text-cyan-400 font-space-grotesk'
      : 'py-3 px-1 border-b-2 border-transparent text-sm text-gray-400 hover:text-gray-300 font-space-grotesk';
  };

  return (
    <div className={`border-b border-white/10 mb-8 ${className}`}>
      <nav className="flex space-x-8">
        <button className={getTabButtonClass('pending')} onClick={() => onTabChange('pending')}>
          Pending
        </button>
        <button className={getTabButtonClass('claimed')} onClick={() => onTabChange('claimed')}>
          Claimed
        </button>
        <button className={getTabButtonClass('rejected')} onClick={() => onTabChange('rejected')}>
          Rejected
        </button>
      </nav>
    </div>
  );
};

export default TabStrip;
