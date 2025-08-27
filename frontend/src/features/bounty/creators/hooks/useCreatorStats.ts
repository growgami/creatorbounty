import { useQuery } from '@tanstack/react-query';

interface CreatorStatsData {
  platform: {
    activeCampaigns: number;
    totalCreators: string;
    xplRewardsPaid: string;
    totalRewardPool: number;
  };
  user?: {
    totalSubmissions: number;
    claimedSubmissions: number;
    pendingSubmissions: number;
    rejectedSubmissions: number;
    totalEarnings: number;
    completedBounties: number;
  };
}

interface UseCreatorStatsResponse {
  data: CreatorStatsData | undefined;
  platformStats: CreatorStatsData['platform'] | undefined;
  userStats: CreatorStatsData['user'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchCreatorStats = async (): Promise<CreatorStatsData> => {
  const response = await fetch('/api/bounty/creator/stats', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch creator statistics');
  }

  return response.json();
};

export const useCreatorStats = (): UseCreatorStatsResponse => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['creator-stats'],
    queryFn: fetchCreatorStats,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    platformStats: data?.platform,
    userStats: data?.user,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};