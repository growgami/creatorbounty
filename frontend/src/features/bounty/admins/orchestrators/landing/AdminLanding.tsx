'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FadeIn, SlideUp } from '@/components/effects/animations/FadeInTransition';
import AnalyticsWidget from '@/features/bounty/admins/components/dashboard/AnalyticsWidget';
import AnimatedGridBackground from '@/components/shared/backgrounds/AnimatedGridBackground';
import Navbar from '@/components/layouts/Navbar';
import CampaignCards from '@/components/containers/BountyCardContainer';
import AdminBounties from '@/features/bounty/admins/orchestrators/home/AdminBounties';
import { useBounties } from '@/features/bounty/admins/hooks/bounty-actions/useGetBounties';
import AuraButton from '@/components/shared/ui/AuraButton';
import BountyForm from '@/features/bounty/admins/components/forms/BountyFormModal';
import EnhancedToast from '@/components/shared/notifications/Toast';


interface LandingPageProps {
  className?: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  className = '' 
}) => {
  const searchParams = useSearchParams();
  const bounty = searchParams.get('bounty');
  const [showBountyForm, setShowBountyForm] = useState(false);
  const [toastData, setToastData] = useState({
    isVisible: false,
    variant: 'success' as 'success' | 'error',
    message: ''
  });
  
  // Use the bounties hook for fetching admin bounties
  const { bounties, isLoading, isError, error, refetch } = useBounties();
  
  
  // If bounty query param exists, show the bounty orchestrator
  if (bounty) {
    return <AdminBounties bounties={bounties} isLoading={isLoading} refetch={refetch} />;
  }

  const handleBountyClick = (bountyId: string) => {
    // Navigate to bounty detail view by adding query parameter
    const url = new URL(window.location.href);
    url.searchParams.set('bounty', bountyId);
    window.history.pushState({}, '', url.toString());
    // Trigger a re-render by updating the URL
    window.location.href = url.toString();
  };

  const showEnhancedToast = (variant: 'success' | 'error', message: string) => {
    setToastData({
      isVisible: true,
      variant,
      message
    });
  };

  const hideToast = () => {
    setToastData(prev => ({ ...prev, isVisible: false }));
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

  // Map bounties to campaigns with default values (actual counts will be fetched by each card)
  const campaigns = bounties.map(bounty => ({
    ...bounty,
    status: bounty.status || 'active', // Default to 'active' if status is undefined
    submissionsCount: 0, // This will be calculated by CampaignWithSubmissions component
    completionPercentage: 0 // This will be calculated by CampaignWithSubmissions component
  }));

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
            <div className="mb-12 flex justify-between items-center">
              <div>
                <h1 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight font-space-grotesk">Campaign Dashboard</h1>
                <p className="mt-6 text-lg max-w-lg text-gray-400 font-space-grotesk">Manage your testnet campaigns and track community submissions in real-time.</p>
              </div>
              <AuraButton 
                size="md"
                onClick={() => setShowBountyForm(true)}
              >
                Create New Bounty
              </AuraButton>
            </div>
          </FadeIn>

          {/* Main Content with Analytics Widget */}
          <div className="flex gap-8">
            {/* Left Column - Campaign Cards */}
            <div className="flex-1">
              <SlideUp delay={0.2}>
                {bounties.length > 0 ? (
                  <CampaignCards
                    variant="single"
                    campaigns={campaigns}
                    onCampaignClick={handleBountyClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-black/20 rounded-2xl border border-dashed border-white/10 p-8 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">No bounties yet</h3>
                    <p className="text-gray-400 mb-4">Create your first bounty to get started</p>
                    <AuraButton 
                      size="sm"
                      onClick={() => setShowBountyForm(true)}
                    >
                      Create Bounty
                    </AuraButton>
                  </div>
                )}
              </SlideUp>
            </div>

            {/* Right Column - Analytics Widget */}
            <SlideUp delay={0.3}>
              <AnalyticsWidget />
            </SlideUp>
          </div>
        </div>
      </main>

      {/* Enhanced Toast */}
      <EnhancedToast
        isVisible={toastData.isVisible}
        variant={toastData.variant}
        message={toastData.message}
        onHide={hideToast}
      />

      {/* Bounty Form Modal */}
      <BountyForm
        isOpen={showBountyForm}
        onClose={() => setShowBountyForm(false)}
        onSuccess={() => {
          setShowBountyForm(false);
          showEnhancedToast('success', 'Bounty created successfully!');
          refetch();
        }}
      />
    </div>
  );
};

export default LandingPage;
