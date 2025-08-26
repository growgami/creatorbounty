import React, { useState } from 'react';
import { BountyData, SubmissionFormData } from '../../types/types';
import RequirementsList from './RequirementsList';
import ProgressBar from '../states/ProgressBar';
import SubmissionModal from '@/features/bounty/creators/components/submission/SubmissionModal';
import SubmissionStatus from './SubmissionStatus';
import { useSubmitEntry } from '@/features/bounty/creators/hooks/useSubmitEntry';
import { useAuth } from '@/features/auth/hooks/useAuth';
import AuraButton from '@/components/shared/ui/AuraButton';

interface BountyOverviewProps {
  bountyData: BountyData;
  bountyId: string;
  className?: string;
}

/**
 * Bounty Overview Component
 * Displays the main bounty information card with header, description, requirements, and action button
 */
const BountyOverview: React.FC<BountyOverviewProps> = ({
  bountyData,
  bountyId,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { submitEntry, hasActiveSubmission, latestSubmission } = useSubmitEntry();
  const { user } = useAuth();
  const defaultRequirements = [
    { id: '1', text: 'Include #PlasmaTestnet hashtag' },
    { id: '2', text: 'Video length ≥ 10 seconds' },
    { id: '3', text: 'Account age ≥ 30 days' },
    { id: '4', text: 'Original content only' }
  ];

  const handleSubmission = async (formData: SubmissionFormData) => {
    await submitEntry(formData);
    setIsModalOpen(false);
  };

  const getButtonText = () => {
    if (hasActiveSubmission) return 'Submission Pending';
    if (latestSubmission?.status === 'claimed') return 'Already Claimed';
    if (latestSubmission?.status === 'rejected') return 'Submit New Entry';
    return 'Submit Your Entry';
  };

  const isButtonDisabled = () => {
    return hasActiveSubmission || latestSubmission?.status === 'claimed';
  };



  return (
    <div className={`w-full ${className}`}>
      {/* Main Bounty Card */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-xl font-semibold tracking-tight text-white font-space-grotesk">{bountyData.title}</h2>
              <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-medium font-space-grotesk">
                {bountyData.status}
              </span>
            </div>
            <p className="text-gray-400 font-space-grotesk">{bountyData.description}</p>
          </div>
          
          {/* CTA Button in top right */}
          <div className="ml-6">
            <AuraButton 
              onClick={() => setIsModalOpen(true)}
              size="md"
              className="whitespace-nowrap"
              disabled={isButtonDisabled()}
            >
              {getButtonText()}
            </AuraButton>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <p className="text-2xl text-white font-space-grotesk font-semibold">{bountyData.reward}</p>
              <p className="text-gray-400 font-space-grotesk">Total reward</p>
            </div>
            <div className="w-px h-8 bg-gray-600"></div>
            <div>
              <p className="text-2xl text-white font-space-grotesk font-semibold">{bountyData.endDate}</p>
              <p className="text-gray-400 font-space-grotesk">Deadline</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional components that are specific to creator view */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
        {/* Progress Bar */}
        {bountyData.progress !== undefined && (
          <div className="mb-6">
            <ProgressBar progress={bountyData.progress} />
          </div>
        )}

        {/* Requirements */}
        <RequirementsList requirements={defaultRequirements} />

        {/* Submission Status */}
        {latestSubmission && (
          <div className="mb-6">
            <SubmissionStatus submission={latestSubmission} />
          </div>
        )}



        {/* Submission Modal */}
        {user && (
          <SubmissionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmission}
            requirements={defaultRequirements}
            bountyTitle={bountyData.title}
            bountyId={bountyId}
            creator={user.username}
            creatorPfp={user.userPfp}
          />
        )}
      </div>
    </div>
  );
};

export default BountyOverview;
