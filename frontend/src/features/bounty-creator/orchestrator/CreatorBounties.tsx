'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import BountyOverview from '@/features/bounty-creator/components/bounty-specific/BountyOverview';
import TabNavigation from '@/features/bounty-creator/components/tabs/TabNavigation';
import TabContent from '@/features/bounty-creator/components/tabs/TabContent';
import UserMenu from '@/components/layouts/UserMenu';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';
import { BountyData, TabKey, Tab } from '@/features/bounty-creator/types/types';
import { useBountyById } from '@/features/bounty-admin/hooks/bounty-actions/useGetBountyById';


interface BountiesClientProps {
  className?: string;
}

/**
 * Creator Orchestrator Component
 * Main interface for creators to view and participate in bounties
 */
const BountiesClient: React.FC<BountiesClientProps> = ({ className = '' }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bountyId = searchParams.get('bounty');
  const [activeTab, setActiveTab] = useState<TabKey>('submitted');

  // Fetch actual bounty data
  const { bounty: fetchedBounty, isLoading, isError, error } = useBountyById(bountyId);

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#222] relative ${className}`}>
        <AnimatedGridBackground />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="flex justify-center items-center h-64">
              <div className="text-white">Loading bounty details...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className={`min-h-screen bg-[#222] relative ${className}`}>
        <AnimatedGridBackground />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400">Error loading bounty: {error?.message || 'Unknown error'}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Map BountyStatus to BountyData status
  const mapBountyStatus = (status: string | undefined): 'active' | 'ended' | 'pending' | undefined => {
    switch (status) {
      case 'active':
      case 'paused':
      case 'completed':
        return 'active';
      case 'ended':
        return 'ended';
      case 'draft':
        return 'pending';
      default:
        return 'active';
    }
  };

  // Use fetched bounty data or fallback to mock data
  const bountyData: BountyData = fetchedBounty ? {
    title: fetchedBounty.title,
    reward: `${fetchedBounty.bountyPool.toLocaleString()} ${fetchedBounty.tokenSymbol}`,
    description: fetchedBounty.description,
    status: mapBountyStatus(fetchedBounty.status),
    endDate: fetchedBounty.endDate ? `Ends ${new Date(fetchedBounty.endDate).toLocaleDateString()}` : 'No end date'
  } : {
    title: 'Plasma Testnet Campaign',
    reward: '1,000 XPL',
    description: 'Create engaging TikTok content showcasing the Plasma testnet. Include #PlasmaTestnet hashtag and demonstrate key features of the platform.',
    status: 'active',
    endDate: 'Ends in 7 days'
  };

  // Tab configuration
  const tabs: Tab[] = [
    { key: 'submitted', label: 'My Submissions' },
    { key: 'claimed', label: 'Claimed Rewards' }
  ];



  // Handle tab change
  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  return (
    <div className={`min-h-screen bg-[#222] relative ${className}`}>
      {/* Animated Grid Background */}
      <AnimatedGridBackground />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
          
          {/* Navigation */}
          <nav className="relative z-10 mb-12">
            <div className="flex bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-3 shadow-sm items-center justify-between">
              <a href="/creator" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </span>
                <span className="text-base font-semibold tracking-tight hidden sm:block text-white font-space-grotesk">CreatorBounty</span>
              </a>
              <ul className="hidden sm:flex items-center gap-8 text-sm font-medium">
                <li><a href="/creator" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Dashboard</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 font-space-grotesk">Campaign</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Earnings</a></li>
              </ul>
              <div className="flex items-center space-x-3">
                <UserMenu userInitial="C" />
              </div>
            </div>
          </nav>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button 
                onClick={() => router.push('/creator')}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white font-space-grotesk">{bountyData.title}</h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400 font-space-grotesk">
                  <span>{bountyData.reward} reward</span>
                  <span>•</span>
                  <span>{bountyData.status}</span>
                  <span>•</span>
                  <span>{bountyData.endDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bounty Overview */}
          <div className="mb-8">
            <BountyOverview 
              bountyData={bountyData}
            />
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-white/10 mb-8">
            <TabNavigation 
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Tab Content */}
          <TabContent activeTab={activeTab} />
        </div>
      </main>
    </div>
  );
};

export default BountiesClient;
