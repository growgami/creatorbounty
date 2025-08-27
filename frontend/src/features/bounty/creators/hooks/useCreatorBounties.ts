import { useQuery } from '@tanstack/react-query';

interface CreatorBounty {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  endDate?: string;
  requirements: string[];
  submissionsCount: number;
  totalSubmissions: number;
  completionPercentage: number;
}

interface CreatorBountiesData {
  bounties: CreatorBounty[];
  stats: {
    totalActiveBounties: number;
    totalRewardPool: number;
  };
}

interface UseCreatorBountiesResponse {
  data: CreatorBountiesData | undefined;
  bounties: CreatorBounty[];
  stats: CreatorBountiesData['stats'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchCreatorBounties = async (): Promise<CreatorBountiesData> => {
  const response = await fetch('/api/bounty/creator/active', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch active bounties');
  }

  return response.json();
};

export const useCreatorBounties = (): UseCreatorBountiesResponse => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['creator-bounties-active'],
    queryFn: fetchCreatorBounties,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    bounties: data?.bounties || [],
    stats: data?.stats,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};