'use client';

import React, { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ReviewModal from '@/features/bounty/admins/components/submission-review/ReviewModal';
import EnhancedToast from '@/components/shared/notifications/Toast';
import AnimatedGridBackground from '@/components/shared/backgrounds/AnimatedGridBackground';
import UserMenu from '@/components/layouts/UserMenu';
import TabStrip from '@/features/bounty/admins/components/bounty-management/TabStrip';
import BulkActionBar from '@/features/bounty/admins/components/bounty-management/BulkActionBar';
import SubmissionList from '@/features/bounty/admins/components/bounty-management/SubmitterList';
import DeleteBountyButton from '@/features/bounty/admins/components/bounty-management/DeleteBountyButton';
import { useSubmission, AdminSubmission } from '@/features/bounty/admins/hooks/useSubmissionActions';
import { Bounty } from '@/models/Bounty';
import { Submission } from '@/models/Submissions';
import { useAdminBountyFull } from '@/features/bounty/admins/hooks/useAdminBountyFull';
import { useTotalSubmissionCount } from '@/features/bounty/admins/utils/totalSubmissionCount';

interface AdminBountiesProps {
  className?: string;
  bounties: Bounty[];
  isLoading: boolean;
  refetch: () => void;
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

// Helper function to convert Submission to AdminSubmission
const mapSubmissionToAdminSubmission = (submission: Submission): AdminSubmission => ({
  id: submission.id,
  creator: submission.creator,
  avatar: submission.creatorPfp || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
  submitted: formatRelativeTime(submission.createdAt),
  status: submission.status,
  txHash: submission.wallet_address,
  url: submission.submitted_url
});

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
    clearSelection,
    showEnhancedToast,
    hideToast,
  } = useSubmission();
  
  // Use optimized admin bounty full hook that fetches bounty + submissions with JOINs
  const { 
    bounty: singleBounty, 
    submissions: apiSubmissions,
    isLoading: isLoadingSingleBounty,
    isError: isSingleBountyError,
    error: singleBountyError,
    refetch: refetchSubmissions
  } = useAdminBountyFull(bountyId || '');
  
  // Local state for selected submission
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  
  // Group submissions by status and convert to AdminSubmission format
  // API now filters by bountyId server-side, so no need for client-side filtering
  const submissions: Record<string, AdminSubmission[]> = useMemo(() => {
    if (!apiSubmissions) return { pending: [], claimed: [], rejected: [] };
    
    return apiSubmissions.reduce((acc, submission) => {
      const adminSubmission = mapSubmissionToAdminSubmission(submission);
      if (acc[submission.status]) {
        acc[submission.status].push(adminSubmission);
      } else {
        acc[submission.status] = [adminSubmission];
      }
      return acc;
    }, { pending: [], claimed: [], rejected: [] } as Record<string, AdminSubmission[]>);
  }, [apiSubmissions]);
  
  // Calculate total submissions count using utility hook
  const totalSubmissionsCount = useTotalSubmissionCount(submissions);
  
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
  const handlePaymentSuccess = async (txHash: string) => {
    if (selectedSubmission) {
      try {
        // Update submission status to 'claimed' and add wallet address (txHash)
        const response = await fetch('/api/submissions', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedSubmission.id,
            status: 'claimed',
            wallet_address: txHash
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update submission: ${response.status}`);
        }

        const data = await response.json();
        console.log('Submission updated:', data.submission);
        
        showEnhancedToast('success', `Payment successful! Transaction: ${txHash.slice(0, 8)}...${txHash.slice(-8)}`);
        
        // Refetch submissions to get the updated data
        refetchSubmissions();
      } catch (error) {
        console.error('Error updating submission:', error);
        showEnhancedToast('error', 'Failed to update submission status');
      }
    }
  };

  // Wrapper functions to bridge the gap between hook functions and UI component expectations
  const handleBulkApproveWrapper = async () => {
    try {
      const selectedIds = Array.from(selectedSubmissions);
      let successCount = 0;
      let errorCount = 0;

      // Update each selected submission
      for (const submissionId of selectedIds) {
        try {
          const response = await fetch('/api/submissions', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: submissionId,
              status: 'claimed',
              wallet_address: null
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error updating submission ${submissionId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showEnhancedToast('success', `${successCount} submission${successCount > 1 ? 's' : ''} approved successfully`);
      }
      if (errorCount > 0) {
        showEnhancedToast('error', `Failed to approve ${errorCount} submission${errorCount > 1 ? 's' : ''}`);
      }

      clearSelection();
      refetchSubmissions();
    } catch (error) {
      console.error('Error in bulk approve:', error);
      showEnhancedToast('error', 'Failed to approve submissions');
    }
  };

  const handleBulkRejectWrapper = async () => {
    try {
      const selectedIds = Array.from(selectedSubmissions);
      let successCount = 0;
      let errorCount = 0;

      // Update each selected submission
      for (const submissionId of selectedIds) {
        try {
          const response = await fetch('/api/submissions', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: submissionId,
              status: 'rejected',
              wallet_address: null
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          console.error(`Error updating submission ${submissionId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        showEnhancedToast('success', `${successCount} submission${successCount > 1 ? 's' : ''} rejected successfully`);
      }
      if (errorCount > 0) {
        showEnhancedToast('error', `Failed to reject ${errorCount} submission${errorCount > 1 ? 's' : ''}`);
      }

      clearSelection();
      refetchSubmissions();
    } catch (error) {
      console.error('Error in bulk reject:', error);
      showEnhancedToast('error', 'Failed to reject submissions');
    }
  };

  const handleConfirmSubmissionWrapper = async (txHash?: string) => {
    if (selectedSubmission) {
      if (txHash) {
        await handlePaymentSuccess(txHash);
      } else {
        // If no txHash, just update status to claimed without wallet address
        try {
          const response = await fetch('/api/submissions', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: selectedSubmission.id,
              status: 'claimed',
              wallet_address: selectedSubmission.txHash || null
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to update submission: ${response.status}`);
          }

          showEnhancedToast('success', 'Submission approved successfully');
          refetchSubmissions();
        } catch (error) {
          console.error('Error updating submission:', error);
          showEnhancedToast('error', 'Failed to update submission status');
        }
      }
    }
  };

  const handleRejectSubmissionWrapper = async () => {
    if (selectedSubmission) {
      try {
        // Update submission status to 'rejected'
        const response = await fetch('/api/submissions', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedSubmission.id,
            status: 'rejected',
            wallet_address: null
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to update submission: ${response.status}`);
        }

        showEnhancedToast('success', 'Submission rejected successfully');
        refetchSubmissions();
      } catch (error) {
        console.error('Error updating submission:', error);
        showEnhancedToast('error', 'Failed to update submission status');
      }
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
                <UserMenu />
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
                    <span>{totalSubmissionsCount} / {currentBounty?.totalSubmissions || 0} submissions</span>
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
            loading={isLoadingSingleBounty}
            error={singleBountyError?.message || undefined}
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