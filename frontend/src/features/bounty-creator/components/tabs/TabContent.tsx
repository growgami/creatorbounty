import React from 'react';
import { TabKey } from '../../types/types';
import EmptyState from '../../../../components/ui/EmptyState';
import CreatorEmptyState from '../ui/CreatorEmptyState';

interface TabContentProps {
  activeTab: TabKey;
  className?: string;
}

/**
 * Tab Content Component
 * Renders different content based on the active tab
 */
const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  className = ""
}) => {
  const getTabContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            title="Ready to Create?"
            description="Click &apos;Submit Your Entry&apos; above to participate in the Plasma Testnet Campaign"
            iconBgColor="bg-blue-600/20"
            iconColor="text-blue-400"
          />
        );
      
      case 'submitted':
        return (
          <CreatorEmptyState />
        );
      
      case 'claimed':
        return (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No Rewards Yet"
            description="Your claimed bounty rewards and transaction history will appear here"
            iconBgColor="bg-green-600/20"
            iconColor="text-green-400"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {getTabContent()}
    </div>
  );
};

export default TabContent;
