'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import BackgroundCard from '@/components/ui/BackgroundCard';

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

interface CampaignCardsProps {
  className?: string;
  campaigns?: Campaign[];
  variant?: 'grid' | 'single';
  onCampaignClick?: (campaignId: string) => void;
  wrapperClassName?: string;
}

const CampaignCards: React.FC<CampaignCardsProps> = ({ 
  className = '',
  campaigns = [],
  variant = 'grid',
  onCampaignClick,
  wrapperClassName = ''
}) => {
  const router = useRouter();

  const defaultCampaign: Campaign = {
    id: 'plasma-testnet',
    title: 'Plasma Testnet Campaign',
    description: 'Community-driven testnet promotion on TikTok',
    bountyPool: 50000,
    tokenSymbol: 'XPL',
    submissionsCount: 78,
    totalSubmissions: 100,
    status: 'active',
    completionPercentage: 78
  };

  // Use provided campaigns or fallback to default
  const displayCampaigns = campaigns.length > 0 ? campaigns : [defaultCampaign];

  const handleCampaignClick = (campaignId: string) => {
    if (onCampaignClick) {
      onCampaignClick(campaignId);
    } else {
      router.push(`/bounty?campaign=${campaignId}`);
    }
  };

  const getStatusBadgeStyle = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return 'bg-cyan-500/20 text-[#2AD4FF] border border-cyan-500/30';
      case 'upcoming':
        return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
      case 'ended':
      case 'completed':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
    }
  };

  // Grid layout for multiple campaigns
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${wrapperClassName}`}>
        {displayCampaigns.map((campaign) => (
          <BackgroundCard
            key={campaign.id}
            variant="hover"
            onClick={() => handleCampaignClick(campaign.id)}
            className={`group ${className}`}
          >
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-space-grotesk ${getStatusBadgeStyle(campaign.status)}`}>
                {campaign.status}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-gray-300 transition-colors">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            </div>

            {/* Title & Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2 font-space-grotesk group-hover:text-gray-100 transition-colors">
                {campaign.title}
              </h3>
              <p className="text-gray-400 text-sm font-space-grotesk">
                {campaign.description}
              </p>
            </div>

            {/* Bounty Pool */}
            <div className="mb-6">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-medium font-space-grotesk">Bounty Pool</div>
              <div className="text-white text-2xl font-bold tracking-tight font-space-grotesk">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {campaign.bountyPool.toLocaleString()}
                </span>
                <span className="text-gray-400 text-base ml-2 font-medium">{campaign.tokenSymbol}</span>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-xs uppercase tracking-wider font-medium font-space-grotesk">Progress</span>
                <span className="text-white text-sm font-semibold font-space-grotesk">
                  {campaign.submissionsCount} / {campaign.totalSubmissions} submissions
                </span>
              </div>
              <div 
                className="w-full bg-gray-700/50 rounded-full h-2 mb-2 hover:bg-gray-600/50 transition-colors cursor-help" 
                title={`${campaign.submissionsCount} / ${campaign.totalSubmissions} submissions (${campaign.completionPercentage}%)`}
              >
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-cyan-300 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${campaign.completionPercentage}%` }}
                ></div>
              </div>
              <div className="text-gray-400 text-xs text-right font-space-grotesk">
                {campaign.completionPercentage}% complete
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"></div>
          </BackgroundCard>
        ))}
      </div>
    );
  }

  // Single campaign layout (admin style)
  const campaign = displayCampaigns[0];
  return (
    <div className={`flex-1 ${wrapperClassName}`}>
      <BackgroundCard
        variant="hover"
        onClick={() => handleCampaignClick(campaign.id)}
        className={`p-8 ${className}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold tracking-tight text-white font-space-grotesk">{campaign.title}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium font-space-grotesk ${getStatusBadgeStyle(campaign.status)}`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-gray-400 font-space-grotesk">{campaign.description}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400 font-space-grotesk">Progress</span>
              <span 
                className="font-medium text-white font-space-grotesk cursor-help" 
                title={`${campaign.submissionsCount} / ${campaign.totalSubmissions} submissions (${campaign.completionPercentage}%)`}
              >
                {campaign.submissionsCount} / {campaign.totalSubmissions} submissions
              </span>
            </div>
            <div 
              className="w-full bg-gray-700/50 rounded-full h-2 hover:bg-gray-600/50 transition-colors cursor-help" 
              title={`${campaign.submissionsCount} / ${campaign.totalSubmissions} submissions (${campaign.completionPercentage}%)`}
            >
              <div 
                className="bg-gradient-to-r from-cyan-400 to-cyan-300 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${campaign.completionPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <p className="text-2xl text-white font-space-grotesk font-semibold">{campaign.bountyPool.toLocaleString()}</p>
              <p className="text-gray-400 font-space-grotesk">{campaign.tokenSymbol} pool</p>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <p className="text-2xl text-white font-space-grotesk font-semibold">{campaign.submissionsCount * 2}</p>
              <p className="text-gray-400 font-space-grotesk">submissions</p>
            </div>
          </div>
        </div>
      </BackgroundCard>
    </div>
  );
};

export default CampaignCards;
