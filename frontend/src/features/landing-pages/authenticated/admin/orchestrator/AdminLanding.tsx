'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { FadeIn, SlideUp } from '@/components/animations/FadeInTransition';
import ReviewModal from '@/features/bounty-admin/components/modals/ReviewModal';
import EnhancedToast from '@/components/notifications/Toast';
import AnalyticsWidget from '@/features/bounty-admin/components/dashboard/AnalyticsWidget';
import AnimatedGridBackground from '@/components/backgrounds/AnimatedGridBackground';
import Navbar from '@/components/layouts/Navbar';
import TabStrip from '@/features/bounty-admin/components/dashboard/TabStrip';
import BulkActionBar from '@/features/bounty-admin/components/ui/BulkActionBar';
import CampaignCards from '@/components/containers/BountyCards';
import SubmissionList from '@/features/bounty-admin/components/dashboard/SubmissionList';
import { useSubmission, AdminSubmission } from '@/features/bounty-admin/hooks/useSubmissionActions';



interface LandingPageProps {
  className?: string;
}

// Demo data for 90-second video walkthrough
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

const LandingPage: React.FC<LandingPageProps> = ({ 
  className = '' 
}) => {
  const searchParams = useSearchParams();
  const campaign = searchParams.get('campaign');
  
  const [currentView, setCurrentView] = useState<'dashboard' | 'campaign'>('dashboard');
  
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
  
  // Local state for selected submission (using AdminSubmission type for consistency)
  const [selectedSubmission, setSelectedSubmission] = useState<AdminSubmission | null>(null);
  
  // Local state for submissions data (will be moved to hook in future iterations)
  const [submissions, setSubmissions] = useState<Record<string, AdminSubmission[]>>(initialSubmissions);

  // Helper function to open submission modal
  const openSubmissionModal = (submission: AdminSubmission) => {
    setSelectedSubmission(submission);
    // Use the hook's openSubmission function to handle modal opening and data loading
    openSubmission(submission.id, submission.status === 'pending' ? 'pending' : submission.status === 'claimed' ? 'approved' : 'rejected');
  };

  // Function to handle successful payment and update submission with transaction hash
  const handlePaymentSuccess = (txHash: string) => {
    if (selectedSubmission) {
      setSubmissions(prev => {
        const updated = { ...prev };
        // Move submission from pending to claimed and add transaction hash
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
      // If we have a transaction hash, update the submission with it
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
          
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div>
              {/* Navigation */}
              <Navbar />

              {/* Hero Section */}
              <FadeIn delay={0.1}>
                <div className="mb-12">
                  <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight font-space-grotesk">Campaign Dashboard</h1>
                  <p className="mt-6 text-lg max-w-lg text-gray-400 font-space-grotesk">Manage your testnet campaigns and track community submissions in real-time.</p>
                </div>
              </FadeIn>

              {/* Main Content with Analytics Widget */}
              <div className="flex gap-8">
                {/* Left Column - Campaign Card */}
                <div className="flex-1">
                  <SlideUp delay={0.2}>
                    <CampaignCards
                      variant="single"
                      campaigns={[{
                        id: 'plasma-testnet',
                        title: 'Plasma Testnet Campaign',
                        description: 'Community-driven testnet promotion on TikTok',
                        bountyPool: 50000,
                        tokenSymbol: 'XPL',
                        submissionsCount: 78,
                        totalSubmissions: 100,
                        status: 'active',
                        completionPercentage: 78
                      }]}
                      onCampaignClick={() => setCurrentView('campaign')}
                    />
                  </SlideUp>
                </div>

                {/* Right Column - Analytics Widget */}
                <SlideUp delay={0.3}>
                  <AnalyticsWidget />
                </SlideUp>
              </div>
            </div>
          )}

          {/* Campaign Detail View */}
          {currentView === 'campaign' && (
            <div>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center space-x-4 mb-4">
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-white" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white font-space-grotesk">Plasma Testnet Campaign</h1>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400 font-space-grotesk">
                      <span>156 submissions</span>
                      <span>•</span>
                      <span>50,000 XPL pool</span>
                      <span>•</span>
                      <span>Create engaging TikTok content</span>
                    </div>
                  </div>
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
          )}
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

export default LandingPage;
