import { useQuery } from '@tanstack/react-query';

interface CreatorSubmission {
  id: string;
  bountyId: string;
  bountyTitle: string;
  submitted_url: string;
  status: 'pending' | 'claimed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  wallet_address?: string;
  bountyReward: number;
  tokenSymbol: string;
}

interface CreatorSubmissionsData {
  submissions: CreatorSubmission[];
  summary: {
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
    totalEarnings: number;
  };
}

interface UseCreatorSubmissionsResponse {
  data: CreatorSubmissionsData | undefined;
  submissions: CreatorSubmission[];
  summary: CreatorSubmissionsData['summary'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchCreatorSubmissions = async (bountyId?: string): Promise<CreatorSubmissionsData> => {
  const url = bountyId 
    ? `/api/bounty/creator/submissions?bountyId=${bountyId}`
    : '/api/bounty/creator/submissions';

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch submissions');
  }

  return response.json();
};

export const useCreatorSubmissions = (bountyId?: string): UseCreatorSubmissionsResponse => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: bountyId ? ['creator-submissions', bountyId] : ['creator-submissions'],
    queryFn: () => fetchCreatorSubmissions(bountyId),
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    submissions: data?.submissions || [],
    summary: data?.summary,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};