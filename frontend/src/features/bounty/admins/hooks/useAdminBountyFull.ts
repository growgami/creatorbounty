import { useQuery } from '@tanstack/react-query';
import { Bounty } from '@/models/Bounty';
import { Submission } from '@/models/Submissions';

interface SubmissionWithUser extends Submission {
  creatorName?: string;
  creatorPfp?: string;
}

interface AdminBountyFullData {
  bounty: Bounty;
  submissions: SubmissionWithUser[];
  summary: {
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
  };
}

interface UseAdminBountyFullResponse {
  data: AdminBountyFullData | undefined;
  bounty: Bounty | undefined;
  submissions: SubmissionWithUser[];
  summary: AdminBountyFullData['summary'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

const fetchAdminBountyFull = async (bountyId: string): Promise<AdminBountyFullData> => {
  const response = await fetch(`/api/bounty/admin/${bountyId}/full`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Bounty not found');
    }
    throw new Error('Failed to fetch bounty details');
  }

  return response.json();
};

export const useAdminBountyFull = (bountyId: string): UseAdminBountyFullResponse => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-bounty-full', bountyId],
    queryFn: () => fetchAdminBountyFull(bountyId),
    enabled: !!bountyId,
    staleTime: 0,
    gcTime: 0,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    data,
    bounty: data?.bounty,
    submissions: data?.submissions || [],
    summary: data?.summary,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
};