import React from 'react';

type CampaignStatus = 'active' | 'completed' | 'draft' | 'paused';

interface BountyCardProps {
  // Campaign Information
  campaignTitle: string;
  campaignDescription?: string;
  
  // Bounty Details
  bountyPoolAmount: number;
  tokenSymbol?: string;
  
  // Progress Metrics
  submissionsCount: number;
  totalSubmissions?: number;
  completionPercentage?: number;
  
  // Status
  status: CampaignStatus;
  
  // Interaction
  onClick?: () => void;
  disabled?: boolean;
  
  // Styling
  className?: string;
}

const BountyCard: React.FC<BountyCardProps> = ({
  campaignTitle,
  campaignDescription,
  bountyPoolAmount,
  tokenSymbol = 'XPL',
  submissionsCount,
  totalSubmissions,
  completionPercentage,
  status,
  onClick,
  disabled = false,
  className = ''
}) => {
  const baseClasses = `
    transition-all 
    duration-300 
    ease-in-out
    w-80
    h-auto
    min-h-[320px]
    rounded-2xl
    relative
    overflow-hidden
    group
    ${onClick && !disabled ? 'cursor-pointer hover:scale-101' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const cardStyle = {
    background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
    boxShadow: `
      inset 3px 3px 6px rgba(255, 255, 255, 0.04),
      0 8px 24px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05)
    `
  };

  const combinedClasses = `${baseClasses} ${className}`.trim();

  const getStatusBadgeColor = (status: CampaignStatus) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-500 to-green-400 text-white shadow-lg shadow-green-500/25';
      case 'completed':
        return 'bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg shadow-blue-500/25';
      case 'paused':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black shadow-lg shadow-yellow-500/25';
      case 'draft':
        return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg shadow-gray-500/25';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg shadow-gray-500/25';
    }
  };

  return (
    <div 
      className={combinedClasses}
      style={cardStyle}
      onClick={disabled ? undefined : onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-white/5 blur-lg"></div>
      </div>

      {/* Status Badge - Top Center */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <span className={`
          inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider
          ${getStatusBadgeColor(status)}
        `}>
          {status}
        </span>
      </div>

      {/* Content Container - Following 8pt grid system */}
      <div className="relative z-10 p-6 pt-12 h-full flex flex-col">

        {/* Title Section - 16px margin bottom */}
        <div className="mb-4">
          <h3 className="text-white text-xl font-bold leading-tight group-hover:text-gray-100 transition-colors font-space-grotesk">
            {campaignTitle}
          </h3>
        </div>

        {/* Description Section - 16px margin bottom */}
        {campaignDescription && (
          <div className="mb-4">
            <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 font-space-grotesk">
              {campaignDescription}
            </p>
          </div>
        )}

        {/* Bounty Pool Section - 24px margin bottom for separation */}
        <div className="mb-6">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 font-space-grotesk">Bounty Pool</div>
          <div className="text-white text-2xl font-bold tracking-tight font-space-grotesk">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {bountyPoolAmount.toLocaleString()}
            </span>
            <span className="text-gray-400 text-base ml-2 font-medium">{tokenSymbol}</span>
          </div>
        </div>

        {/* Progress Section - At bottom with auto margin */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-500 text-xs uppercase tracking-wider font-space-grotesk">Progress</span>
            <span className="text-white text-sm font-semibold font-space-grotesk">
              {submissionsCount}{totalSubmissions ? `/${totalSubmissions}` : ''} submissions
            </span>
          </div>
          
          {/* Progress Bar */}
          {completionPercentage !== undefined && (
            <div className="relative">
              <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-white to-gray-300 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                />
              </div>
              <div className="text-gray-400 text-xs mt-2 text-right font-space-grotesk">
                {completionPercentage}% complete
              </div>
            </div>
          )}
        </div>

        {/* Hover Effect Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default BountyCard;
