import { useQuery } from '@tanstack/react-query';
import { Submission } from '@/models/Submissions';

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

const fetchAllSubmissions = async (): Promise<Submission[]> => {
  const response = await fetch('/api/submissions');
  
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  
  const data = await response.json();
  return data.submissions || [];
};

const calculatePlatformStats = (submissions: Submission[]): SubmissionStatsData => {
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
  const {
    data: submissions,
    isLoading,
    isError,
    error,
  } = useQuery<Submission[], Error>({
    queryKey: ['submission-stats'],
    queryFn: fetchAllSubmissions,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });

  const platformStats = submissions ? calculatePlatformStats(submissions) : undefined;

  return {
    platformStats,
    isLoading,
    isError,
    error: error as Error | null,
  };
};