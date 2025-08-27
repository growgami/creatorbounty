import { useFetchCreatorSubmissions } from './useFetchCreatorSubmissions';

interface SubmissionStatsData {
  activeCampaigns: number;
  totalCreators: string;
  xplRewardsPaid: number;
}

interface UseSubmissionStatsResponse {
  platformStats: SubmissionStatsData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const calculatePlatformStats = (submissions: any[]): SubmissionStatsData => {
  // Count unique bounty IDs to get active campaigns
  const uniqueBountyIds = new Set(submissions.map(sub => sub.bountyId));
  const activeCampaigns = uniqueBountyIds.size;
  
  // Count unique creators
  const uniqueCreators = new Set(submissions.map(sub => sub.creator));
  const totalCreators = uniqueCreators.size.toLocaleString();
  
  // Count claimed submissions for XPL rewards paid
  const xplRewardsPaid = submissions.filter(sub => sub.status === 'claimed').length;
  
  return {
    activeCampaigns,
    totalCreators,
    xplRewardsPaid,
  };
};

export const useSubmissionStats = (): UseSubmissionStatsResponse => {
  // Use the shared hook to get all submissions (no bountyId filter)
  const {
    allSubmissions,
    isLoading,
    isError,
    error,
  } = useFetchCreatorSubmissions();

  const platformStats = allSubmissions.length > 0 ? calculatePlatformStats(allSubmissions) : undefined;

  return {
    platformStats,
    isLoading,
    isError,
    error,
  };
};