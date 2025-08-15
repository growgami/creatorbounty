'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ReviewModal from '@/features/bounty-admin/components/modals/ReviewModal';
import EnhancedToast from '@/components/notifications/Toast';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';
import UserMenu from '@/components/layouts/UserMenu';
import TabStrip from '@/features/bounty-admin/components/bounty-specific/TabStrip';
import BulkActionBar from '@/features/bounty-admin/components/bounty-specific/BulkActionBar';
import SubmissionList from '@/features/bounty-admin/components/bounty-specific/SubmitterList';
import DeleteBountyButton from '@/features/bounty-admin/components/bounty-specific/DeleteBountyButton';
import { useSubmission, AdminSubmission } from '@/features/bounty-admin/hooks/useSubmissionActions';
import { Bounty } from '@/models/Bounty';
import { useBountyById } from '@/features/bounty-admin/hooks/bounty-actions/useGetBountyById';

interface AdminBountiesProps {
  className?: string;
  bounties: Bounty[];
  isLoading: boolean;
  refetch: () => void;
}

// Demo data for submissions
const initialSubmissions: Record<string, AdminSubmission[]> = {
  pending: [
    { id: '1', creator: '@creatorDemoA', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face', submitted: '2 hours ago', status: 'pending' },
    { id: '2', creator: '@creatorDemoB', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b4e2f31e?w=40&h=40&fit=crop&crop=face', submitted: '4 hours ago', status: 'pending' },
    { id: '3', creator: '@creatorDemoC', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', submitted: '6 hours ago', status: 'pending' },
    { id: '4', creator: '@creatorDemoD', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face', submitted: '8 hours ago', status: 'pending' },
    { id: '5', creator: '@creatorDemoE', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=40&h=40&fit=crop&crop=face', submitted: '10 hours ago', status: 'pending' },
  ],
  claimed: [
    { id: '6', creator: '@creatorPaid1', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', submitted: '1 day ago', status: 'claimed', txHash: '9e678418e32d5be7d820b31b51f7b875ecb99c0a5d1160c4550c9e09ad01b7ce' },
    { id: '7', creator: '@creatorPaid2', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=40&h=40&fit=crop&crop=face', submitted: '2 days ago', status: 'claimed', txHash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456' },
  ],
  rejected: []
};

/**
 * Admin Bounties Orchestrator Component
 * Main interface for admins to manage individual bounty submissions
 */
const AdminBounties: React.FC<AdminBountiesProps> = ({ 
  className = '', 
  bounties, 
  isLoading: isLoadingBounties, 
  refetch 
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bountyId = searchParams.get('bounty');
  
  // Use the submission hook for all submission-related state and logic
  const {
    currentTab,
    selectedSubmissions,
    toastData,
    isModalOpen,
    openSubmission,
    closeModal,
    switchTab,
    toggleSubmissionSelection,
    handleBulkApprove,
    handleBulkReject,
    clearSelection,
    showEnhancedToast,
    hideToast,
    handleConfirmSubmission,
    handleRejectSubmission
  } = useSubmission();
  
  // Fetch single bounty when bountyId is present
  const { 
    bounty: singleBounty, 
    isLoading: isLoadingSingleBounty,
    isError: isSingleBountyError,
    error: singleBountyError
  } = useBountyById(bountyId);
  
  // Local state for selected submission
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  
  // Local state for submissions data
  const [submissions, setSubmissions] = useState<Record<string, AdminSubmission[]>>(initialSubmissions);
  
  // Use single bounty if available, otherwise find in bounties list
  const currentBounty = singleBounty || bounties.find((b: Bounty) => b.id === bountyId);
  const isLoading = isLoadingBounties || isLoadingSingleBounty;
  
  // Show loading state while bounties are being fetched
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
  
  // Show error state for single bounty fetch
  if (isSingleBountyError && bountyId) {
    return (
      <div className={`min-h-screen bg-[#222] relative ${className}`}>
        <AnimatedGridBackground />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="bg-[#101010] rounded-3xl border border-white/10 p-6 sm:p-10 lg:p-14 shadow-[0_8px_32px_rgba(0,0,0,0.3),_0_0_0_1px_rgba(255,255,255,0.05)]">
            <div className="flex justify-center items-center h-64">
              <div className="text-red-400">Error loading bounty: {singleBountyError?.message || 'Unknown error'}</div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  // Helper function to open submission modal
  const openSubmissionModal = (submission: AdminSubmission) => {
    setSelectedSubmission(submission);
    openSubmission(submission.id, submission.status === 'pending' ? 'pending' : submission.status === 'claimed' ? 'approved' : 'rejected');
  };

  // Function to handle successful payment and update submission with transaction hash
  const handlePaymentSuccess = (txHash: string) => {
    if (selectedSubmission) {
      setSubmissions(prev => {
        const updated = { ...prev };
        updated.pending = updated.pending.filter(sub => sub.id !== selectedSubmission.id);
        updated.claimed = [
          ...updated.claimed,
          {
            ...selectedSubmission,
            status: 'claimed' as const,
            txHash: txHash
          }
        ];
        return updated;
      });
      showEnhancedToast('success', `Payment successful! Transaction: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`);
    }
  };

  // Wrapper functions to bridge the gap between hook functions and UI component expectations
  const handleBulkApproveWrapper = () => {
    const showToast = (variant: 'success' | 'error', message: string) => {
      showEnhancedToast(variant, message);
    };
    handleBulkApprove(submissions, selectedSubmissions, showToast);
  };

  const handleBulkRejectWrapper = () => {
    const showToast = (variant: 'success' | 'error', message: string) => {
      showEnhancedToast(variant, message);
    };
    handleBulkReject(submissions, selectedSubmissions, showToast);
  };

  const handleConfirmSubmissionWrapper = (txHash?: string) => {
    if (selectedSubmission) {
      if (txHash) {
        handlePaymentSuccess(txHash);
      }
      
      const updatedSubmission = {
        ...selectedSubmission,
        txHash: txHash || selectedSubmission.txHash
      };
      handleConfirmSubmission(updatedSubmission, submissions, showEnhancedToast);
    }
  };

  const handleRejectSubmissionWrapper = () => {
    if (selectedSubmission) {
      handleRejectSubmission(selectedSubmission, submissions, showEnhancedToast);
    }
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
              <a href="/admin" className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon>
                    <circle cx="12" cy="12" r="2"></circle>
                  </svg>
                </span>
                <span className="text-base font-semibold tracking-tight hidden sm:block text-white font-space-grotesk">CreatorBounty</span>
              </a>
              <ul className="hidden sm:flex items-center gap-8 text-sm font-medium">
                <li><a href="/admin" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Dashboard</a></li>
                <li><a href="#" className="text-white hover:text-gray-300 font-space-grotesk">Campaign</a></li>
                <li><a href="#" className="text-gray-400 hover:text-gray-300 font-space-grotesk">Analytics</a></li>
              </ul>
              <div className="flex items-center space-x-3">
                <UserMenu userInitial="A" />
              </div>
            </div>
          </nav>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => router.push('/admin')}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white font-space-grotesk">
                    {currentBounty ? currentBounty.title : 'Bounty Management'}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400 font-space-grotesk">
                    <span>{currentBounty?.submissionsCount || 0} submissions</span>
                    <span>•</span>
                    <span>{currentBounty?.bountyPool?.toLocaleString() || 0} {currentBounty?.tokenSymbol || 'tokens'} pool</span>
                    <span>•</span>
                    <span>{currentBounty?.status || 'active'}</span>
                  </div>
                </div>
              </div>
              
              {/* Delete Button */}
              {currentBounty && (
                <DeleteBountyButton
                  bountyId={currentBounty.id}
                  bountyTitle={currentBounty.title}
                  onDeleteSuccess={() => {
                    showEnhancedToast('success', 'Bounty deleted successfully');
                    router.push('/admin');
                    refetch();
                  }}
                  onDeleteError={(error) => {
                    showEnhancedToast('error', error);
                  }}
                />
              )}
            </div>
          </div>

          {/* Tab Strip */}
          <TabStrip currentTab={currentTab} onTabChange={switchTab} />

          {/* Bulk Actions Bar */}
          {selectedSubmissions.size > 0 && currentTab === 'pending' && (
            <BulkActionBar
              selectedCount={selectedSubmissions.size}
              onApprove={handleBulkApproveWrapper}
              onReject={handleBulkRejectWrapper}
              onClear={clearSelection}
            />
          )}

          {/* Submissions List */}
          <SubmissionList
            submissions={submissions[currentTab] || []}
            currentTab={currentTab}
            selectedSubmissions={selectedSubmissions}
            onToggleSelection={toggleSubmissionSelection}
            onOpenModal={openSubmissionModal}
          />
        </div>
      </main>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => {
          closeModal();
          setSelectedSubmission(null);
        }}
        submission={selectedSubmission}
        onConfirm={handleConfirmSubmissionWrapper}
        onReject={handleRejectSubmissionWrapper}
      />

      {/* Enhanced Toast */}
      <EnhancedToast
        isVisible={toastData.isVisible}
        variant={toastData.variant}
        message={toastData.message}
        action={toastData.undoAction ? { label: 'Undo', onClick: toastData.undoAction } : undefined}
        onHide={hideToast}
      />
    </div>
  );
};

export default AdminBounties;