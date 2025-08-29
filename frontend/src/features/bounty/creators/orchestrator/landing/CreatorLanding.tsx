'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FadeIn, SlideUp } from '@/components/effects/animations/FadeInTransition';
import Stats from '@/features/bounty/creators/components/states/Stats';
import AnimatedGridBackground from '@/components/shared/backgrounds/AnimatedGridBackground';
import BountiesClient from '@/features/bounty/creators/orchestrator/home/CreatorBounties';
import Navbar from '@/components/layouts/Navbar';
import CampaignCards from '@/components/containers/BountyCardContainer';
import { useCreatorBounties } from '@/features/bounty/creators/hooks/useCreatorBounties';

// CreatorBounty type from the API response
interface CreatorBounty {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  status?: string;
  endDate?: string;
  requirements: string[];
  submissionsCount: number;
  totalSubmissions: number;
  completionPercentage: number;
}

// Campaign type from BountyCardContainer
type CampaignStatus = 'active' | 'upcoming' | 'ended' | 'completed' | 'draft' | 'paused';

interface Campaign {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  submissionsCount: number;
  totalSubmissions: number;
  status: CampaignStatus;
  completionPercentage: number;
}

// Transform CreatorBounty to Campaign
const transformToCampaign = (bounty: CreatorBounty): Campaign => ({
  id: bounty.id,
  title: bounty.title,
  description: bounty.description,
  bountyPool: bounty.bountyPool,
  tokenSymbol: bounty.tokenSymbol,
  submissionsCount: bounty.submissionsCount,
  totalSubmissions: bounty.totalSubmissions,
  status: (bounty.status || 'active') as CampaignStatus,
  completionPercentage: bounty.completionPercentage
});

interface LandingPageProps {
  className?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  className = '' 
}) => {
  const searchParams = useSearchParams();
  const bounty = searchParams.get('bounty');
  const router = useRouter();
  const navigateToBounty = (data?: { bountyId?: string }) => {
    if (data?.bountyId) {
      router.push(`/creator?bounty=${data.bountyId}`);
    } else {
      router.push('/creator');
    }
  };
  const { bounties, isLoading, isError, error } = useCreatorBounties();
  
  // If bounty query param exists, show the bounty orchestrator
  if (bounty) {
    return <BountiesClient />;
  }

  const handleBountyClick = (bountyId: string) => {
    navigateToBounty({ bountyId });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#222] relative ${className}`}>
        <AnimatedGridBackground />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            <Navbar />
            <div className="flex justify-center items-center h-64">
              <div className="text-white">Loading bounties...</div>
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
            <Navbar />
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400">Error loading bounties: {error?.message || 'Unknown error'}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Transform bounties to campaigns - API now provides complete data including submission counts
  const campaigns = bounties.map(transformToCampaign);

  return (
    <div className={`min-h-screen bg-[#222] relative ${className}`}>

      {/* Animated Grid Background */}
      <AnimatedGridBackground />
      
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
          
          {/* Navigation */}
          <Navbar />

          {/* Hero Section */}
          <FadeIn delay={0.1}>
            <div className="mb-12">
              <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight font-space-grotesk">Featured Campaigns</h1>
              <p className="mt-6 text-lg max-w-lg text-gray-400 font-space-grotesk">Discover exciting bounty campaigns and start earning rewards for your creative content.</p>
            </div>
          </FadeIn>

          {/* Campaign Cards Grid */}
          <SlideUp delay={0.2}>
            <CampaignCards
              variant="grid"
              campaigns={campaigns}
              onCampaignClick={handleBountyClick}
            />
          </SlideUp>

          {/* Stats Section */}
          <Stats delay={0.6} />
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
