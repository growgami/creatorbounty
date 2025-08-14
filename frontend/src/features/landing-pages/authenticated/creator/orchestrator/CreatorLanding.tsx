'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { FadeIn, SlideUp } from '@/components/animations/FadeInTransition';
import Stats from '@/features/bounty-creator/components/ui/Stats';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';
import BountiesClient from '@/features/bounty-creator/orchestrator/CreatorBounties';
import Navbar from '@/components/layouts/Navbar';
import CampaignCards from '@/components/containers/BountyCards';
import { useCampaign } from '@/features/bounty-creator/hooks/useCampaign';

interface Campaign {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  submissionsCount: number;
  totalSubmissions: number;
  status: 'active' | 'upcoming' | 'ended';
  completionPercentage: number;
}

interface LandingPageProps {
  className?: string;
}

// Demo data for 90-second video walkthrough
const featuredCampaigns: Campaign[] = [
  {
    id: 'plasma-testnet',
    title: 'Plasma Testnet',
    description: 'Community-driven testnet promotion on TikTok',
    bountyPool: 50000,
    tokenSymbol: 'XPL',
    submissionsCount: 78,
    totalSubmissions: 100,
    status: 'active',
    completionPercentage: 78
  },
  {
    id: 'defi-showcase',
    title: 'DeFi Showcase',
    description: 'Show off your DeFi knowledge',
    bountyPool: 2500,
    tokenSymbol: 'XPL',
    submissionsCount: 8,
    totalSubmissions: 15,
    status: 'active',
    completionPercentage: 53
  },
  {
    id: 'nft-creation',
    title: 'NFT Creator',
    description: 'Create unique NFT content',
    bountyPool: 5000,
    tokenSymbol: 'XPL',
    submissionsCount: 0,
    totalSubmissions: 20,
    status: 'upcoming',
    completionPercentage: 0
  }
];

const LandingPage: React.FC<LandingPageProps> = ({ 
  className = '' 
}) => {
  const searchParams = useSearchParams();
  const campaign = searchParams.get('campaign');
  const { navigateToCampaign } = useCampaign();
  
  // If campaign query param exists, show the bounty orchestrator
  if (campaign) {
    return <BountiesClient />;
  }

  const handleCampaignClick = (campaignId: string) => {
    navigateToCampaign({ campaignId });
  };

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
              campaigns={featuredCampaigns}
              onCampaignClick={handleCampaignClick}
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
