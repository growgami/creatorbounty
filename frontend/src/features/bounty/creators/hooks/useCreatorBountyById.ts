import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';

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

interface UserSubmission {
  id: string;
  submitted_url: string;
  status: 'pending' | 'claimed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  wallet_address?: string;
}

interface CreatorBountyData {
  bounty: CreatorBounty;
  userSubmission?: UserSubmission;
  canSubmit: boolean;
}

interface UseCreatorBountyByIdResponse {
  data: CreatorBountyData | undefined;
  bounty: CreatorBounty | undefined;
  userSubmission: UserSubmission | undefined;
  canSubmit: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchCreatorBountyById = async (bountyId: string): Promise<CreatorBountyData> => {
  const response = await fetch(`/api/bounty/creator/${bountyId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    if (response.status === 404) {
      throw new Error('Bounty not found or not active');
    }
    throw new Error('Failed to fetch bounty details');
  }

  return response.json();
};

export const useCreatorBountyById = (bountyId: string): UseCreatorBountyByIdResponse => {
  const { user } = useAuth();
  
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['creator-bounty', bountyId, user?.username],
    queryFn: () => fetchCreatorBountyById(bountyId),
    enabled: !!bountyId && !!user?.username,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    bounty: data?.bounty,
    userSubmission: data?.userSubmission,
    canSubmit: data?.canSubmit || false,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};