'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface CampaignNavigationData {
  campaignId?: string;
  campaignTitle?: string;
  status?: string;
}

interface UseCampaignReturn {
  navigateToCampaign: (data?: CampaignNavigationData) => void;
  navigateToHome: () => void;
}

export const useCampaign = (): UseCampaignReturn => {
  const router = useRouter();

  const navigateToCampaign = useCallback((data?: CampaignNavigationData) => {
    // If we have campaign data, we can pass it as query params
    if (data?.campaignId) {
      router.push(`/creator?campaign=${data.campaignId}`);
    } else {
      router.push('/creator');
    }
  }, [router]);

  const navigateToHome = useCallback(() => {
    router.push('/home');
  }, [router]);

  return {
    navigateToCampaign,
    navigateToHome
  };
};

export default useCampaign;